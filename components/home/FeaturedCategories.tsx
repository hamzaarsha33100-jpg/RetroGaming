"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Headphones, Keyboard, Mouse, Gamepad2, Monitor, Cpu } from "lucide-react";
import { Category } from "@/types";

interface FeaturedCategoriesProps {
  categories: Category[];
}

const categoryIcons: Record<string, React.ElementType> = {
  headsets: Headphones,
  keyboards: Keyboard,
  mice: Mouse,
  controllers: Gamepad2,
  monitors: Monitor,
  default: Cpu,
};

const glowColors = [
  "hover:shadow-[0_0_30px_rgba(0,255,245,0.2)]",
  "hover:shadow-[0_0_30px_rgba(255,0,110,0.2)]",
  "hover:shadow-[0_0_30px_rgba(155,89,182,0.2)]",
  "hover:shadow-[0_0_30px_rgba(255,230,0,0.2)]",
  "hover:shadow-[0_0_30px_rgba(0,255,245,0.2)]",
  "hover:shadow-[0_0_30px_rgba(57,255,20,0.2)]",
];

const accentBorders = [
  "group-hover:border-neon-cyan/40",
  "group-hover:border-neon-pink/40",
  "group-hover:border-neon-purple/40",
  "group-hover:border-neon-yellow/40",
  "group-hover:border-neon-cyan/40",
  "group-hover:border-neon-green/40",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const displayCategories = categories.slice(0, 6);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-20">
      <div className="page-container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-neon-cyan text-sm font-medium uppercase tracking-[0.2em] mb-2">
              Browse
            </p>
            <h2 className="section-title">
              Featured{" "}
              <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-gaming-textMuted mt-2 text-sm">
              Explore our curated collection of premium gaming gear
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-2 text-gaming-textMuted hover:text-neon-cyan transition-colors text-sm group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {displayCategories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || categoryIcons.default;
            const glowColor = glowColors[index % glowColors.length];
            const accentBorder = accentBorders[index % accentBorders.length];

            return (
              <motion.div key={category._id} variants={item}>
                <Link href={`/categories?category=${category._id}`}>
                  <div
                    className={`group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gaming-surface border border-gaming-border transition-all duration-500 cursor-pointer hover:-translate-y-2 ${glowColor} ${accentBorder}`}
                    onMouseEnter={() => setHoveredId(category._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Image / Icon container */}
                    <div className="relative w-16 h-16 rounded-xl bg-gaming-dark/60 border border-gaming-border flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={64}
                          height={64}
                          className={`w-full h-full object-cover rounded-xl transition-transform duration-700 ${
                            hoveredId === category._id ? "scale-110" : "scale-100"
                          }`}
                        />
                      ) : (
                        <Icon className="w-8 h-8 text-gaming-textMuted group-hover:text-neon-cyan transition-colors duration-300" />
                      )}
                    </div>

                    {/* Name */}
                    <span className="text-white font-medium text-sm text-center group-hover:text-neon-cyan transition-colors duration-300">
                      {category.name}
                    </span>

                    {/* Hover arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                      <ArrowRight className="w-3.5 h-3.5 text-neon-cyan" />
                    </div>

                    {/* Glow accent line at bottom */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-12 h-0.5 bg-neon-cyan rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile View All */}
        <div className="flex sm:hidden justify-center mt-8">
          <Link
            href="/categories"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            View All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
