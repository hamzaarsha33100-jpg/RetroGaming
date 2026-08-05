"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

export default function PayPalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!paypalClientId) {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
