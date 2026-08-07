"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardData } from "@/types";
import {
  Gamepad2,
  Trophy,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  Gamepad,
  Headphones,
  Monitor,
  Disc,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  X,
  Search,
} from "lucide-react";

interface PSGategory {
  name: string;
  slug: string;
  param: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface PSGamesClientProps {
  psCategories: PSGategory[];
  categories: Category[];
  featuredProducts: ProductCardData[];
  newArrivals: ProductCardData[];
  bestSellers: ProductCardData[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ps5: <Gamepad2 className="w-8 h-8" />,
  ps4: <Gamepad className="w-8 h-8" />,
  ps3: <Gamepad className="w-8 h-8" />,
  ps2: <Gamepad className="w-8 h-8" />,
  accessories: <Headphones className="w-8 h-8" />,
  digital: <Monitor className="w-8 h-8" />,
  used: <Disc className="w-8 h-8" />,
  new: <Sparkles className="w-8 h-8" />,
  best: <Trophy className="w-8 h-8" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  ps5: "from-blue-600 to-blue-400",
  ps4: "from-purple-600 to-purple-400",
  ps3: "from-indigo-600 to-indigo-400",
  ps2: "from-violet-600 to-violet-400",
  accessories: "from-neon-cyan to-cyan-400",
  digital: "from-neon-green to-emerald-400",
  used: "from-orange-500 to-amber-400",
  new: "from-neon-pink to-pink-400",
  best: "from-neon-yellow to-yellow-400",
};

const PRODUCTS_PER_PAGE = 12;

export default function PSGamesClient({
  psCategories,
  categories,
  featuredProducts,
  newArrivals,
  bestSellers,
}: PSGamesClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, sortBy]);

