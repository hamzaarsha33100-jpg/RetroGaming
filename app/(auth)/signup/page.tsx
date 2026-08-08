"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Chrome } from "lucide-react";
import { toast } from "sonner";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created, but auto sign-in failed. Please log in.");
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-gaming font-bold text-white mb-2">
            Create <span className="text-gradient">Account</span>
          </h1>
          <p className="text-gaming-textMuted">
            Join Retro Gaming and start your journey
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
              Sign up with Google
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gaming-border" />
              </div>
              <div className="relative flex justify-center text-xs text-gaming-textMuted bg-gaming-surface px-4">
                Or create with email
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
              <input
                {...register("name")}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className="input-gaming w-full pl-10"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

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
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
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

          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="input-gaming w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gaming-textMuted hover:text-gaming-text"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <p className="text-gaming-textMuted text-xs">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-neon-cyan hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-neon-cyan hover:underline">
              Privacy Policy
            </Link>
          </p>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-gaming-textMuted text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-neon-cyan hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
