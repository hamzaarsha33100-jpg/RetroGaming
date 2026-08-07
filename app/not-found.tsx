import Link from "next/link";
import { Gamepad2, Home, ShoppingCart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gaming-surface border border-gaming-border rounded-2xl flex items-center justify-center mx-auto mb-8 relative">
          <Gamepad2 className="w-12 h-12 text-gaming-textMuted" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-pink rounded-full flex items-center justify-center text-white text-xs font-bold">
            404
          </div>
        </div>
        <h1 className="text-4xl font-gaming font-bold text-white mb-3">
          Level Not Found
        </h1>
        <p className="text-gaming-textMuted mb-8">
          The page you&apos;re looking for has wandered off the map. Let&apos;s get you
          back to the game.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/categories"
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
