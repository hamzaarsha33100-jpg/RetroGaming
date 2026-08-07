"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Zap } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        toast.success("Subscribed!", { description: "You'll receive our latest gaming deals." });
        setEmail("");
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-gaming-dark to-neon-purple/10" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-neon-cyan rounded-full blur-[128px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-neon-purple rounded-full blur-[128px]" />
      </div>

      <div className="relative page-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Stay in the Game
          </div>
          <h2 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            Get Exclusive <span className="text-gradient">Gaming Deals</span>
          </h2>
          <p className="text-gaming-textMuted mb-8 text-lg">
            Subscribe to our newsletter and be the first to know about new arrivals, flash sales, and exclusive discounts.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green">
              <Check className="w-5 h-5" />
              <span className="font-medium">You&apos;re subscribed! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gaming-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gaming-surface border border-gaming-border rounded-xl text-gaming-text placeholder:text-gaming-textMuted/50 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-neon-cyan to-cyan-600 text-gaming-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,245,0.3)] transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-gaming-textMuted text-sm mt-4">
            Join 10,000+ gamers. No spam, unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
