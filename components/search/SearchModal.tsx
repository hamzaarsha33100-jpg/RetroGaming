"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  mainImage: string;
  price: number;
  salePrice?: number;
  brand: string;
  category: { name: string };
}

const trendingSearches = [
  "Gaming Headset",
  "Mechanical Keyboard",
  "Gaming Mouse",
  "RGB Controller",
  "Gaming Monitor",
];

export default function SearchModal() {
  const { isSearchOpen, openSearch, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const stored = localStorage.getItem("retro-gaming-searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isSearchOpen) {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, openSearch, closeSearch]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=6`
      );
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const saveSearch = (term: string) => {
    const searches = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      5
    );
    setRecentSearches(searches);
    localStorage.setItem("retro-gaming-searches", JSON.stringify(searches));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
      closeSearch();
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const handleResultClick = (productName: string) => {
    saveSearch(productName);
    closeSearch();
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-gaming-surface border border-gaming-border rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center gap-3 p-4 border-b border-gaming-border">
                <Search className="w-5 h-5 text-neon-cyan flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for gaming accessories..."
                  className="flex-1 bg-transparent text-gaming-text placeholder-gaming-textMuted text-lg outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-gaming-textMuted hover:text-neon-cyan transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeSearch}
                  className="px-2 py-1 text-xs border border-gaming-border text-gaming-textMuted rounded hover:border-neon-cyan/50 transition-colors"
                >
                  ESC
                </button>
              </div>
            </form>

            <div className="max-h-96 overflow-y-auto">
              {/* Loading */}
              {loading && (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
                </div>
              )}

              {/* Search Results */}
              {!loading && results.length > 0 && (
                <div className="p-2">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product.slug}`}
                      onClick={() => handleResultClick(product.name)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gaming-text group-hover:text-neon-cyan transition-colors text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-gaming-textMuted text-xs">
                          {product.brand} · {product.category?.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-neon-cyan font-semibold text-sm">
                          {formatPrice(product.salePrice ?? product.price)}
                        </span>
                        {product.salePrice && (
                          <span className="text-gaming-textMuted line-through text-xs">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}

                  {query.trim() && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => {
                        saveSearch(query.trim());
                        closeSearch();
                      }}
                      className="flex items-center gap-2 p-3 text-neon-cyan hover:bg-neon-cyan/10 rounded-xl transition-colors text-sm"
                    >
                      <ArrowRight className="w-4 h-4" />
                      See all results for &quot;{query}&quot;
                    </Link>
                  )}
                </div>
              )}

              {/* No Results */}
              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gaming-textMuted">
                    No products found for &quot;{query}&quot;
                  </p>
                </div>
              )}

              {/* Default State */}
              {!query && (
                <div className="p-4 space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-xs text-gaming-textMuted font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Recent Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1.5 rounded-full bg-gaming-dark border border-gaming-border text-gaming-textMuted hover:border-neon-cyan/50 hover:text-neon-cyan text-xs transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  <div>
                    <p className="text-xs text-gaming-textMuted font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs hover:bg-neon-cyan/20 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
