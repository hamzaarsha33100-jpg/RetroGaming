"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import Link from "next/link";
import CountdownTimer from "@/components/countdown/CountdownTimer";

interface TimerData {
  _id: string;
  name: string;
  description?: string;
  target: string;
  placement: string;
  endDate: string;
  bannerText?: string;
}

const TARGET_LABELS: Record<string, string> = {
  flash_sale: "Flash Sale",
  limited_offer: "Limited-Time Offer",
  product_launch: "Product Launch",
  seasonal_discount: "Seasonal Discount",
  special_promotion: "Special Promotion",
};

const TARGET_CTAS: Record<string, string> = {
  flash_sale: "/categories?sale=true",
  limited_offer: "/categories?sale=true",
  product_launch: "/categories?filter=new",
  seasonal_discount: "/categories?sale=true",
  special_promotion: "/categories",
};

export default function CountdownBanner() {
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/countdowns?placement=homepage")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success) setTimers(d.data || []);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || timers.length === 0) return null;

  const timer = timers[0];

  return (
    <div className="relative overflow-hidden border-b border-neon-pink/15 bg-gradient-to-r from-gaming-dark via-gaming-surface to-gaming-dark">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-72 h-72 bg-neon-pink/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px]" />
      </div>
      <div className="page-container relative flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-2 rounded-xl bg-neon-pink/10 border border-neon-pink/20"
          >
            <Zap className="w-5 h-5 text-neon-pink" />
          </motion.div>
          <div>
            <p className="text-white font-gaming font-bold text-lg leading-tight">
              {timer.bannerText || timer.name || "Flash Sale Live!"}
            </p>
            <p className="text-gaming-textMuted text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {TARGET_LABELS[timer.target] || "Limited time"} — ends in:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CountdownTimer target={timer.endDate} variant="compact" />
          <Link
            href={TARGET_CTAS[timer.target] || "/categories"}
            className="hidden sm:inline-flex items-center gap-1.5 text-neon-pink border border-neon-pink/40 px-4 py-2 rounded-lg hover:bg-neon-pink/10 transition-all text-sm font-medium whitespace-nowrap"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
