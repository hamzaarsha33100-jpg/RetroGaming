import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { rateLimit } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 3, 60 * 60 * 1000);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await req.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await connectDB();

    const existing = await Newsletter.findOne({
      email: validation.data.email.toLowerCase(),
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: "You are already subscribed!" }, { status: 400 });
      }
      await Newsletter.findByIdAndUpdate(existing._id, {
        isActive: true,
        subscribedAt: new Date(),
        unsubscribedAt: undefined,
      });
      return NextResponse.json({ success: true, message: "Successfully resubscribed!" });
    }

    await Newsletter.create({
      email: validation.data.email.toLowerCase(),
      name: validation.data.name,
      source: "footer",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
