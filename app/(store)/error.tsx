"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Zap, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-flex mb-6">
          <Zap className="w-16 h-16 text-neon-pink" />
          <div className="absolute inset-0 blur-lg bg-neon-pink/20 rounded-full" />
        </div>

        <h2 className="text-2xl font-gaming font-bold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-gaming-textMuted mb-8">
          An unexpected error occurred. Please try again or return to the
          homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center justify-center">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
