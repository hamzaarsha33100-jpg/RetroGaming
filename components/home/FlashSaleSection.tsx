"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ArrowRight, Clock } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types";

interface FlashSaleSectionProps {
  products: Product[];
}

function CountdownTimer({ targetHours = 8 }: { targetHours?: number }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: targetHours,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {[
        { value: timeLeft.hours, label: "HRS" },
        { value: timeLeft.minutes, label: "MIN" },
        { value: timeLeft.seconds, label: "SEC" },
      ].map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className="bg-gaming-dark border border-neon-pink/30 rounded-lg p-2 min-w-[50px] text-center">
            <span className="block text-xl font-gaming font-bold text-neon-pink tabular-nums">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-gaming-textMuted text-xs">{label}</span>
          </div>
          {i < 2 && (
            <span className="text-neon-pink text-xl font-bold">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="page-container">
        <div className="relative rounded-2xl overflow-hidden border border-neon-pink/20 bg-gradient-to-r from-gaming-surface to-gaming-surfaceLight p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20">
                <Zap className="w-8 h-8 text-neon-pink animate-neon-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-gaming font-bold text-white">
                  Flash{" "}
                  <span style={{ color: "#ff006e", textShadow: "0 0 10px #ff006e" }}>
                    Sale
                  </span>
                </h2>
                <p className="text-gaming-textMuted text-sm">
                  Limited time offers — don&apos;t miss out!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gaming-textMuted text-sm">
                <Clock className="w-4 h-4" />
                <span>Ends in:</span>
              </div>
              <CountdownTimer targetHours={8} />
            </div>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <div key={product._id} className="animate-fade-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              href="/categories?sale=true"
              className="flex items-center gap-2 border border-neon-pink/50 text-neon-pink px-6 py-3 rounded-lg hover:bg-neon-pink/10 transition-all duration-300"
            >
              View All Sale Items
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
