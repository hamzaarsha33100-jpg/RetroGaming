import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import NotifyRequest from "@/models/NotifyRequest";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const notifySchema = z.object({
  type: z.enum(["back_in_stock", "price_drop"]),
  email: z.string().email(),
  productId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 10, 60 * 60 * 1000);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await req.json();
    const validation = notifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { type, email, productId } = validation.data;
    await connectDB();

    const product = await Product.findById(productId).select(
      "name stockQuantity salePrice price"
    );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const session = await auth();

    const existing = await NotifyRequest.findOne({
      type,
      email: email.toLowerCase(),
      product: productId,
      isNotified: false,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already on the list for this product.",
      });
    }

    await NotifyRequest.create({
      type,
      email: email.toLowerCase(),
      product: productId,
      user: session?.user?.id,
      originalPrice: product.price,
      targetPrice: product.salePrice || undefined,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      success: true,
      message:
        type === "back_in_stock"
          ? "We'll email you when this product is back in stock."
          : "We'll email you when this product's price drops.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to save notification request" }, { status: 500 });
  }
}
