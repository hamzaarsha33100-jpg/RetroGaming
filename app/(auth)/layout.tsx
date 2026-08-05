import Link from "next/link";
import { Zap } from "lucide-react";
import AppProviders from "@/components/providers/AppProviders";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
    <div className="min-h-screen bg-gaming-dark flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 245, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 245, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Zap className="w-7 h-7 text-neon-cyan" />
          <span className="font-gaming font-bold text-lg text-white">
            RETRO <span className="text-gradient">GAMING</span>
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center px-4 pb-10">
        {children}
      </div>
    </div>
    </AppProviders>
  );
}
