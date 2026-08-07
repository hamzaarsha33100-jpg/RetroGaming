"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/providers/QueryProvider";
import PayPalProvider from "@/components/providers/PayPalProvider";
import CurrencySync from "@/components/providers/CurrencySync";
import LanguageSync from "@/components/providers/LanguageSync";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryProvider>
        <CurrencySync>
          <LanguageSync>
            <PayPalProvider>{children}</PayPalProvider>
          </LanguageSync>
        </CurrencySync>
      </QueryProvider>
    </SessionProvider>
  );
}
