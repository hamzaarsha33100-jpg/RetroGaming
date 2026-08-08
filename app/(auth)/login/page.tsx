"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Loader2, Chrome } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setGoogleAvailable(Boolean(data?.google)))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        // Will be redirected by callback
        const userRes = await fetch("/api/auth/session");
        const session = await userRes.json();
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-2xl border border-neon-cyan/20 bg-gaming-surface/90 p-6 shadow-2xl shadow-neon-cyan/5 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neon-cyan via-accent to-neon-pink" />
        <div className="pointer-events-none absolute right-6 top-6 h-20 w-20 rounded-full border border-neon-cyan/10 bg-neon-cyan/5 blur-2xl" />
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-gaming font-bold text-white mb-2">
            Welcome <span className="text-gradient">Back</span>
          </h1>
          <p className="text-gaming-textMuted">
            Sign in to your account to continue
          </p>
        </div>

        {googleAvailable && (
          <>
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gaming-border text-gaming-text hover:border-white/30 hover:bg-white/5 transition-all duration-200 mb-6 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 text-[#4285F4]" />
              )}
              Continue with Google
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gaming-border" />
              </div>
              <div className="relative flex justify-center text-xs text-gaming-textMuted bg-gaming-surface px-4">
                Or sign in with email
              </div>
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
              <input
                {...register("email")}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className="input-gaming w-full pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gaming-text">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-neon-cyan hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="input-gaming w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gaming-textMuted hover:text-gaming-text"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="text-center text-gaming-textMuted text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-neon-cyan hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
