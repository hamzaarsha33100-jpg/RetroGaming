import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Banner from "@/models/Banner";

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({ isActive: true, position: "hero" })
      .sort({ sortOrder: 1 })
      .limit(10)
      .lean();
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(banners)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
