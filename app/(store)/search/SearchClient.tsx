"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/products/ProductCard";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { ProductCardData } from "@/types";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeQuery, setActiveQuery] = useState(query);

  // Fetch search results
  const { data: products = [], isLoading } = useQuery<ProductCardData[]>({
    queryKey: ["search", activeQuery],
    queryFn: async () => {
      if (!activeQuery.trim()) return [];
      
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(activeQuery)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: activeQuery.trim().length > 0,
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setActiveQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setActiveQuery("");
    window.history.pushState({}, "", "/search");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Search Products
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for controllers, headsets, keyboards..."
            className="w-full pl-12 pr-12 py-6 bg-slate-900/50 border-purple-500/20 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl text-lg"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {activeQuery && (
          <p className="text-gray-400 mt-4 text-center">
            {isLoading
              ? "Searching..."
              : `${products.length} ${
                  products.length === 1 ? "result" : "results"
                } for "${activeQuery}"`}
          </p>
        )}
      </div>

      {/* Results */}
      {!activeQuery ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Search className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Start Your Search
            </h2>
            <p className="text-gray-400 mb-6">
              Enter keywords to find your perfect gaming accessories
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500">Popular searches:</span>
              {["controller", "headset", "keyboard", "mouse"].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    setActiveQuery(term);
                    window.history.pushState({}, "", `/search?q=${term}`);
                  }}
                  className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-full text-sm transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 rounded-2xl p-4 animate-pulse"
            >
              <div className="aspect-square bg-slate-800 rounded-xl mb-4" />
              <div className="h-4 bg-slate-800 rounded mb-2" />
              <div className="h-4 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No Results Found
            </h2>
            <p className="text-gray-400 mb-6">
              We couldn't find any products matching "{activeQuery}". Try different keywords or browse our categories.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
              <Link href="/categories">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
      )}
    </div>
  );
}
