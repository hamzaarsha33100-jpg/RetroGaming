import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdminNotification from "@/models/AdminNotification";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const unreadOnly = searchParams.get("unread") === "true";

    await connectDB();

    const query: Record<string, unknown> = {};
    if (unreadOnly) query.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      AdminNotification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      AdminNotification.countDocuments({ isRead: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(notifications)),
      unreadCount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    await connectDB();

    if (all) {
      await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    } else if (id) {
      await AdminNotification.findByIdAndUpdate(id, { isRead: true });
    }

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    return NextResponse.json({ success: true, unreadCount });
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    await connectDB();

    if (all) {
      await AdminNotification.deleteMany({});
    } else if (id) {
      await AdminNotification.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}
