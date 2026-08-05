import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

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
    const { status, trackingNumber, trackingUrl } = body;

    const order = await Order.findById(id);
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
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user", "name email");

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(updatedOrder)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "Order placed and waiting for processing",
    processing: "Order is being processed and prepared",
    shipped: "Order has been shipped and is on its way",
    delivered: "Order has been delivered successfully",
    cancelled: "Order has been cancelled",
  };
  return messages[status] || `Order status updated to ${status}`;
}
