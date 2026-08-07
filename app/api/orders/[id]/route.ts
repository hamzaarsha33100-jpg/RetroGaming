import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";
import { restoreStock, notifyBackInStock } from "@/lib/inventory";
import { createAdminNotification } from "@/lib/notifications";
import {
  sendOrderProcessingEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendRefundConfirmationEmail,
  sendPaymentSuccessfulEmail,
} from "@/lib/email";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const query: Record<string, unknown> = { _id: id };
    if (session.user.role !== "admin") {
      query.user = session.user.id;
    }

    const order = await Order.findOne(query)
      .populate("user", "name email")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { status, paymentStatus, trackingNumber, trackingUrl, notes } = body;

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      order.timeline.push({
        status,
        message: getStatusMessage(status),
        timestamp: new Date(),
      });
      updateData.timeline = order.timeline;

      if (status === "delivered") {
        updateData.deliveredAt = new Date();
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (notes !== undefined) updateData.notes = notes;

    // Stock restore on cancellation or refund (idempotent via stockRestored flag)
    const shouldRestoreStock =
      (status === "cancelled" || paymentStatus === "refunded") &&
      !order.stockRestored &&
      order.items.length > 0;

    if (shouldRestoreStock) {
      for (const item of order.items) {
        await restoreStock(item.product.toString(), item.quantity);
      }
      updateData.stockRestored = true;

      // Products may have come back in stock — notify waiting customers
      for (const item of order.items) {
        notifyBackInStock(item.product.toString()).catch(() => undefined);
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user", "name email");

    // Send lifecycle emails + admin notifications
    const customer = (order.user as unknown as {
      email?: string;
      name?: string;
    }) || {};
    const customerEmail = customer.email || "";
    const customerName = customer.name || "there";

    if (customerEmail) {
      if (status === "processing") {
        sendOrderProcessingEmail({
          to: customerEmail,
          orderNumber: order.orderId,
          customerName,
        }).catch(() => undefined);
      } else if (status === "shipped") {
        sendOrderShippedEmail({
          to: customerEmail,
          orderNumber: order.orderId,
          customerName,
          trackingNumber: trackingNumber || order.trackingNumber || undefined,
          carrier: notes || undefined,
        }).catch(() => undefined);
      } else if (status === "delivered") {
        sendOrderDeliveredEmail({
          to: customerEmail,
          orderNumber: order.orderId,
          customerName,
        }).catch(() => undefined);
      } else if (status === "cancelled") {
        sendOrderCancelledEmail({
          to: customerEmail,
          orderNumber: order.orderId,
          customerName,
        }).catch(() => undefined);
      }

      if (paymentStatus === "paid" && order.paymentStatus !== "paid") {
        sendPaymentSuccessfulEmail({
          to: customerEmail,
          orderNumber: order.orderId,
          customerName,
          amount: order.total,
          method: order.paymentMethod || "online",
        }).catch(() => undefined);
      }

      if (paymentStatus === "refunded") {
        sendRefundConfirmationEmail({
          to: customerEmail,
          orderNumber: order.orderId,
          customerName,
          amount: order.total,
        }).catch(() => undefined);
      }
    }

    if (shouldRestoreStock) {
      createAdminNotification({
        type: "pending_order",
        title: "Stock restored",
        message: `Stock was restored for order #${order.orderId} (${order.items.length} item${order.items.length > 1 ? "s" : ""}).`,
        severity: "info",
        link: "/admin/orders",
        data: { orderId: order.orderId },
      }).catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(updatedOrder)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Restore stock on deletion if not already restored
    if (!order.stockRestored && order.items.length > 0) {
      for (const item of order.items) {
        await restoreStock(item.product.toString(), item.quantity);
      }
      for (const item of order.items) {
        notifyBackInStock(item.product.toString()).catch(() => undefined);
      }
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "Order placed and waiting for processing",
    confirmed: "Order has been confirmed",
    processing: "Order is being processed and prepared",
    shipped: "Order has been shipped and is on its way",
    delivered: "Order has been delivered successfully",
    cancelled: "Order has been cancelled",
  };
  return messages[status] || `Order status updated to ${status}`;
}
