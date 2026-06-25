import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

// GET /api/admin/customers - Get all customers with stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all users with their order statistics
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    // Get order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id }).lean();
        
        const orderCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const lastOrder = orders.length > 0
          ? orders.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].createdAt
          : null;

        return {
          ...user,
          orderCount,
          totalSpent,
          lastOrder,
        };
      })
    );

    // Sort by total spent (highest first)
    usersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
