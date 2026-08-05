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

// PUT /api/admin/coupons/[id] - Update coupon (admin only)
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
    const couponData: Record<string, unknown> = mapClientToCoupon(body);

    if (body.code) {
      const existingCoupon = await Coupon.findOne({
        code: String(body.code).toUpperCase(),
        _id: { $ne: id },
      });
      if (existingCoupon) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
      couponData.code = String(body.code).toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, couponData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(mapCouponToClient(coupon.toObject() as Record<string, unknown>));
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id] - Delete coupon (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
