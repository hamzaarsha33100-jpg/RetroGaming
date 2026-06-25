"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  variant = "default",
  viewMode = "grid",
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
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

    toast.success(`${product.name} added to cart!`, {
      description: "View your cart to checkout",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
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
  };

  const displayPrice = product.salePrice ?? product.price;
  const categoryName =
    typeof product.category === "object" ? product.category.name : "";

  // List view variant
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="gaming-card group relative"
      >
        <Link href={`/products/${product.slug}`} className="flex gap-4">
          {/* Image */}
          <div className="relative overflow-hidden w-48 h-48 bg-gaming-dark flex-shrink-0">
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gaming-border" />
              </div>
            ) : (
              <img
                src={product.mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
              {product.isOutOfStock ? (
                <span className="badge-gaming bg-gaming-dark/80 text-gaming-textMuted border border-gaming-border">
                  Out of Stock
                </span>
              ) : (
                <>
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="badge-gaming bg-neon-pink/90 text-white">
                      -{product.discountPercentage}%
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="badge-gaming bg-neon-cyan/90 text-gaming-dark font-semibold">
                      New
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 py-2 flex flex-col">
            {categoryName && (
              <p className="text-xs text-gaming-textMuted mb-1 uppercase tracking-wider">
                {categoryName}
              </p>
            )}

            <h3 className="font-semibold text-gaming-text group-hover:text-neon-cyan transition-colors duration-200 text-lg mb-2">
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4"
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
                <span className="text-sm text-gaming-textMuted">
                  ({product.reviewCount})
                </span>
              </div>
            )}

            {/* Short description if available */}
            {product.shortDescription && (
              <p className="text-sm text-gaming-textMuted mb-4 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Price & Actions */}
            <div className="mt-auto flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-neon-cyan font-bold text-2xl">
                    {formatPrice(displayPrice)}
                  </span>
                  {product.salePrice && product.price > product.salePrice && (
                    <span className="text-gaming-textMuted line-through text-lg">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      product.isOutOfStock ? "bg-destructive" : "bg-neon-green"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      product.isOutOfStock
                        ? "text-destructive"
                        : "text-neon-green"
                    }`}
                  >
                    {product.isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleWishlist}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    inWishlist
                      ? "bg-neon-pink text-white"
                      : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink"
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={inWishlist ? "currentColor" : "none"}
                  />
                </motion.button>

                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.isOutOfStock}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold hover:shadow-neon transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="gaming-card group relative"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square bg-gaming-dark">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-16 h-16 text-gaming-border" />
            </div>
          ) : (
            <img
              src={product.mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isOutOfStock ? (
              <span className="badge-gaming bg-gaming-dark/80 text-gaming-textMuted border border-gaming-border">
                Out of Stock
              </span>
            ) : (
              <>
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="badge-gaming bg-neon-pink/90 text-white">
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
                {product.isTrending && (
                  <span className="badge-gaming bg-accent/90 text-white">
                    🔥 Trending
                  </span>
                )}
              </>
            )}
          </div>

          {/* Actions on hover */}
          <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                inWishlist
                  ? "bg-neon-pink text-white"
                  : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink"
              }`}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="w-4 h-4"
                fill={inWishlist ? "currentColor" : "none"}
              />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-gaming-dark/80 backdrop-blur-sm text-gaming-textMuted hover:text-neon-cyan transition-all duration-200"
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Add to Cart on bottom hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <motion.button
              onClick={handleAddToCart}
              disabled={product.isOutOfStock}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold text-sm hover:shadow-neon transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </motion.button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {categoryName && (
            <p className="text-xs text-gaming-textMuted mb-1 uppercase tracking-wider">
              {categoryName}
            </p>
          )}

          <h3 className="font-medium text-gaming-text group-hover:text-neon-cyan transition-colors duration-200 line-clamp-2 text-sm leading-snug mb-2">
            {product.name}
          </h3>

          {/* Rating */}
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

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-neon-cyan font-bold text-lg">
              {formatPrice(displayPrice)}
            </span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-gaming-textMuted line-through text-sm">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock indicator - only show In Stock / Out of Stock */}
          <div className="mt-2 flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                product.isOutOfStock ? "bg-destructive" : "bg-neon-green"
              }`}
            />
            <span
              className={`text-xs ${
                product.isOutOfStock
                  ? "text-destructive"
                  : "text-neon-green"
              }`}
            >
              {product.isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
