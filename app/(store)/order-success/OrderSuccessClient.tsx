"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Clock,
  CreditCard,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";

const keyframes = `
  @keyframes success-ring {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.15); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0; }
  }
  @keyframes success-circle {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes check-draw {
    0% { stroke-dashoffset: 36; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes shimmer-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes float-particle {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
    50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
  }
`;

function SuccessCheckmark() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)",
          animation: "success-ring 1.5s ease-out 0.3s forwards",
          opacity: 0,
        }}
      />

      {/* Animated green circle */}
      <div
        className="absolute inset-2 rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(57,255,20,0.2) 0%, rgba(57,255,20,0.05) 100%)",
          border: "2px solid rgba(57,255,20,0.4)",
          boxShadow:
            "0 0 20px rgba(57,255,20,0.15), inset 0 0 20px rgba(57,255,20,0.05)",
          animation: "success-circle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards",
          transform: "scale(0)",
          opacity: 0,
        }}
      >
        {/* SVG Checkmark */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          className="relative z-10"
        >
          <path
            d="M12 24L20 32L36 16"
            stroke="#39ff14"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 36,
              strokeDashoffset: 36,
              animation: "check-draw 0.5s ease-out 0.7s forwards",
            }}
          />
        </svg>
      </div>

      {/* Particle dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-neon-green"
          style={{
            top: `${20 + Math.sin((i * Math.PI * 2) / 6) * 40}%`,
            left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 45}%`,
            animation: `float-particle 2s ease-in-out ${0.8 + i * 0.15}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      {/* Shimmer overlay */}
      <div
        className="absolute inset-2 rounded-full overflow-hidden pointer-events-none"
        style={{ opacity: 0.4 }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            animation: "shimmer-slide 2.5s ease-in-out 1.2s infinite",
          }}
        />
      </div>
    </div>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryStr = estimatedDelivery.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-container py-16 md:py-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,255,245,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        {/* Success Animation */}
        <SuccessCheckmark />

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-neon-green" />
            <span className="text-neon-green text-sm font-medium uppercase tracking-widest">
              Payment Successful
            </span>
            <Sparkles className="w-5 h-5 text-neon-green" />
          </div>
          <h1 className="text-4xl md:text-5xl font-gaming font-bold text-white mb-4">
            Order <span className="text-gradient">Confirmed!</span>
          </h1>
          <p className="text-gaming-textMuted text-lg max-w-md mx-auto">
            Thank you for your purchase. Your order has been placed and is being
            prepared for shipment.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="gaming-card mt-10 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Order Number */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <p className="text-gaming-textMuted text-xs uppercase tracking-wider">
                  Order Number
                </p>
                <p className="text-white font-mono text-sm font-medium mt-0.5">
                  {orderId ? `#${orderId}` : "Processing..."}
                </p>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <p className="text-gaming-textMuted text-xs uppercase tracking-wider">
                  Customer
                </p>
                <p className="text-white text-sm font-medium mt-0.5">Customer</p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-gaming-textMuted text-xs uppercase tracking-wider">
                  Payment Status
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
                  </span>
                  <span className="text-neon-green text-sm font-medium">
                    Paid
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-neon-yellow" />
              </div>
              <div>
                <p className="text-gaming-textMuted text-xs uppercase tracking-wider">
                  Estimated Delivery
                </p>
                <p className="text-white text-sm font-medium mt-0.5">
                  {deliveryStr}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation note */}
          <div className="mt-6 pt-5 border-t border-gaming-border">
            <p className="text-gaming-textMuted text-sm">
              A confirmation email has been sent to your inbox with full order
              details and tracking information.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <Link
            href="/"
            className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="px-8 py-3.5 border border-gaming-border text-gaming-text rounded-lg
                       hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-300
                       flex items-center justify-center gap-2 text-base"
          >
            View Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 flex items-center justify-center gap-6 text-gaming-textMuted/50 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Secure Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Free Returns
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Secure Payment
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessClient() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-24 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mb-4" />
          <p className="text-gaming-textMuted text-sm">
            Loading order details...
          </p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
