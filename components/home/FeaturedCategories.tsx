"use client";

import Link from "next/link";
import Image from "next/image";
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

const categoryColors: string[] = [
  "from-neon-cyan/20 to-accent/20 border-neon-cyan/30",
  "from-neon-pink/20 to-accent/20 border-neon-pink/30",
  "from-neon-purple/20 to-neon-pink/20 border-neon-purple/30",
  "from-neon-yellow/20 to-neon-cyan/20 border-neon-yellow/30",
  "from-accent/20 to-neon-cyan/20 border-accent/30",
  "from-neon-green/20 to-neon-cyan/20 border-neon-green/30",
];

const iconColors: string[] = [
  "text-neon-cyan",
  "text-neon-pink",
  "text-neon-purple",
  "text-neon-yellow",
  "text-accent",
  "text-neon-green",
];

export default function FeaturedCategories({
  categories,
}: FeaturedCategoriesProps) {
  const displayCategories = categories.slice(0, 6);

  return (
    <section className="py-20">
      <div className="page-container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-neon-cyan text-sm font-gaming uppercase tracking-widest mb-2">
              Browse
            </p>
            <h2 className="section-title">
              Featured{" "}
              <span className="text-gradient">Categories</span>
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-2 text-gaming-textMuted hover:text-neon-cyan transition-colors text-sm group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((category, index) => {
            const Icon =
              categoryIcons[category.slug] || categoryIcons.default;
            const colorClass = categoryColors[index % categoryColors.length];
            const iconColor = iconColors[index % iconColors.length];

            return (
              <div key={category._id} className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                <Link href={`/categories/${category.slug}`}>
                  <div
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br ${colorClass} border backdrop-blur-sm transition-all duration-300 group cursor-pointer hover:scale-105 hover:-translate-y-1`}
                  >
                    <div
                      className={`p-3 rounded-xl bg-gaming-dark/50 ${iconColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    <span className="text-white font-medium text-sm text-center group-hover:text-neon-cyan transition-colors">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex sm:hidden justify-center mt-6">
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
