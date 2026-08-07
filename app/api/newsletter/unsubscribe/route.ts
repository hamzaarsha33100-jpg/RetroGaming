import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { rateLimit } from "@/lib/rate-limit";

const unsubscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 5, 60 * 60 * 1000);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await req.json();
    const validation = unsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await connectDB();
    const subscriber = await Newsletter.findOne({
      email: validation.data.email.toLowerCase(),
    });

    if (!subscriber || !subscriber.isActive) {
      return NextResponse.json({
        success: true,
        message: "You are not currently subscribed.",
      });
    }

    await Newsletter.findByIdAndUpdate(subscriber._id, {
      isActive: false,
      unsubscribedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "You've been unsubscribed from our newsletter.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
