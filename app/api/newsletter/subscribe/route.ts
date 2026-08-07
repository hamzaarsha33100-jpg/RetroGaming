import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { rateLimit } from "@/lib/rate-limit";
import { sendNewsletterConfirmationEmail } from "@/lib/email";
import { createAdminNotification } from "@/lib/notifications";
import { getSettings } from "@/lib/settings";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  consent: z.boolean().optional(),
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

    const settings = await getSettings();
    if (settings.newsletter?.requireConsent && !validation.data.consent) {
      return NextResponse.json(
        { error: "Please consent to receive our newsletter" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Newsletter.findOne({
      email: validation.data.email.toLowerCase(),
    });

    let created = false;
    let resubscribed = false;

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: "You are already subscribed!" }, { status: 400 });
      }
      await Newsletter.findByIdAndUpdate(existing._id, {
        isActive: true,
        subscribedAt: new Date(),
        unsubscribedAt: undefined,
      });
      resubscribed = true;
    } else {
      await Newsletter.create({
        email: validation.data.email.toLowerCase(),
        name: validation.data.name,
        source: body.source || "footer",
        consent: validation.data.consent,
      });
      created = true;
    }

    // Send confirmation email (non-blocking)
    if (settings.newsletter?.confirmationEmail) {
      sendNewsletterConfirmationEmail({
        to: validation.data.email,
        name: validation.data.name,
      }).catch(() => undefined);
    }

    // Notify admin of new subscriber
    if (created) {
      createAdminNotification({
        type: "new_subscriber",
        title: "New newsletter subscriber",
        message: `${validation.data.email} subscribed to the newsletter.`,
        severity: "info",
        link: "/admin/newsletter",
        data: { email: validation.data.email },
      }).catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      message: resubscribed
        ? "Successfully resubscribed!"
        : "Successfully subscribed to newsletter!",
    });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
