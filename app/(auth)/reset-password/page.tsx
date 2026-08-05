"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <Link
        href="/login"
        className="inline-flex items-center text-gaming-textMuted hover:text-neon-cyan mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-neon-cyan/20 bg-gaming-surface/90 p-6 shadow-2xl shadow-neon-cyan/5 backdrop-blur-xl sm:p-8">
        <div className="text-center py-8">
          <h1 className="text-2xl font-gaming font-bold text-white mb-4">
            Use Forgot Password
          </h1>
          <p className="text-gaming-textMuted mb-6">
            Please use the Forgot Password flow to reset your password with OTP verification.
          </p>
          <Link href="/forgot-password" className="btn-primary inline-block">
            Go to Forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
}
