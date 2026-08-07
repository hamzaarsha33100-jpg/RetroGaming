import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CountdownTimer from "@/models/CountdownTimer";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const timers = await CountdownTimer.find()
      .populate("displayOn.productIds", "name")
      .populate("displayOn.categoryIds", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(timers)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch timers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    if (!body.name || !body.endDate) {
      return NextResponse.json(
        { error: "Name and end date are required" },
        { status: 400 }
      );
    }

    const timer = await CountdownTimer.create({
      name: body.name,
      description: body.description,
      target: body.target || "flash_sale",
      placement: body.placement || "homepage",
      startDate: body.startDate || new Date(),
      endDate: new Date(body.endDate),
      isActive: body.isActive ?? true,
      displayOn: {
        homepage: body.displayOn?.homepage ?? true,
        productIds: body.displayOn?.productIds || [],
        categoryIds: body.displayOn?.categoryIds || [],
        bannerIds: body.displayOn?.bannerIds || [],
      },
      discountType: body.discountType,
      discountValue: body.discountValue,
      endAction: {
        removeDiscount: body.endAction?.removeDiscount ?? true,
        setOutOfStock: body.endAction?.setOutOfStock ?? false,
      },
      bannerText: body.bannerText,
      bannerImage: body.bannerImage,
    });

    return NextResponse.json(
      { success: true, data: JSON.parse(JSON.stringify(timer)) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create timer" }, { status: 500 });
  }
}
