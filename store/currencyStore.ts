"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  detectCurrencyFromLocale,
} from "@/lib/currencies";

interface CurrencyState {
  currency: string;
  autoDetected: boolean;
  setCurrency: (code: string) => void;
  detectAndSet: () => void;
  resetToAuto: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      autoDetected: false,
      setCurrency: (code) =>
        set({ currency: code, autoDetected: false }),
      detectAndSet: () => {
        if (typeof window === "undefined") return;
        const detected = detectCurrencyFromLocale(
          navigator.language || "en-US"
        );
        set({ currency: detected, autoDetected: true });
      },
      resetToAuto: () => {
        if (typeof window === "undefined") return;
        const detected = detectCurrencyFromLocale(
          navigator.language || "en-US"
        );
        set({ currency: detected, autoDetected: true });
      },
    }),
    {
      name: "retro-currency",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { CURRENCIES, DEFAULT_CURRENCY };
