"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        toast.success("Verification code sent!", {
          description: "Check your email for the 6-digit code",
        });
        if (data.otp) {
          setOtp(data.otp);
        }
      } else {
        toast.error(data.error || "Failed to send code");
      }
    } catch {
      toast.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setResetToken(data.token);
        toast.success("Code verified!", {
          description: "Now set your new password",
        });
      } else {
        toast.error(data.error || "Invalid code");
      }
    } catch {
      toast.error("Failed to verify code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must include one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error("Password must include one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/auth/set-new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordReset(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-gaming-textMuted hover:text-neon-cyan mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <div className="relative overflow-hidden rounded-2xl border border-neon-green/20 bg-gaming-surface/90 p-6 shadow-2xl shadow-neon-green/5 backdrop-blur-xl sm:p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-neon-green" />
            </div>
            <h1 className="text-2xl font-gaming font-bold text-white mb-2">
              Password Reset!
            </h1>
            <p className="text-gaming-textMuted mb-6">
              Your password has been updated successfully.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Sign In with New Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (resetToken) {
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
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neon-green via-neon-cyan to-accent" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-gaming font-bold text-white mb-2">
              Set New <span className="text-gradient">Password</span>
            </h1>
            <p className="text-gaming-textMuted">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gaming-text mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters, 1 uppercase, 1 number"
                className="input-gaming w-full"
                required
              />
              <p className="text-xs text-gaming-textMuted mt-1">
                Must be 8+ characters with 1 uppercase letter and 1 number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gaming-text mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="input-gaming w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isResetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (otpSent) {
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

          <div className="text-center mb-8">
            <h1 className="text-3xl font-gaming font-bold text-white mb-2">
              Enter <span className="text-gradient">Code</span>
            </h1>
            <p className="text-gaming-textMuted">
              We sent a 6-digit code to
            </p>
            <p className="text-neon-cyan font-medium text-sm mt-1">{email}</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gaming-text mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="input-gaming w-full text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
              {isVerifying ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full text-center text-sm text-gaming-textMuted hover:text-neon-cyan transition-colors"
            >
              Didn&apos;t receive code?{" "}
              <span className="text-neon-cyan font-medium">Resend</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            Enter your email and we&apos;ll send you a verification code
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                className="input-gaming w-full pl-10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>

        <p className="text-center text-sm text-gaming-textMuted mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-neon-cyan hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
