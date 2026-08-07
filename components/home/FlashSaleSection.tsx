"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Clock, Flame } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types";

interface FlashSaleSectionProps {
  products: Product[];
}

function getNextFriday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(23, 59, 59, 0);
  return nextFriday;
}

function CountdownTimer({ target }: { target: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date().getTime();
      const diff = Math.max(0, target.getTime() - now);
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    }

    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const blocks = [
    { value: timeLeft.hours, label: "HRS" },
    { value: timeLeft.minutes, label: "MIN" },
    { value: timeLeft.seconds, label: "SEC" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {blocks.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="bg-gaming-dark border border-neon-pink/25 rounded-xl px-3 py-2 min-w-[52px] text-center backdrop-blur-sm">
            <span className="block text-xl font-gaming font-bold text-neon-pink tabular-nums leading-none">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-gaming-textMuted text-[10px] font-medium tracking-wider uppercase mt-0.5 block">
              {label}
            </span>
          </div>
          {i < 2 && (
            <span className="text-neon-pink/60 text-lg font-bold animate-pulse">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

function StockBar({ quantity }: { quantity: number }) {
  const maxStock = 100;
  const percentage = Math.min(100, Math.round((quantity / maxStock) * 100));
  const isLow = quantity < 20;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gaming-textMuted">
          {isLow ? (
            <span className="text-neon-pink flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Almost gone!
            </span>
          ) : (
            "Stock remaining"
          )}
        </span>
        <span className="text-gaming-text font-medium tabular-nums">{quantity} left</span>
      </div>
      <div className="w-full h-1.5 bg-gaming-dark rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" as const, delay: 0.3 }}
          className={`h-full rounded-full ${
            isLow
              ? "bg-gradient-to-r from-neon-pink to-neon-pink/70"
              : "bg-gradient-to-r from-neon-cyan to-neon-cyan/70"
          }`}
        />
      </div>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const saleEnd = useMemo(() => getNextFriday(), []);

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <div className="relative rounded-2xl overflow-hidden border border-neon-pink/15 bg-gaming-surface">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-neon-pink/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,0,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,110,0.5) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-10">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20"
                >
                  <Zap className="w-8 h-8 text-neon-pink" />
                </motion.div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-gaming font-bold text-white">
                    Flash{" "}
                    <span className="text-neon-pink" style={{ textShadow: "0 0 20px rgba(255,0,110,0.4)" }}>
                      Sale
                    </span>
                  </h2>
                  <p className="text-gaming-textMuted text-sm mt-0.5">
                    Limited time offers — don&apos;t miss out!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-gaming-textMuted text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Sale ends in:</span>
                </div>
                <CountdownTimer target={saleEnd} />
              </div>
            </div>

            {/* Products Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.slice(0, 8).map((product) => (
                <motion.div key={product._id} variants={item} className="space-y-3">
                  <ProductCard product={product} />
                  <StockBar quantity={product.stockQuantity} />
                </motion.div>
              ))}
            </motion.div>

            {/* View All CTA */}
            <div className="flex justify-center mt-10">
              <Link href="/categories?sale=true">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(255,0,110,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 border border-neon-pink/50 text-neon-pink px-8 py-3.5 rounded-xl hover:bg-neon-pink/10 transition-all duration-300 font-medium"
                >
                  View All Sale Items
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
