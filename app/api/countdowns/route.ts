import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CountdownTimer from "@/models/CountdownTimer";
import Product from "@/models/Product";
import AdminNotification from "@/models/AdminNotification";
import { createAdminNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/** Mark any overdue timers as ended and apply their end actions. */
async function expireOverdueTimers() {
  try {
    const now = new Date();
    const overdue = await CountdownTimer.find({
      isActive: true,
      isEnded: false,
      endDate: { $lte: now },
    });

    for (const timer of overdue) {
      timer.isActive = false;
      timer.isEnded = true;
      timer.endedAt = now;
      await timer.save();

      const productIds = timer.displayOn?.productIds || [];
      if (productIds.length > 0) {
        if (timer.endAction?.removeDiscount) {
          const products = await Product.find({ _id: { $in: productIds } });
          for (const p of products) {
            p.salePrice = undefined;
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

      createAdminNotification({
        type: "expired_discount",
        title: "Countdown timer expired",
        message: `"${timer.name}" has ended and its end actions were applied.`,
        severity: "warning",
        link: "/admin/countdowns",
        data: { timerId: timer._id.toString() },
      }).catch(() => undefined);
    }
  } catch {
    // best-effort expiration
  }
}

/** Alert admins about timers ending within the next few hours. */
async function alertEndingSoon() {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const timers = await CountdownTimer.find({
      isActive: true,
      isEnded: false,
      endDate: { $gt: now, $lte: soon },
    });

    for (const timer of timers) {
      const existing = await AdminNotification.findOne({
        type: "flash_sale_ending",
        "data.timerId": timer._id.toString(),
        isRead: false,
      });
      if (existing) continue;

      const hoursLeft = Math.max(
        1,
        Math.round((timer.endDate.getTime() - now.getTime()) / (60 * 60 * 1000))
      );
      createAdminNotification({
        type: "flash_sale_ending",
        title: "Flash sale ending soon",
        message: `"${timer.name}" ends in ${hoursLeft}h. Prepare end-of-sale actions.`,
        severity: "warning",
        link: "/admin/countdowns",
        data: { timerId: timer._id.toString() },
      }).catch(() => undefined);
    }
  } catch {
    // best-effort alert
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement");
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");

    await connectDB();
    await expireOverdueTimers();
    await alertEndingSoon();

    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      isEnded: false,
      startDate: { $lte: now },
      endDate: { $gt: now },
    };

    if (placement) query.placement = placement;
    if (productId) {
      query["displayOn.productIds"] = productId;
    }
    if (categoryId) {
      query["displayOn.categoryIds"] = categoryId;
    }

    const timers = await CountdownTimer.find(query)
      .sort({ endDate: 1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(timers)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch countdowns" }, { status: 500 });
  }
}
