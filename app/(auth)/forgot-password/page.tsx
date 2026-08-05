import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password | Retro Gaming",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neon-cyan via-accent to-neon-pink" />
        <div className="pointer-events-none absolute right-6 top-6 h-20 w-20 rounded-full border border-neon-cyan/10 bg-neon-cyan/5 blur-2xl" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-gaming font-bold text-white mb-2">
            Forgot <span className="text-gradient">Password?</span>
          </h1>
          <p className="text-gaming-textMuted">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
