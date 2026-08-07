import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { isLowStock } from "@/lib/inventory";
import { createAdminNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // all | low | out
    const search = searchParams.get("search") || "";

    await connectDB();
    const settings = await getSettings();
    const globalThreshold = settings.inventory?.lowStockThreshold ?? 5;

    const query: Record<string, unknown> = {};
    if (status === "out") query.stockQuantity = { $lte: 0 };
    if (status === "low") query.stockQuantity = { $gt: 0, $lte: globalThreshold };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ stockQuantity: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Compute low-stock status per product using its own minStockLevel if set
    const enriched = products.map((p) => {
      const threshold = p.minStockLevel && p.minStockLevel > 0 ? p.minStockLevel : globalThreshold;
      const stock = p.stockQuantity || 0;
      return {
        ...p,
        lowStock: isLowStock(stock, threshold),
        outOfStock: stock <= 0,
        stockStatus: stock <= 0 ? "out" : isLowStock(stock, threshold) ? "low" : "ok",
      };
    });

    // Global stats
    const [totalProducts, lowCount, outCount] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stockQuantity: { $gt: 0, $lte: globalThreshold } }),
      Product.countDocuments({ stockQuantity: { $lte: 0 } }),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(enriched)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        totalProducts,
        lowCount,
        outCount,
        lowStockThreshold: globalThreshold,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

/** Adjust stock for a product (restock or write-off). */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, adjustment, note } = body;

    if (!productId || typeof adjustment !== "number") {
      return NextResponse.json({ error: "productId and adjustment are required" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newStock = Math.max(0, (product.stockQuantity || 0) + adjustment);
    await Product.findByIdAndUpdate(productId, {
      stockQuantity: newStock,
      isOutOfStock: newStock <= 0,
    });

    if (adjustment > 0) {
      createAdminNotification({
        type: "system",
        title: "Stock adjusted",
        message: `${product.name}: +${adjustment} units added${note ? ` (${note})` : ""}. New stock: ${newStock}.`,
        severity: "info",
        link: "/admin/inventory",
        data: { productId, name: product.name },
      }).catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      message: "Stock updated",
      stockQuantity: newStock,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
