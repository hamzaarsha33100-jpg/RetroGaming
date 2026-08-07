"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currencyStore";
import { setActiveCurrency } from "@/lib/utils";

export default function CurrencySync({
  children,
}: {
  children: React.ReactNode;
}) {
  const currency = useCurrencyStore((s) => s.currency);

  setActiveCurrency(currency);

  useEffect(() => {
    const state = useCurrencyStore.getState();
    const persisted = localStorage.getItem("retro-currency");
    if (!persisted && !state.autoDetected) {
      state.detectAndSet();
    }
    document.documentElement.setAttribute("data-currency", currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
