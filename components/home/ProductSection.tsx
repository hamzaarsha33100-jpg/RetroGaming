"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  accent?: string;
  products: Product[];
  viewAllLink?: string;
  viewAllText?: string;
  accentColor?: "cyan" | "pink" | "purple" | "green" | "yellow";
}

const accentStyles: Record<string, { dot: string; glow: string }> = {
  cyan: {
    dot: "bg-neon-cyan shadow-[0_0_8px_rgba(0,255,245,0.6)]",
    glow: "from-neon-cyan/10",
  },
  pink: {
    dot: "bg-neon-pink shadow-[0_0_8px_rgba(255,0,110,0.6)]",
    glow: "from-neon-pink/10",
  },
  purple: {
    dot: "bg-neon-purple shadow-[0_0_8px_rgba(155,89,182,0.6)]",
    glow: "from-neon-purple/10",
  },
  green: {
    dot: "bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.6)]",
    glow: "from-neon-green/10",
  },
  yellow: {
    dot: "bg-neon-yellow shadow-[0_0_8px_rgba(255,230,0,0.6)]",
    glow: "from-neon-yellow/10",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function ProductSection({
  title,
  subtitle,
  accent,
  products,
  viewAllLink,
  viewAllText = "View All",
  accentColor = "cyan",
}: ProductSectionProps) {
  if (products.length === 0) return null;

  const style = accentStyles[accentColor] || accentStyles.cyan;

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-2 h-2 rounded-full ${style.dot}`} />
              {subtitle && (
                <p className="text-gaming-textMuted text-sm uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
            <h2 className="section-title">
              {title}{" "}
              {accent && <span className="text-gradient">{accent}</span>}
            </h2>
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="hidden sm:flex items-center gap-2 text-gaming-textMuted hover:text-neon-cyan transition-colors text-sm group"
            >
              {viewAllText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product._id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All */}
        {viewAllLink && (
          <div className="flex sm:hidden justify-center mt-8">
            <Link
              href={viewAllLink}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              {viewAllText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