  const { data: productsData, isLoading } = useQuery<{
    products: ProductCardData[];
    total: number;
    pages: number;
  }>({
    queryKey: ["ps-products", activeFilter, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter) {
        if (["new", "best"].includes(activeFilter)) {
          if (activeFilter === "new") params.append("filter", "new");
          if (activeFilter === "best") params.append("filter", "bestseller");
        } else {
          params.append("search", activeFilter);
        }
      }
      params.append("sort", "createdAt");
      params.append("order", "desc");
      params.append("page", page.toString());
      params.append("limit", PRODUCTS_PER_PAGE.toString());

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return {
        products: json.data ?? [],
        total: json.pagination?.total ?? 0,
        pages: json.pagination?.pages ?? 1,
      };
    },
  });

  const products = productsData?.products ?? [];
  const totalPages = productsData?.pages ?? 1;

  const heroSlides = useMemo(
    () => [
      {
        title: "PlayStation 5",
        subtitle: "Next Gen Gaming",
        description:
          "Experience lightning-fast loading, deeper immersion with haptic feedback, and adaptive triggers.",
        gradient: "from-blue-900/90 via-blue-800/70 to-transparent",
        accent: "neon-cyan",
      },
      {
        title: "PlayStation 4",
        subtitle: "Endless Adventures",
        description:
          "Explore thousands of games and discover new worlds with the PS4 library.",
        gradient: "from-purple-900/90 via-purple-800/70 to-transparent",
        accent: "neon-pink",
      },
      {
        title: "Retro Gaming",
        subtitle: "Classic Collection",
        description:
          "Relive the nostalgia with our curated collection of PS2 and PS3 classics.",
        gradient: "from-violet-900/90 via-violet-800/70 to-transparent",
        accent: "neon-green",
      },
    ],
    []
  );

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter((prev) => (prev === filter ? "" : filter));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              heroSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
          </div>
        ))}

        <div className="relative h-full page-container flex items-center">
          <div className="max-w-2xl z-10">
            <motion.div
              key={heroSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-gaming-text text-sm border border-white/20 mb-4">
                <Gamepad2 className="w-4 h-4" />
                PlayStation
              </span>
              <h1 className="text-4xl md:text-6xl font-gaming font-bold text-white mb-3">
                {heroSlides[heroSlide].title}
              </h1>
              <h2 className="text-2xl md:text-3xl font-gaming text-gradient mb-4">
                {heroSlides[heroSlide].subtitle}
              </h2>
              <p className="text-gaming-textMuted text-lg mb-8 max-w-lg">
                {heroSlides[heroSlide].description}
              </p>
              <div className="flex gap-4">
                <Link
                  href="/categories?ps=ps5"
                  className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold rounded-lg hover:shadow-neon transition-all duration-200"
                >
                  Shop PS5
                </Link>
                <Link
                  href="/categories?ps=ps4"
                  className="px-6 py-3 border border-gaming-border text-gaming-text rounded-lg hover:bg-gaming-surface transition-all duration-200"
                >
                  Shop PS4
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setHeroSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                heroSlide === index
                  ? "w-8 bg-neon-cyan"
                  : "bg-gaming-textMuted/50 hover:bg-gaming-textMuted"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Category Cards */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-2">
              Browse <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-gaming-textMuted text-sm">
              Find exactly what you&apos;re looking for
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {psCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories?ps=${category.param}`}
              className="group"
            >
              <div className="gaming-card p-5 text-center hover:-translate-y-1 transition-all duration-300">
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[category.param] || "from-neon-cyan to-cyan-400"} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {CATEGORY_ICONS[category.param] || (
                    <ShoppingBag className="w-8 h-8" />
                  )}
                </div>
                <h3 className="font-semibold text-gaming-text group-hover:text-neon-cyan transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Filter Tabs */}
      <section className="page-container pb-8">
        <div className="flex flex-wrap gap-2">
          {psCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleFilterChange(category.param)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === category.param
                  ? "bg-neon-cyan text-gaming-dark"
                  : "bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:text-gaming-text hover:border-gaming-textMuted"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="page-container pb-12">
        {activeFilter ? (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
              {psCategories.find((c) => c.param === activeFilter)?.name ||
                "Products"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFilter("")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-gaming-text text-sm"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
              All PlayStation <span className="text-gradient">Products</span>
            </h2>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gaming-surface/50 rounded-2xl p-4 animate-pulse border border-gaming-border"
              >
                <div className="aspect-square bg-gaming-dark rounded-xl mb-4" />
                <div className="h-4 bg-gaming-dark rounded mb-2" />
                <div className="h-4 bg-gaming-dark rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gaming-surface border border-gaming-border flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gaming-textMuted/50" />
            </div>
            <p className="text-gaming-text text-lg font-medium mb-2">
              No products found
            </p>
            <p className="text-gaming-textMuted text-sm mb-6">
              Try a different category or filter
            </p>
            <button
              onClick={() => setActiveFilter("")}
              className="px-4 py-2 bg-neon-cyan text-gaming-dark rounded-lg font-semibold hover:shadow-neon transition-all"
            >
              View All Products
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? "bg-neon-cyan text-gaming-dark"
                      : "border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="page-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
              <Flame className="inline w-6 h-6 text-neon-pink mr-2" />
              Featured <span className="text-gradient">Games</span>
            </h2>
            <Link
              href="/categories?filter=featured"
              className="text-sm text-neon-cyan hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="page-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
              <Trophy className="inline w-6 h-6 text-neon-yellow mr-2" />
              Best <span className="text-gradient">Sellers</span>
            </h2>
            <Link
              href="/categories?filter=bestseller"
              className="text-sm text-neon-cyan hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="page-container pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
              <TrendingUp className="inline w-6 h-6 text-neon-green mr-2" />
              New <span className="text-gradient">Arrivals</span>
            </h2>
            <Link
              href="/categories?filter=new"
              className="text-sm text-neon-cyan hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="page-container pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neon-cyan/10 via-neon-pink/10 to-neon-green/10 border border-gaming-border p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,255,255,0.1)_0%,_transparent_50%)]" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Star className="w-12 h-12 text-neon-yellow mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-3">
              Join the <span className="text-gradient">PlayStation</span> Community
            </h2>
            <p className="text-gaming-textMuted mb-6">
              Sign up for exclusive deals, early access to new releases, and gaming tips delivered to your inbox.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold rounded-lg hover:shadow-neon transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
