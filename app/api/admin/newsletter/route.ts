import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { auth } from "@/lib/auth";

// GET /api/admin/newsletter - List subscribers (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const subscribers = await Newsletter.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(subscribers)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

// DELETE /api/admin/newsletter - Remove subscriber (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    await connectDB();
    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subscriber removed" });
  } catch {
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}
