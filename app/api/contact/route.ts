import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminNotification } from "@/lib/notifications";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 5, 10 * 60 * 1000);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    if (process.env.SMTP_USER) {
      await sendContactEmail({ name, email, subject, message });
    } else {
      console.log("Contact form submission (SMTP not configured):", {
        name,
        email,
        subject,
        message,
      });
    }

    // Notify admin in-app
    createAdminNotification({
      type: "contact_message",
      title: "New customer message",
      message: `${name} (${email}) sent: "${subject}"`,
      severity: "info",
      data: { name, email, subject },
    }).catch(() => undefined);

    return NextResponse.json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
