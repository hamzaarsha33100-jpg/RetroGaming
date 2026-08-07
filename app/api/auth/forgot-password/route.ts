import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendOtpEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpires");

    if (!user) {
      return NextResponse.json({
        message: "If account exists, a verification code will be sent",
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = hashOtp(otp);
    user.otpExpires = otpExpires;
    user.otpVerified = false;
    await user.save();

    if (process.env.SMTP_USER) {
      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
      });
    }

    return NextResponse.json({
      message: "If account exists, a verification code will be sent",
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    console.error("Error processing password reset:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
