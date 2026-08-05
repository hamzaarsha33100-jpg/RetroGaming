import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin") === "true";

    if (admin) {
      const session = await auth();
      if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await connectDB();

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;
    const filter = searchParams.get("filter");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = admin ? {} : { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = parseFloat(maxPrice);
    }

    if (filter === "trending") query.isTrending = true;
    if (filter === "featured") query.isFeatured = true;
    if (filter === "bestseller") query.isBestSeller = true;
    if (filter === "new") query.isNewArrival = true;
    if (filter === "sale") query.salePrice = { $exists: true, $gt: 0 };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const product = await Product.create(body);

    return NextResponse.json(
      { success: true, data: JSON.parse(JSON.stringify(product)) },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
