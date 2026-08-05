import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Banner from "@/models/Banner";
import { auth } from "@/lib/auth";

// PUT /api/admin/banners/[id]/reorder - Reorder banner (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { direction } = body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const swapBanner = await Banner.findOne({
      sortOrder: direction === "up" ? banner.sortOrder - 1 : banner.sortOrder + 1,
    });

    if (!swapBanner) {
      return NextResponse.json({ error: "Cannot reorder" }, { status: 400 });
    }

    const tempOrder = banner.sortOrder;
    banner.sortOrder = swapBanner.sortOrder;
    swapBanner.sortOrder = tempOrder;

    await banner.save();
    await swapBanner.save();

    return NextResponse.json({ message: "Banner reordered successfully" });
  } catch (error) {
    console.error("Error reordering banner:", error);
    return NextResponse.json({ error: "Failed to reorder banner" }, { status: 500 });
  }
}
