import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CountdownTimer from "@/models/CountdownTimer";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const updateData: Record<string, unknown> = {
      name: body.name,
      description: body.description,
      target: body.target,
      placement: body.placement,
      startDate: body.startDate,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isActive: body.isActive,
      displayOn: body.displayOn,
      discountType: body.discountType,
      discountValue: body.discountValue,
      endAction: body.endAction,
      bannerText: body.bannerText,
      bannerImage: body.bannerImage,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const timer = await CountdownTimer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(timer)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update timer" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const timer = await CountdownTimer.findByIdAndDelete(id);
    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Timer deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete timer" }, { status: 500 });
  }
}

/** Expire the countdown — apply end actions (remove discounts, mark out of stock). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const timer = await CountdownTimer.findById(id);
    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    timer.isActive = false;
    timer.isEnded = true;
    timer.endedAt = new Date();
    await timer.save();

    // Apply end actions to linked products
    const productIds = timer.displayOn?.productIds || [];
    if (productIds.length > 0) {
      if (timer.endAction?.removeDiscount) {
        await Product.updateMany(
          { _id: { $in: productIds } },
          {
            $unset: { salePrice: 1 },
          }
        );
        // isOutOfStock + discountPercentage recomputed on next save
        const products = await Product.find({ _id: { $in: productIds } });
        for (const p of products) {
          p.discountPercentage = 0;
          p.isOutOfStock = p.stockQuantity <= 0;
          await p.save();
        }
      }
      if (timer.endAction?.setOutOfStock) {
        await Product.updateMany(
          { _id: { $in: productIds } },
          { isOutOfStock: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Timer expired and end actions applied",
    });
  } catch {
    return NextResponse.json({ error: "Failed to expire timer" }, { status: 500 });
  }
}
