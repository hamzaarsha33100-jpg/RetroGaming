"use client";

import { Zap } from "lucide-react";

export default function StoreLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Zap className="w-10 h-10 text-neon-cyan animate-pulse" />
          <div className="absolute inset-0 blur-sm bg-neon-cyan/30 animate-ping rounded-full" />
        </div>
        <p className="text-gaming-textMuted text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
