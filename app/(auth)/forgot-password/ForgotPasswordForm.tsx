"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send reset email");

      setEmailSent(true);
      toast.success("Reset email sent!", {
        description: "Check your inbox for the reset link",
      });
    } catch {
      toast.error("Failed to send reset email", {
        description: "Please try again or contact support",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-neon-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-neon-cyan" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
        <p className="text-gaming-textMuted mb-6">
          We&apos;ve sent a password reset link to:
          <br />
          <strong className="text-white">{getValues("email")}</strong>
        </p>
        <p className="text-sm text-gaming-textMuted mb-6">
          Check your inbox and click the link to reset your password. The link
          will expire in 1 hour.
        </p>
        <button
          onClick={() => setEmailSent(false)}
          className="btn-secondary"
        >
          Send Another Email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gaming-text mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
          <input
            type="email"
            {...register("email")}
            placeholder="your@email.com"
            autoFocus
            className="input-gaming w-full pl-10"
          />
        </div>
        {errors.email && (
          <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>

      <p className="text-center text-sm text-gaming-textMuted">
        Remember your password?{" "}
        <Link href="/login" className="text-neon-cyan hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
