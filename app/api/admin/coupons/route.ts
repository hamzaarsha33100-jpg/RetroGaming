import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
import { auth } from "@/lib/auth";

function mapCouponToClient(coupon: Record<string, unknown>) {
  return {
    ...coupon,
    discountType: coupon.type,
    discountValue: coupon.value,
    maxDiscount: coupon.maxDiscountAmount,
  };
}

function mapClientToCoupon(body: Record<string, unknown>) {
  const { discountType, discountValue, maxDiscount, ...rest } = body;
  return {
    ...rest,
    ...(discountType !== undefined && { type: discountType }),
    ...(discountValue !== undefined && { value: discountValue }),
    ...(maxDiscount !== undefined && { maxDiscountAmount: maxDiscount }),
  };
}

// GET /api/admin/coupons - Get all coupons (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(coupons.map((c) => mapCouponToClient(c as Record<string, unknown>)));
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons - Create coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const couponData = mapClientToCoupon(body);

    const existingCoupon = await Coupon.findOne({
      code: String(body.code).toUpperCase(),
    });
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      ...couponData,
      code: String(body.code).toUpperCase(),
    });

    return NextResponse.json(mapCouponToClient(coupon.toObject() as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
