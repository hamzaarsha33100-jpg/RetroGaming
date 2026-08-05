"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="page-container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="w-20 h-20 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-neon-green" />
        </div>

        <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gaming-textMuted mb-2">
          Thank you for your purchase. We&apos;ve received your order and will
          process it shortly.
        </p>

        {orderId && (
          <p className="text-neon-cyan font-mono text-sm mb-8">
            Order #{orderId}
          </p>
        )}

        <p className="text-gaming-textMuted text-sm mb-8">
          A confirmation email has been sent to your inbox with order details.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/orders" className="btn-primary flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            View My Orders
          </Link>
          <Link
            href="/categories"
            className="px-6 py-3 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
