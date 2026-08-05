import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Banner from "@/models/Banner";
import { auth } from "@/lib/auth";

function mapBannerToClient(banner: Record<string, unknown>) {
  return {
    ...banner,
    order: banner.sortOrder,
  };
}

// GET /api/admin/banners - Get all banners (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const banners = await Banner.find().sort({ sortOrder: 1 }).lean();

    return NextResponse.json(
      banners.map((b) => mapBannerToClient(b as Record<string, unknown>))
    );
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners - Create banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    const lastBanner = await Banner.findOne().sort({ sortOrder: -1 });
    const sortOrder = lastBanner ? lastBanner.sortOrder + 1 : 0;

    const banner = await Banner.create({
      ...body,
      sortOrder,
      position: body.position || "hero",
    });

    return NextResponse.json(mapBannerToClient(banner.toObject() as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
