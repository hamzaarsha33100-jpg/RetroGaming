"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Check,
  Package,
  Copy,
  Zap,
  Eye,
  Bell,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { Product, Review } from "@/types";
import { useHasMounted } from "@/hooks/useHasMounted";
import ProductCard from "@/components/products/ProductCard";

type ImageTransition = "fade" | "slide" | "zoom" | "flip";

const transitionVariants: Record<
  ImageTransition,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
};

export default function ProductDetailClient({
  product,
  reviews,
  relatedProducts = [],
}: {
  product: Product;
  reviews: Review[];
  relatedProducts?: Product[];
}) {
  const router = useRouter();
  const allImages = [
    { url: product.mainImage, alt: product.name },
    ...product.galleryImages,
  ];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyType, setNotifyType] = useState<"back_in_stock" | "price_drop">("back_in_stock");
  const [notifyDone, setNotifyDone] = useState(false);

  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const hasMounted = useHasMounted();
  const inWishlist = hasMounted ? isInWishlist(product._id) : false;

  const transition = transitionVariants[product.imageTransition];

  const handleAddToCart = () => {
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
      quantity,
      maxQuantity: product.stockQuantity,
      isOutOfStock: product.isOutOfStock,
    });

    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleBuyNow = () => {
    if (product.isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    const buyNowData = {
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.mainImage,
      price: product.price,
      salePrice: product.salePrice,
      quantity,
      maxQuantity: product.stockQuantity,
    };

    localStorage.setItem("buyNowProduct", JSON.stringify(buyNowData));
    router.push("/buy-now");
  };

  const handleWishlist = () => {
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
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  const handleShare = () => {    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleNotify = async () => {
    if (!notifyEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(notifyEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNotifyLoading(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: notifyType,
          email: notifyEmail,
          productId: product._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifyDone(true);
        toast.success(data.message || "You'll be notified!");
      } else {
        toast.error(data.error || "Failed to save notification request");
      }
    } catch {
      toast.error("Failed to save notification request");
    } finally {
      setNotifyLoading(false);
    }
  };

  const categoryName =
    typeof product.category === "object" ? product.category.name : "";

  return (
    <div className="page-container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery - Left */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gaming-surface border border-gaming-border group">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={allImages[selectedImageIndex]?.url || product.mainImage}
                alt={allImages[selectedImageIndex]?.alt || product.name}
                initial={transition.initial}
                animate={transition.animate}
                exit={transition.exit}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      (prev) => (prev - 1 + allImages.length) % allImages.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass border border-white/10 text-white hover:border-neon-cyan/50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      (prev) => (prev + 1) % allImages.length
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass border border-white/10 text-white hover:border-neon-cyan/50 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full glass border border-white/10 text-white text-xs">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isOutOfStock ? (
                <span className="badge-gaming bg-gaming-dark/90 text-gaming-textMuted border border-gaming-border">
                  Out of Stock
                </span>
              ) : (
                <>
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="badge-gaming bg-neon-pink text-white text-sm px-3 py-1">
                      -{product.discountPercentage}% OFF
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="badge-gaming bg-neon-cyan text-gaming-dark font-bold text-sm px-3 py-1">
                      NEW
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "border-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : "border-gaming-border hover:border-neon-cyan/50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Right */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gaming-textMuted flex-wrap">
            <Link href="/" className="hover:text-neon-cyan transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/categories"
              className="hover:text-neon-cyan transition-colors"
            >
              Shop
            </Link>
            {categoryName && (
              <>
                <span>/</span>
                <Link
                  href={`/categories?category=${typeof product.category === "object" ? product.category._id : ""}`}
                  className="hover:text-neon-cyan transition-colors"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gaming-text truncate max-w-[200px]">
              {product.name}
            </span>
          </div>

          <div>
            <p className="text-neon-cyan text-sm font-gaming uppercase tracking-widest mb-2">
              {product.brand}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5"
                    fill={star <= Math.round(product.rating) ? "#ffe600" : "transparent"}
                    stroke={star <= Math.round(product.rating) ? "#ffe600" : "#8888aa"}
                  />
                ))}
              </div>
              <span className="text-gaming-text font-medium">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-gaming-textMuted text-sm">
                ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-4xl font-bold text-neon-cyan">
              {formatPrice(product.salePrice ?? product.price)}
            </span>
            {product.salePrice && product.price > product.salePrice && (
              <>
                <span className="text-gaming-textMuted line-through text-xl">
                  {formatPrice(product.price)}
                </span>
                <span className="badge-gaming bg-neon-pink/20 text-neon-pink border border-neon-pink/30 text-sm px-3 py-1">
                  Save {formatPrice(product.price - product.salePrice)}
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
                product.isOutOfStock
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-neon-green/10 border-neon-green/30 text-neon-green"
              }`}
            >
              {product.isOutOfStock ? (
                <>
                  <Package className="w-4 h-4" />
                  Out of Stock
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  In Stock
                </>
              )}
            </div>
            <span className="text-gaming-textMuted text-xs">SKU: {product.sku}</span>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gaming-textMuted leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Quantity & Action Buttons */}
          {!product.isOutOfStock && (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gaming-text text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-gaming-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 text-gaming-text font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stockQuantity, quantity + 1))
                    }
                    className="px-4 py-3 text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>

                <motion.button
                  onClick={handleBuyNow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-semibold rounded-lg bg-gradient-to-r from-neon-pink to-purple-600 text-white hover:from-neon-pink/90 hover:to-purple-600/90 transition-all shadow-[0_0_20px_rgba(255,0,100,0.3)] hover:shadow-[0_0_30px_rgba(255,0,100,0.5)]"
                >
                  <Zap className="w-5 h-5" />
                  Buy It Now
                </motion.button>
              </div>

              {/* Wishlist & Share */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleWishlist}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm ${
                    inWishlist
                      ? "bg-neon-pink text-white border-neon-pink"
                      : "border-gaming-border text-gaming-textMuted hover:border-neon-pink hover:text-neon-pink"
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={inWishlist ? "currentColor" : "none"}
                  />
                  {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                </motion.button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gaming-border text-gaming-textMuted hover:border-neon-cyan hover:text-neon-cyan transition-all text-sm"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          )}

          {product.isOutOfStock && (
            <div className="p-4 rounded-xl border border-gaming-border bg-gaming-surface/50">
              {notifyDone ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neon-green/10">
                    <Check className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">You're on the list!</p>
                    <p className="text-gaming-textMuted text-xs mt-1">
                      We'll email you at <span className="text-neon-cyan">{notifyEmail}</span> when this
                      item is {notifyType === "back_in_stock" ? "back in stock" : "on sale"}.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-4 h-4 text-neon-pink" />
                    <p className="text-sm font-semibold text-white">
                      Out of stock — get notified
                    </p>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {(["back_in_stock", "price_drop"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setNotifyType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          notifyType === t
                            ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                            : "border-gaming-border text-gaming-textMuted hover:text-white"
                        }`}
                      >
                        {t === "back_in_stock" ? "Back in stock" : "Price drop"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-2.5 rounded-lg bg-gaming-dark border border-gaming-border text-white text-sm placeholder:text-gaming-textMuted focus:outline-none focus:border-neon-cyan"
                    />
                    <button
                      onClick={handleNotify}
                      disabled={notifyLoading}
                      className="px-4 py-2.5 rounded-lg bg-neon-pink text-white text-sm font-medium hover:bg-neon-pink/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {notifyLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Notify Me
                    </button>
                  </div>
                </>
              )}
              <div className="flex mt-4 pt-3 border-t border-gaming-border">
                <motion.button
                  onClick={handleWishlist}
                  className="flex items-center gap-2 text-gaming-textMuted hover:text-neon-pink transition-colors text-sm"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-neon-pink text-neon-pink" : ""}`} />
                  {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                </motion.button>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gaming-border">
            {[
              { icon: Truck, text: "Free shipping $75+" },
              { icon: Shield, text: "Secure checkout" },
              { icon: RefreshCw, text: "30-day returns" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                <Icon className="w-5 h-5 text-neon-cyan" />
                <span className="text-gaming-textMuted text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <div className="flex gap-6 border-b border-gaming-border mb-8 overflow-x-auto scrollbar-hide">
          {(["description", "specs", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium capitalize transition-all duration-200 relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-neon-cyan"
                  : "text-gaming-textMuted hover:text-gaming-text"
              }`}
            >
              {tab === "reviews" ? `Reviews (${reviews.length})` : tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "description" && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gaming-text leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-gaming-surface border border-gaming-border text-gaming-textMuted text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="gaming-card overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gaming-dark/30" : ""}
                      >
                        <td className="px-4 sm:px-6 py-4 text-gaming-textMuted text-sm font-medium w-1/3 border-r border-gaming-border">
                          {spec.key}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gaming-text text-sm">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {product.specifications.length === 0 && (
                  <p className="p-6 text-gaming-textMuted text-center">
                    No specifications available
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gaming-textMuted">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="gaming-card p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gaming-surfaceLight flex items-center justify-center overflow-hidden flex-shrink-0">
                          {review.user?.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-neon-cyan font-bold text-sm">
                              {review.user?.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-white">
                                {review.user?.name}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="w-3.5 h-3.5"
                                    fill={star <= review.rating ? "#ffe600" : "transparent"}
                                    stroke={star <= review.rating ? "#ffe600" : "#8888aa"}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.isVerified && (
                              <span className="badge-gaming bg-neon-green/10 text-neon-green border border-neon-green/20">
                                <Check className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gaming-text mb-1">
                            {review.title}
                          </h4>
                          <p className="text-gaming-textMuted text-sm leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <Eye className="w-6 h-6 text-neon-cyan" />
            <h2 className="text-2xl font-bold text-white">
              You May Also <span className="text-neon-cyan">Like</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
