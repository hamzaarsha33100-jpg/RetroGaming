import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { generateOrderId, calculateTax, calculateShipping } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import User from "@/models/User";
import Coupon from "@/models/Coupon";
import { getSettings } from "@/lib/settings";
import { decrementStock, checkAndAlertStock } from "@/lib/inventory";
import { createAdminNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};

    if (session.user.role !== "admin") {
      query.user = session.user.id;
    }

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(orders)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { items, shippingAddress, billingAddress, paymentIntentId, couponCode, paymentMethod, paymentStatus } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.name} is no longer available` },
          { status: 400 }
        );
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = product.salePrice || product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.mainImage,
        price,
        quantity: item.quantity,
        total,
      });

      // Reduce stock via inventory helper
      const stockResult = await decrementStock(
        product._id.toString(),
        item.quantity
      );
      if (!stockResult.ok) {
        return NextResponse.json(
          { error: stockResult.error || `Failed to update stock for ${product.name}` },
          { status: 400 }
        );
      }
      const newStock = product.stockQuantity - item.quantity;
      checkAndAlertStock(product._id.toString(), newStock).catch(() => undefined);
    }

    const settings = await getSettings();
    const tax = calculateTax(subtotal, settings.taxRate / 100);
    const shippingCost = calculateShipping(subtotal, settings.freeShippingThreshold);
    const total = subtotal + tax + shippingCost;

    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      user: session.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      tax,
      shippingCost,
      discount: 0,
      total,
      couponCode,
      paymentIntentId,
      paymentMethod: paymentMethod || "online",
      paymentStatus:
        paymentMethod === "cod"
          ? "pending"
          : paymentStatus || "paid",
      status: "pending",
      timeline: [
        {
          status: "pending",
          message: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    });

    // Increment coupon usage if a coupon was applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Send confirmation email
    const user = await User.findById(session.user.id);
    if (user) {
      sendOrderConfirmationEmail({
        to: user.email,
        orderNumber: order.orderId,
        customerName: user.name,
        items: orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
        total: order.total,
        shippingAddress: `${shippingAddress.address1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`,
      }).catch(console.error);
    }

    // Create admin notification for the new order
    createAdminNotification({
      type: "new_order",
      title: "New order received",
      message: `Order #${order.orderId} (${orderItems.length} item${orderItems.length > 1 ? "s" : ""}) for ${formatTotal(order.total)}`,
      severity: "success",
      link: "/admin/orders",
      data: { orderId: order.orderId },
    }).catch(() => undefined);

    // Notify admin for failed payments if applicable
    if (order.paymentStatus === "failed") {
      createAdminNotification({
        type: "failed_payment",
        title: "Failed payment",
        message: `Payment for order #${order.orderId} failed.`,
        severity: "danger",
        link: "/admin/orders",
        data: { orderId: order.orderId },
      }).catch(() => undefined);
    }

    return NextResponse.json(
      { success: true, data: JSON.parse(JSON.stringify(order)) },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function formatTotal(total: number): string {
  return `$${Number(total || 0).toFixed(2)}`;
}
