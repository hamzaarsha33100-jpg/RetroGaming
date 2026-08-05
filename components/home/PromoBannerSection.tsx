"use client";

import Link from "next/link";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $75",
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10 border-neon-cyan/20",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encrypted",
    color: "text-neon-green",
    bg: "bg-neon-green/10 border-neon-green/20",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day hassle free",
    color: "text-neon-purple",
    bg: "bg-neon-purple/10 border-neon-purple/20",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert gaming support",
    color: "text-neon-pink",
    bg: "bg-neon-pink/10 border-neon-pink/20",
  },
];

export default function PromoBannerSection() {
  return (
    <section className="py-16">
      <div className="page-container space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex items-center gap-4 p-4 rounded-xl border ${feature.bg} transition-all duration-300 hover:scale-105 animate-fade-in`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`p-2 rounded-lg ${feature.bg}`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {feature.title}
                </p>
                <p className="text-gaming-textMuted text-xs">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative rounded-2xl overflow-hidden animate-fade-in">
          <div
            className="relative h-64 md:h-80 bg-gradient-to-r from-gaming-darker to-gaming-surface flex items-center"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 70% 50%, rgba(155, 89, 182, 0.15) 0%, transparent 60%)",
            }}
          >
            <div className="page-container">
              <div className="max-w-lg">
                <p className="text-neon-cyan text-sm font-gaming uppercase tracking-widest mb-3">
                  Limited Offer
                </p>
                <h3 className="text-3xl md:text-4xl font-gaming font-black text-white mb-4">
                  Up to{" "}
                  <span className="text-gradient text-5xl md:text-6xl">40%</span>
                  <br />
                  OFF on Pro Series
                </h3>
                <p className="text-gaming-textMuted mb-6">
                  Upgrade your battlestation with premium gaming peripherals at
                  unbeatable prices.
                </p>
                <Link href="/categories?sale=true">
                  <button className="btn-primary flex items-center gap-2 hover:scale-105 transition-transform">
                    Shop the Sale
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border border-neon-purple/20 animate-ping" />
                <div className="absolute inset-4 rounded-full border border-neon-purple/30" />
                <div className="absolute inset-8 rounded-full border border-neon-cyan/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-gaming text-8xl font-black text-white/5">
                    SALE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
