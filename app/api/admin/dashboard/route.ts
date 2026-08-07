import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Newsletter from "@/models/Newsletter";
import CountdownTimer from "@/models/CountdownTimer";
import Coupon from "@/models/Coupon";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      totalCustomers,
      lastMonthCustomers,
      totalProducts,
      recentOrders,
      orderStatusStats,
      topProducts,
      revenueByMonth,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({
        role: "customer",
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Product.countDocuments({ isActive: true }),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.total" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $project: { name: "$product.name", image: "$product.mainImage", totalSold: 1, revenue: 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
    ]);

    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = lastMonthRevenue[0]?.total || 0;

    const thisMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const thisMonthCustomers = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfMonth },
    });

    // === Alerts for the dashboard notification center ===
    const settings = await getSettings();
    const threshold = settings.inventory?.lowStockThreshold ?? 5;

    const [lowStockCount, outOfStockCount, pendingOrdersCount, failedPaymentsCount, newSubscribers, endingSoonCount, expiredDiscountsCount] =
      await Promise.all([
        Product.countDocuments({
          stockQuantity: { $gt: 0, $lte: threshold },
          isActive: true,
        }),
        Product.countDocuments({
          stockQuantity: { $lte: 0 },
          isActive: true,
        }),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ paymentStatus: "failed" }),
        Newsletter.countDocuments({
          isActive: true,
          createdAt: { $gte: startOfMonth },
        }),
        CountdownTimer.countDocuments({
          isActive: true,
          isEnded: false,
          endDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        }),
        Coupon.countDocuments({
          isActive: true,
          expiresAt: { $lte: new Date() },
        }),
      ]);

    const alerts = {
      lowStockCount,
      outOfStockCount,
      pendingOrdersCount,
      failedPaymentsCount,
      newSubscribers,
      endingSoonCount,
      expiredDiscountsCount,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue: currentRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          revenueChange: prevRevenue
            ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
            : 0,
          ordersChange: lastMonthOrders
            ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
            : 0,
          customersChange: lastMonthCustomers
            ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
            : 0,
          productsChange: 0,
        },
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        orderStatusStats,
        topProducts: JSON.parse(JSON.stringify(topProducts)),
        revenueByMonth,
        alerts,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
