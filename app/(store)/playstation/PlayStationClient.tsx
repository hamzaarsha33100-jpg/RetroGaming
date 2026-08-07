"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardData, Category } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Gamepad2,
  Trophy,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Zap,
  Sparkles,
  Tag,
  X,
  Search,
  ArrowRight,
  Gamepad,
  Headphones,
  Monitor,
  Disc,
  Shield,
  Eye,
} from "lucide-react";

interface PlayStationClientProps {
  categories: Category[];
  allProducts: ProductCardData[];
  featuredProducts: ProductCardData[];
  newArrivals: ProductCardData[];
  bestSellers: ProductCardData[];
  onSale: ProductCardData[];
  initialCategory?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ps5: <Gamepad2 className="w-7 h-7" />,
  ps4: <Gamepad className="w-7 h-7" />,
  ps3: <Gamepad className="w-7 h-7" />,
  ps2: <Gamepad className="w-7 h-7" />,
  accessories: <Headphones className="w-7 h-7" />,
  "digital-games": <Monitor className="w-7 h-7" />,
  "used-games": <Disc className="w-7 h-7" />,
  "ps-vr": <Eye className="w-7 h-7" />,
};

const PRODUCTS_PER_PAGE = 12;

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function ProductSectionCard({
  product,
  index,
}: {
  product: ProductCardData;
  index: number;
}) {
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
      if (product.isOutOfStock) {
        toast.error("This product is out of stock");
        return;
      }
      addItem({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.mainImage,
        price: product.price,
        salePrice: product.salePrice,
        quantity: 1,
        maxQuantity: product.stockQuantity,
        isOutOfStock: product.isOutOfStock,
      });
      toast.success(`${product.name} added to cart!`);
    },
    [addItem, product]
  );

  const handleBuyNow = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (product.isOutOfStock) {
        toast.error("This product is out of stock");
        return;
      }
      localStorage.setItem(
        "buyNowProduct",
        JSON.stringify({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          image: product.mainImage,
          price: product.price,
          salePrice: product.salePrice,
          quantity: 1,
        })
      );
      router.push("/buy-now");
    },
    [product, router]
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.mainImage,
        price: product.price,
        salePrice: product.salePrice,
        isOutOfStock: product.isOutOfStock,
        addedAt: new Date().toISOString(),
      });
      toast.success(
        inWishlist ? "Removed from wishlist" : "Added to wishlist!"
      );
    },
    [toggleItem, product, inWishlist]
  );

  return (
    <motion.div
      variants={itemVariants}
      className="gaming-card group relative hover:-translate-y-1 transition-transform duration-300"
    >
      <div>
        <div className="relative overflow-hidden aspect-square bg-gaming-dark">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-16 h-16 text-gaming-border" />
            </div>
          ) : (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.15]"
              onError={() => setImageError(true)}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isOutOfStock ? (
              <span className="badge-gaming bg-gaming-dark/80 text-gaming-textMuted border border-gaming-border">
                Out of Stock
              </span>
            ) : (
              <>
                {product.discountPercentage &&
                  product.discountPercentage > 0 && (
                    <span className="badge-gaming bg-[#0070d1]/90 text-white">
                      -{product.discountPercentage}%
                    </span>
                  )}
                {product.isNewArrival && (
                  <span className="badge-gaming bg-neon-cyan/90 text-gaming-dark font-semibold">
                    New
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="badge-gaming bg-neon-yellow/90 text-gaming-dark font-semibold">
                    Best Seller
                  </span>
                )}
              </>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="absolute inset-0 z-10"
          />

          <div className="absolute right-2 top-2 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 active:scale-95 ${
                inWishlist
                  ? "bg-neon-pink text-white"
                  : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink"
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={inWishlist ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#0070d1] to-[#005bb5] text-white font-semibold text-sm hover:shadow-[0_0_15px_rgba(0,112,209,0.5)] transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold text-sm hover:shadow-neon transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy It Now
            </button>
          </div>
        </div>

        <div className="p-4">
          {categoryName && (
            <p className="text-xs text-[#0070d1] mb-1 uppercase tracking-wider font-medium">
              {categoryName}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-gaming-text group-hover:text-[#0070d1] transition-colors duration-200 line-clamp-2 text-sm leading-snug mb-2">
              {product.name}
            </h3>
          </Link>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3"
                    fill={
                      star <= Math.round(product.rating)
                        ? "#ffe600"
                        : "transparent"
                    }
                    stroke={
                      star <= Math.round(product.rating)
                        ? "#ffe600"
                        : "#8888aa"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gaming-textMuted">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[#0070d1] font-bold text-lg">
              {formatPrice(displayPrice)}
            </span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-gaming-textMuted line-through text-sm">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                product.isOutOfStock ? "bg-destructive" : "bg-neon-green"
              }`}
            />
            <span
              className={`text-xs ${
                product.isOutOfStock ? "text-destructive" : "text-neon-green"
              }`}
            >
              {product.isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductRow({
  title,
  accent,
  icon,
  products,
  viewAllLink,
  iconColor,
}: {
  title: string;
  accent: string;
  icon: React.ReactNode;
  products: ProductCardData[];
  viewAllLink: string;
  iconColor: string;
}) {
  if (products.length === 0) return null;

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="page-container py-12"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
              {title}{" "}
              <span className="bg-gradient-to-r from-[#0070d1] to-neon-cyan bg-clip-text text-transparent">
                {accent}
              </span>
            </h2>
          </div>
        </div>
        <Link
          href={viewAllLink}
          className="hidden sm:flex items-center gap-2 text-gaming-textMuted hover:text-[#0070d1] transition-colors text-sm group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {products.slice(0, 4).map((product, index) => (
          <ProductSectionCard key={product._id} product={product} index={index} />
        ))}
      </motion.div>

      <Link
        href={viewAllLink}
        className="flex sm:hidden justify-center mt-8 text-sm text-[#0070d1] hover:underline"
      >
        View All
      </Link>
    </motion.section>
  );
}

export default function PlayStationClient({
  categories,
  allProducts,
  featuredProducts,
  newArrivals,
  bestSellers,
  onSale,
  initialCategory,
}: PlayStationClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || ""
  );
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
  }, [activeCategory]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return allProducts;
    if (activeCategory === "new")
      return allProducts.filter((p) => p.isNewArrival);
    if (activeCategory === "best")
      return allProducts.filter((p) => p.isBestSeller);
    return allProducts.filter((p) => {
      if (typeof p.category === "object" && p.category !== null) {
        return (
          p.category.slug === activeCategory ||
          p.category._id === activeCategory
        );
      }
      return p.category === activeCategory;
    });
  }, [activeCategory, allProducts]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );
  const products = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  const heroSlides = useMemo(
    () => [
      {
        title: "PlayStation 5",
        subtitle: "Play Has No Limits",
        description:
          "Experience lightning-fast loading with the custom SSD, deeper immersion with haptic feedback, and adaptive triggers.",
        gradient: "from-[#0070d1]/90 via-[#004e9c]/70 to-transparent",
        accent: "#0070d1",
        badge: "Next Gen",
      },
      {
        title: "PlayStation 4",
        subtitle: "Greatness Awaits",
        description:
          "Explore thousands of games, from blockbusters to indies, with the world's most popular console.",
        gradient: "from-[#5b21b6]/90 via-[#4c1d95]/70 to-transparent",
        accent: "#8b5cf6",
        badge: "Massive Library",
      },
      {
        title: "Retro Collection",
        subtitle: "Classic PlayStation",
        description:
          "Relive the golden era of gaming with our curated PS2 and PS3 classic titles.",
        gradient: "from-[#0f766e]/90 via-[#115e59]/70 to-transparent",
        accent: "#14b8a6",
        badge: "Nostalgia",
      },
    ],
    []
  );

  const handleCategoryClick = useCallback((slug: string) => {
    setActiveCategory((prev) => (prev === slug ? "" : slug));
  }, []);

  const heroCategories = useMemo(() => {
    const ps5 =
      categories.find((c) => c.slug.startsWith("playstation-5")) ??
      categories[0];
    const ps4 =
      categories.find((c) => c.slug.startsWith("playstation-4")) ??
      categories[1];
    return { ps5, ps4 };
  }, [categories]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
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
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)]" />

            {/* PlayStation Logo Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute top-1/4 right-1/4 w-96 h-96 border-[3px] border-white rounded-full" />
              <div className="absolute top-1/3 right-[30%] w-64 h-64 border-[3px] border-white rounded-full" />
              <div className="absolute top-[20%] right-[20%] w-4 h-4 bg-white rounded-full" />
              <div className="absolute top-[35%] right-[35%] w-4 h-4 bg-white rounded-full" />
              <div className="absolute top-[25%] right-[15%] w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        ))}

        <div className="relative h-full page-container flex items-center">
          <div className="max-w-2xl z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: "easeOut" as const }}
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm border border-white/20 mb-6"
                  style={{
                    background: `${heroSlides[heroSlide].accent}22`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Shield className="w-4 h-4" />
                  {heroSlides[heroSlide].badge}
                </span>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-gaming font-bold text-white mb-3 leading-tight">
                  {heroSlides[heroSlide].title}
                </h1>

                <h2
                  className="text-2xl md:text-3xl font-gaming mb-4"
                  style={{ color: heroSlides[heroSlide].accent }}
                >
                  {heroSlides[heroSlide].subtitle}
                </h2>

                <p className="text-gaming-textMuted text-lg mb-8 max-w-lg leading-relaxed">
                  {heroSlides[heroSlide].description}
                </p>

                <div className="flex flex-wrap gap-4">
                  {heroCategories.ps5 && (
                    <Link
                      href={`/playstation?cat=${heroCategories.ps5.slug}`}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#0070d1] to-[#005bb5] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,112,209,0.5)] transition-all duration-200 active:scale-98"
                    >
                      Shop PS5
                    </Link>
                  )}
                  {heroCategories.ps4 && (
                    <Link
                      href={`/playstation?cat=${heroCategories.ps4.slug}`}
                      className="px-8 py-3.5 border border-gaming-border text-gaming-text rounded-lg hover:bg-gaming-surface hover:border-[#0070d1]/50 transition-all duration-200"
                    >
                      Shop PS4
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Hero Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setHeroSlide(index)}
              className="group relative"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  heroSlide === index
                    ? "w-10"
                    : "w-2 bg-gaming-textMuted/40 hover:bg-gaming-textMuted/60"
                }`}
                style={
                  heroSlide === index
                    ? { backgroundColor: slide.accent }
                    : undefined
                }
              />
            </button>
          ))}
        </div>
      </section>

      {/* Category Cards Grid */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="page-container py-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-2">
              Browse{" "}
              <span className="bg-gradient-to-r from-[#0070d1] to-neon-cyan bg-clip-text text-transparent">
                Categories
              </span>
            </h2>
            <p className="text-gaming-textMuted text-sm">
              Find exactly what you&apos;re looking for
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category.slug)}
              className={`group text-left gaming-card p-5 transition-all duration-300 ${
                activeCategory === category.slug
                  ? "ring-2 ring-[#0070d1] shadow-[0_0_15px_rgba(0,112,209,0.3)]"
                  : "hover:-translate-y-1"
              }`}
            >
              <div
                className={`w-14 h-14 mb-3 rounded-xl flex items-center justify-center text-white transition-all duration-300 ${
                  activeCategory === category.slug
                    ? "bg-[#0070d1] scale-110"
                    : "bg-[#0070d1]/20 group-hover:bg-[#0070d1]/40 group-hover:scale-110"
                }`}
              >
                {CATEGORY_ICONS[category.slug] || (
                  <Gamepad2 className="w-7 h-7" />
                )}
              </div>
              <h3
                className={`font-semibold transition-colors ${
                  activeCategory === category.slug
                    ? "text-[#0070d1]"
                    : "text-gaming-text group-hover:text-[#0070d1]"
                }`}
              >
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs text-gaming-textMuted mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Featured Products */}
      <ProductRow
        title="Featured"
        accent="Products"
        icon={<Flame className="w-5 h-5 text-white" />}
        products={featuredProducts}
        viewAllLink="/categories?filter=featured"
        iconColor="bg-[#0070d1]/20"
      />

      {/* New Arrivals */}
      <ProductRow
        title="New"
        accent="Arrivals"
        icon={<Sparkles className="w-5 h-5 text-white" />}
        products={newArrivals}
        viewAllLink="/categories?filter=new"
        iconColor="bg-neon-cyan/20"
      />

      {/* Best Sellers */}
      <ProductRow
        title="Best"
        accent="Sellers"
        icon={<Trophy className="w-5 h-5 text-white" />}
        products={bestSellers}
        viewAllLink="/categories?filter=bestseller"
        iconColor="bg-neon-yellow/20"
      />

      {/* On Sale */}
      <ProductRow
        title="On"
        accent="Sale"
        icon={<Tag className="w-5 h-5 text-white" />}
        products={onSale}
        viewAllLink="/categories?filter=sale"
        iconColor="bg-neon-pink/20"
      />

      {/* All Products Grid with Filtering */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="page-container py-12"
      >
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeCategory === ""
                ? "bg-[#0070d1] text-white shadow-[0_0_10px_rgba(0,112,209,0.4)]"
                : "bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:text-gaming-text hover:border-[#0070d1]/50"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.slug
                  ? "bg-[#0070d1] text-white shadow-[0_0_10px_rgba(0,112,209,0.4)]"
                  : "bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:text-gaming-text hover:border-[#0070d1]/50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-gaming font-bold text-white">
            {activeCategory
              ? categories.find((c) => c.slug === activeCategory)?.name ||
                "Products"
              : "All PlayStation"}{" "}
            <span className="bg-gradient-to-r from-[#0070d1] to-neon-cyan bg-clip-text text-transparent">
              Products
            </span>
          </h2>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory("")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-gaming-text text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
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
              onClick={() => setActiveCategory("")}
              className="px-4 py-2 bg-[#0070d1] text-white rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(0,112,209,0.5)] transition-all"
            >
              View All Products
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-[#0070d1] hover:border-[#0070d1]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                      ? "bg-[#0070d1] text-white"
                      : "border border-gaming-border text-gaming-textMuted hover:text-[#0070d1] hover:border-[#0070d1]/50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gaming-border text-gaming-textMuted hover:text-[#0070d1] hover:border-[#0070d1]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.section>

      {/* CTA Banner */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="page-container pb-16"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0070d1]/10 via-[#004e9c]/10 to-[#0070d1]/10 border border-[#0070d1]/20 p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,112,209,0.15)_0%,_transparent_50%)]" />
          <div className="absolute top-4 right-4 w-32 h-32 border-[2px] border-[#0070d1]/10 rounded-full" />
          <div className="absolute bottom-4 right-16 w-20 h-20 border-[2px] border-[#0070d1]/10 rounded-full" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Shield className="w-12 h-12 text-[#0070d1] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-3">
              Join the{" "}
              <span className="bg-gradient-to-r from-[#0070d1] to-neon-cyan bg-clip-text text-transparent">
                PlayStation
              </span>{" "}
              Community
            </h2>
            <p className="text-gaming-textMuted mb-6">
              Sign up for exclusive deals, early access to new releases, and
              gaming tips delivered to your inbox.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0070d1] to-[#005bb5] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,112,209,0.5)] transition-all duration-200 active:scale-98"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
