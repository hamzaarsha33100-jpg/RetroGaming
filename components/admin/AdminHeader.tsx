"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-gaming-surface border-b border-gaming-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-gaming-textMuted text-sm">
          Welcome back,{" "}
          <span className="text-neon-cyan font-semibold">
            {session?.user?.name}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full" />
        </button>

        <Link
          href="/"
          target="_blank"
          className="text-xs text-gaming-textMuted hover:text-neon-cyan transition-colors px-3 py-1.5 border border-gaming-border rounded-lg"
        >
          View Store
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-gaming-border">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || ""}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gaming-surfaceLight flex items-center justify-center">
              <User className="w-4 h-4 text-neon-cyan" />
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gaming-textMuted hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
