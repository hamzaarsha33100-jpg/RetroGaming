"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle } from "lucide-react";

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
    } catch (error) {
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
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
        <p className="text-gray-400 mb-6">
          We've sent a password reset link to:
          <br />
          <strong className="text-white">{getValues("email")}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Check your inbox and click the link to reset your password. The link
          will expire in 1 hour.
        </p>
        <Button
          onClick={() => setEmailSent(false)}
          variant="outline"
          className="border-purple-500/20"
        >
          Send Another Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-gray-300">
          Email Address
        </Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="pl-10 bg-slate-800/50 border-purple-500/20 text-white"
            autoFocus
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Send Reset Link
      </Button>

      <p className="text-center text-sm text-gray-400">
        Remember your password?{" "}
        <a href="/login" className="text-purple-400 hover:text-purple-300">
          Log in
        </a>
      </p>
    </form>
  );
}
