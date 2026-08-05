"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to reset password");

      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="gaming-card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-gaming font-bold text-white mb-4">
          Invalid Reset Link
        </h1>
        <p className="text-gaming-textMuted mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-block">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="gaming-card p-8 max-w-md w-full">
      <h1 className="text-2xl font-gaming font-bold text-white mb-2">
        Reset Password
      </h1>
      <p className="text-gaming-textMuted text-sm mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password" className="text-gaming-textMuted">
            New Password
          </Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="pl-10 pr-10 input-gaming"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gaming-textMuted"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-gaming-textMuted">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="mt-1.5 input-gaming"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="gaming-card p-8 max-w-md w-full flex justify-center">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
