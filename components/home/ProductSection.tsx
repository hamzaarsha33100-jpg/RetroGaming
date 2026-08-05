"use client";

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
}

export default function ProductSection({
  title,
  subtitle,
  accent,
  products,
  viewAllLink,
  viewAllText = "View All",
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="page-container">
        <div className="flex items-end justify-between mb-10">
          <div>
            {subtitle && (
              <p className="text-neon-cyan text-sm font-gaming uppercase tracking-widest mb-2">
                {subtitle}
              </p>
            )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product) => (
            <div key={product._id} className="animate-fade-in">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

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
