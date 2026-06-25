import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { $text: { $search: q } },
      ],
    })
      .populate("category", "name slug")
      .select("name slug mainImage price salePrice brand category")
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
