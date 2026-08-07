"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { ProductCardData } from "@/types";
import {
  Gamepad2, Trophy, Flame, Star, ChevronLeft, ChevronRight,
  Gamepad, Headphones, Monitor, ShoppingBag, Sparkles, TrendingUp,
  X, Search, Tag, Zap, Heart, ShoppingCart, Eye, Disc,
} from "lucide-react";

interface XboxCategory { name: string; slug: string; param: string; }
interface Category { _id: string; name: string; slug: string; }

interface XboxClientProps {
  xboxCategories: XboxCategory[];
  categories: Category[];
  initialCategory?: string;
  featuredProducts: ProductCardData[];
  newArrivals: ProductCardData[];
  bestSellers: ProductCardData[];
  onSale: ProductCardData[];
  allProducts: ProductCardData[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "series-x": <Gamepad2 className="w-8 h-8" />,
  "series-s": <Gamepad className="w-8 h-8" />,
  "xbox-one": <Gamepad className="w-8 h-8" />,
  controllers: <Gamepad2 className="w-8 h-8" />,
  headsets: <Headphones className="w-8 h-8" />,
  "game-pass": <Monitor className="w-8 h-8" />,
  accessories: <ShoppingBag className="w-8 h-8" />,
  new: <Sparkles className="w-8 h-8" />,
  best: <Trophy className="w-8 h-8" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  "series-x": "from-[#107C10] to-[#2DB83D]",
  "series-s": "from-[#0E7A0D] to-[#1DB83A]",
  "xbox-one": "from-[#107C10] to-[#25A634]",
  controllers: "from-[#107C10] to-[#39FF14]",
  headsets: "from-[#2DB83D] to-[#00Bf00]",
  "game-pass": "from-[#107C10] to-[#92E040]",
  accessories: "from-[#0E7A0D] to-[#33A833]",
  new: "from-[#39FF14] to-[#2DB83D]",
  best: "from-[#92E040] to-[#107C10]",
};

const PRODUCTS_PER_PAGE = 12;

function ProductCardXbox({ product }: { product: ProductCardData }) {
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const router = useRouter();
  const inWishlist = isInWishlist(product._id);
  const displayPrice = product.salePrice ?? product.price;
  const categoryName =
    typeof product.category === "object" ? product.category.name : "";

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (product.isOutOfStock) { toast.error("This product is out of stock"); return; }
      addItem({
        productId: product._id, name: product.name, slug: product.slug,
        image: product.mainImage, price: product.price, salePrice: product.salePrice,
        quantity: 1, maxQuantity: product.stockQuantity, isOutOfStock: product.isOutOfStock,
      });
      toast.success(`${product.name} added to cart!`, { description: "View your cart to checkout" });
    },
    [addItem, product]
  );

  const handleBuyNow = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (product.isOutOfStock) { toast.error("This product is out of stock"); return; }
      localStorage.setItem("buyNowProduct", JSON.stringify({
        productId: product._id, name: product.name, slug: product.slug,
        image: product.mainImage, price: product.price, salePrice: product.salePrice ?? null, quantity: 1,
      }));
      router.push("/buy-now");
    },
    [product, router]
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        productId: product._id, name: product.name, slug: product.slug,
        image: product.mainImage, price: product.price, salePrice: product.salePrice,
        isOutOfStock: product.isOutOfStock, addedAt: new Date().toISOString(),
      });
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
    },
    [toggleItem, product, inWishlist]
  );

  const starElements = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className="w-3 h-3"
        fill={star <= Math.round(product.rating) ? "#ffe600" : "transparent"}
        stroke={star <= Math.round(product.rating) ? "#ffe600" : "#8888aa"} />
    ));
  }, [product.rating]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="gaming-card group relative hover:-translate-y-1 transition-transform duration-300">
      <div>
        <div className="relative overflow-hidden aspect-square bg-gaming-dark">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center"><Zap className="w-16 h-16 text-gaming-border" /></div>
          ) : (
            <Image src={product.mainImage} alt={product.name} fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.15]"
              onError={() => setImageError(true)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
            {product.isOutOfStock ? (
              <span className="badge-gaming bg-gaming-dark/80 text-gaming-textMuted border border-gaming-border">Out of Stock</span>
            ) : (
              <>
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="badge-gaming bg-[#107C10]/90 text-white">-{product.discountPercentage}%</span>
                )}
                {product.isNewArrival && (<span className="badge-gaming bg-[#2DB83D]/90 text-gaming-dark font-semibold">New</span>)}
                {product.isBestSeller && (<span className="badge-gaming bg-neon-yellow/90 text-gaming-dark font-semibold">Best Seller</span>)}
              </>
            )}
          </div>
          <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-10" />
          <div className="absolute right-2 top-2 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button onClick={handleWishlist}
              className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 active:scale-95 ${inWishlist ? "bg-neon-pink text-white" : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink"}`}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
              <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
            </button>
            <button className="p-2 rounded-lg bg-gaming-dark/80 backdrop-blur-sm text-gaming-textMuted hover:text-[#107C10] transition-all duration-200 active:scale-95" title="Quick view">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-20 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex gap-2">
            <button onClick={handleAddToCart} disabled={product.isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#107C10] to-[#2DB83D] text-white font-semibold text-sm hover:shadow-lg transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted">
              <ShoppingCart className="w-4 h-4" />{product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button onClick={handleBuyNow} disabled={product.isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gaming-dark/90 backdrop-blur-sm border border-[#107C10]/50 text-[#107C10] font-semibold text-sm hover:bg-[#107C10]/10 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed">
              Buy It Now
            </button>
          </div>
        </div>
        <div className="p-4">
          {categoryName && (<p className="text-xs text-gaming-textMuted mb-1 uppercase tracking-wider">{categoryName}</p>)}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-gaming-text group-hover:text-[#107C10] transition-colors duration-200 line-clamp-2 text-sm leading-snug mb-2">{product.name}</h3>
          </Link>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">{starElements}</div>
              <span className="text-xs text-gaming-textMuted">({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[#107C10] font-bold text-lg">{formatPrice(displayPrice)}</span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-gaming-textMuted line-through text-sm">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${product.isOutOfStock ? "bg-destructive" : "bg-neon-green"}`} />
            <span className={`text-xs ${product.isOutOfStock ? "text-destructive" : "text-neon-green"}`}>
              {product.isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function XboxClient({
  xboxCategories,
  categories,
  featuredProducts,
  newArrivals,
  bestSellers,
  onSale,
  allProducts,
  initialCategory,
}: XboxClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialCategory || "");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => { setHeroSlide((prev) => (prev + 1) % 3); }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { setPage(1); }, [activeFilter, sortBy]);

  const filteredProducts = useMemo(() => {
    if (!activeFilter) return allProducts;
    if (activeFilter === "new") return allProducts.filter((p) => p.isNewArrival);
    if (activeFilter === "best") return allProducts.filter((p) => p.isBestSeller);
    const search = activeFilter.toLowerCase();
    return allProducts.filter((p) => {
      const cat = typeof p.category === "object" ? p.category : null;
      if (cat && (cat.slug === activeFilter || cat.slug === search)) return true;
      const categoryName = cat ? cat.name.toLowerCase() : "";
      return (
        p.name.toLowerCase().includes(search) ||
        categoryName.includes(search) ||
        p.tags.some((t) => t.toLowerCase().includes(search))
      );
    });
  }, [activeFilter, allProducts]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      case "price-high":
        return list.sort((a, b) => (b.salePrice ?? a.price) - (a.salePrice ?? a.price));
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "featured":
        return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE)),
    [sortedProducts.length]
  );

  const displayProducts = useMemo(
    () => sortedProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE),
    [sortedProducts, page]
  );

  const quickFilterTabs = useMemo(
    () => [
      { name: "New Arrivals", slug: "new-arrivals", param: "new" },
      { name: "Best Sellers", slug: "best-sellers", param: "best" },
      ...xboxCategories,
    ],
    [xboxCategories]
  );

  const heroSlides = useMemo(() => [
    { title: "Xbox Series X", subtitle: "Power Your Dreams", description: "The fastest, most powerful Xbox ever. 12 teraflops of GPU power for true 4K gaming at up to 120 FPS.", gradient: "from-[#107C10]/90 via-[#0a3d0a]/70 to-transparent", accent: "#107C10" },
    { title: "Xbox Game Pass", subtitle: "Play Hundreds of Games", description: "Unlimited access to a library of high-quality games. New titles added every month.", gradient: "from-[#0E7A0D]/90 via-[#0a3d0a]/70 to-transparent", accent: "#2DB83D" },
    { title: "Xbox Accessories", subtitle: "Level Up Your Setup", description: "Premium controllers, headsets, and accessories designed for the ultimate gaming experience.", gradient: "from-[#39FF14]/20 via-[#107C10]/40 to-transparent", accent: "#39FF14" },
  ], []);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter((prev) => (prev === filter ? "" : filter));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${heroSlide === index ? "opacity-100" : "opacity-0"}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(16,124,16,0.15) 40px, rgba(16,124,16,0.15) 41px)" }} />
          </div>
        ))}
        <div className="relative h-full page-container flex items-center">
          <div className="max-w-2xl z-10">
            <AnimatePresence mode="wait">
              <motion.div key={heroSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#107C10]/20 backdrop-blur-sm text-[#39FF14] text-sm border border-[#107C10]/40 mb-4">
                  <Gamepad2 className="w-4 h-4" />Xbox
                </span>
                <h1 className="text-4xl md:text-6xl font-gaming font-bold text-white mb-3">{heroSlides[heroSlide].title}</h1>
                <h2 className="text-2xl md:text-3xl font-gaming mb-4" style={{ background: `linear-gradient(135deg, ${heroSlides[heroSlide].accent}, #ffffff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {heroSlides[heroSlide].subtitle}
                </h2>
                <p className="text-gaming-textMuted text-lg mb-8 max-w-lg">{heroSlides[heroSlide].description}</p>
                <div className="flex gap-4">
                  <Link href="/categories?xbox=series-x" className="px-6 py-3 bg-gradient-to-r from-[#107C10] to-[#2DB83D] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">Shop Xbox Series X</Link>
                  <Link href="/categories?xbox=game-pass" className="px-6 py-3 border border-[#107C10]/50 text-gaming-text rounded-lg hover:bg-[#107C10]/10 transition-all duration-200">Explore Game Pass</Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => setHeroSlide(index)} className={`h-2.5 rounded-full transition-all duration-300 ${heroSlide === index ? "w-8 bg-[#107C10]" : "w-2.5 bg-gaming-textMuted/50 hover:bg-gaming-textMuted"}`} />
          ))}
        </div>
        <button onClick={() => setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gaming-dark/50 backdrop-blur-sm border border-gaming-border text-gaming-textMuted hover:text-[#107C10] hover:border-[#107C10]/50 transition-all hidden md:block"><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={() => setHeroSlide((prev) => (prev + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gaming-dark/50 backdrop-blur-sm border border-gaming-border text-gaming-textMuted hover:text-[#107C10] hover:border-[#107C10]/50 transition-all hidden md:block"><ChevronRight className="w-5 h-5" /></button>
      </section>

      {/* Category Cards */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-2">Browse <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Categories</span></h2>
            <p className="text-gaming-textMuted text-sm">Find exactly what you&apos;re looking for</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {xboxCategories.map((category) => (
            <Link key={category.slug} href={`/categories?xbox=${category.param}`} className="group">
              <div className="gaming-card p-5 text-center hover:-translate-y-1 transition-all duration-300">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[category.param] || "from-[#107C10] to-[#2DB83D]"} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {CATEGORY_ICONS[category.param] || <Gamepad2 className="w-8 h-8" />}
                </div>
                <h3 className="font-semibold text-gaming-text group-hover:text-[#107C10] transition-colors">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Filter Tabs */}
      <section className="page-container pb-8">
        <div className="flex flex-wrap gap-2">
          {quickFilterTabs.map((category) => (
            <button key={category.slug} onClick={() => handleFilterChange(category.param)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === category.param ? "bg-[#107C10] text-white" : "bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:text-gaming-text hover:border-[#107C10]/50"}`}>
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="page-container pb-12">
        {activeFilter ? (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">{quickFilterTabs.find((c) => c.param === activeFilter)?.name || "Products"}</h2>
            <button onClick={() => setActiveFilter("")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-gaming-text text-sm"><X className="w-4 h-4" />Clear</button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">All Xbox <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Products</span></h2>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-gaming text-sm py-2 px-3">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        )}

        {displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gaming-surface border border-gaming-border flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-gaming-textMuted/50" /></div>
            <p className="text-gaming-text text-lg font-medium mb-2">No products found</p>
            <p className="text-gaming-textMuted text-sm mb-6">Try a different category or filter</p>
            <button onClick={() => setActiveFilter("")} className="px-4 py-2 bg-[#107C10] text-white rounded-lg font-semibold hover:bg-[#2DB83D] transition-all">View All Products</button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product, index) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <ProductCardXbox product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-[#107C10] hover:border-[#107C10]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-5 h-5" /></button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === pageNum ? "bg-[#107C10] text-white" : "border border-gaming-border text-gaming-textMuted hover:text-[#107C10] hover:border-[#107C10]/50"}`}>{pageNum}</button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-[#107C10] hover:border-[#107C10]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        )}
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && !activeFilter && (
        <section className="page-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white"><Flame className="inline w-6 h-6 text-[#107C10] mr-2" />Featured <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Products</span></h2>
            <Link href="/categories?filter=featured" className="text-sm text-[#107C10] hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ProductCardXbox product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && !activeFilter && (
        <section className="page-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white"><TrendingUp className="inline w-6 h-6 text-neon-green mr-2" />New <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Arrivals</span></h2>
            <Link href="/categories?filter=new" className="text-sm text-[#107C10] hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product, index) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ProductCardXbox product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && !activeFilter && (
        <section className="page-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white"><Trophy className="inline w-6 h-6 text-neon-yellow mr-2" />Best <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sellers</span></h2>
            <Link href="/categories?filter=bestseller" className="text-sm text-[#107C10] hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product, index) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ProductCardXbox product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* On Sale */}
      {onSale.length > 0 && !activeFilter && (
        <section className="page-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white"><Tag className="inline w-6 h-6 text-[#2DB83D] mr-2" />On <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sale</span></h2>
            <Link href="/categories?filter=sale" className="text-sm text-[#107C10] hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {onSale.slice(0, 4).map((product, index) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ProductCardXbox product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      {!activeFilter && (
        <section className="page-container pb-16">
          <div className="relative overflow-hidden rounded-2xl border border-[#107C10]/30 p-8 md:p-12" style={{ background: "linear-gradient(135deg, rgba(16,124,16,0.1) 0%, rgba(57,255,20,0.05) 50%, rgba(16,124,16,0.1) 100%)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,124,16,0.15)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(16,124,16,0.3) 60px, rgba(16,124,16,0.3) 61px)" }} />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <Star className="w-12 h-12 text-[#107C10] mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-3">Join the <span style={{ background: "linear-gradient(135deg, #107C10, #39FF14)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Xbox</span> Community</h2>
              <p className="text-gaming-textMuted mb-6">Sign up for exclusive deals, early access to new releases, and gaming tips delivered to your inbox.</p>
              <Link href="/account" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#107C10] to-[#2DB83D] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">Get Started</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}