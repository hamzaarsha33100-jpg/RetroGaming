import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminNotification } from "@/lib/notifications";

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 5, 15 * 60 * 1000);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "customer",
      provider: "credentials",
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name, email }).catch(console.error);

    // Notify admin of new signup
    createAdminNotification({
      type: "new_subscriber",
      title: "New customer registered",
      message: `${name} (${email}) created an account.`,
      severity: "success",
      link: "/admin/customers",
      data: { userId: user._id.toString(), email },
    }).catch(() => undefined);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
