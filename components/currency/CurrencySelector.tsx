"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useCurrencyStore, CURRENCIES } from "@/store/currencyStore";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors text-sm"
        aria-label="Select currency"
      >
        <Globe className="w-4 h-4" />
        <span>{current.flag}</span>
        <span className="font-medium">{currency}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-gaming-surface border border-gaming-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            <div className="max-h-80 overflow-y-auto p-1.5">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    c.code === currency
                      ? "text-neon-cyan bg-neon-cyan/10"
                      : "text-gaming-textMuted hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="font-medium">{c.code}</span>
                  <span className="flex-1 text-left text-xs truncate">
                    {c.name}
                  </span>
                  {c.code === currency && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
