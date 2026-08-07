"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useCallback, memo } from "react";
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { ProductCardData } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";

interface ProductCardProps {
  product: ProductCardData;
  viewMode?: "grid" | "list";
}

function ProductCardComponent({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const hasMounted = useHasMounted();

  const inWishlist = hasMounted ? isInWishlist(product._id) : false;
  const displayPrice = useMemo(
    () => product.salePrice ?? product.price,
    [product.salePrice, product.price]
  );
  const categoryName = useMemo(
    () =>
      typeof product.category === "object" ? product.category.name : "",
    [product.category]
  );
  const discountAmount = useMemo(() => {
    if (product.salePrice && product.price > product.salePrice) {
      return product.price - product.salePrice;
    }
    return null;
  }, [product.price, product.salePrice]);
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;

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

      toast.success(`${product.name} added to cart!`, {
        description: "View your cart to checkout",
      });
    },
    [addItem, product]
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

  const handleImageError = useCallback(() => setImageError(true), []);

  const starElements = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className="w-3 h-3"
        fill={star <= Math.round(product.rating) ? "#ffe600" : "transparent"}
        stroke={star <= Math.round(product.rating) ? "#ffe600" : "#8888aa"}
      />
    ));
  }, [product.rating]);

  const badges = useMemo(() => {
    if (product.isOutOfStock) {
      return (
        <span className="absolute top-3 left-3 z-30 bg-gaming-dark/90 text-gaming-textMuted border border-gaming-border px-2.5 py-1 text-xs font-semibold rounded-md">
          Out of Stock
        </span>
      );
    }

    return (
      <>
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-30 bg-neon-pink/90 text-white px-2.5 py-1 text-xs font-bold rounded-md shadow-lg">
            -{product.discountPercentage}%
          </span>
        )}
        {product.isNewArrival && !hasDiscount && (
          <span className="absolute top-3 left-3 z-30 bg-neon-cyan/90 text-gaming-dark px-2.5 py-1 text-xs font-bold rounded-md shadow-lg">
            New
          </span>
        )}
        {product.isBestSeller && !hasDiscount && !product.isNewArrival && (
          <span className="absolute top-3 left-3 z-30 bg-neon-yellow/90 text-gaming-dark px-2.5 py-1 text-xs font-bold rounded-md shadow-lg">
            Best Seller
          </span>
        )}
      </>
    );
  }, [product, hasDiscount]);

  const variantDots = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    const dots = product.variants.slice(0, 4);
    return (
      <div className="flex items-center gap-1.5 mt-2">
        {dots.map((variant, idx) => (
          <span
            key={idx}
            className="w-3.5 h-3.5 rounded-full border-2 border-gaming-surface/80 bg-gaming-border"
            title={variant.name}
          />
        ))}
        {product.variants.length > 4 && (
          <span className="text-xs text-gaming-textMuted">
            +{product.variants.length - 4}
          </span>
        )}
      </div>
    );
  }, [product.variants]);

  if (viewMode === "list") {
    return (
      <div className="bg-gaming-surface/80 border border-gaming-border rounded-2xl overflow-hidden group hover:border-neon-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)]">
        <div className="flex gap-5 p-4">
          <Link
            href={`/products/${product.slug}`}
            className="relative overflow-hidden w-48 h-48 flex-shrink-0 bg-gaming-dark rounded-xl"
          >
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gaming-border" />
              </div>
            ) : (
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 12rem, 12rem"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={handleImageError}
              />
            )}

            {badges}

            <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gaming-dark/40 backdrop-blur-sm">
              <button
                onClick={handleWishlist}
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 active:scale-90 ${
                  inWishlist
                    ? "bg-neon-pink text-white"
                    : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink"
                }`}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
              </button>
              <button
                className="p-2.5 rounded-full bg-gaming-dark/80 backdrop-blur-sm text-gaming-textMuted hover:text-neon-cyan transition-all duration-200 active:scale-90"
                title="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </Link>

          <div className="flex-1 py-1 flex flex-col min-w-0">
            {categoryName && (
              <p className="text-[11px] text-gaming-textMuted mb-1 uppercase tracking-wider font-medium">
                {categoryName}
              </p>
            )}

            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-gaming-text group-hover:text-neon-cyan transition-colors duration-200 text-lg leading-snug line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center gap-0.5">{starElements}</div>
                <span className="text-sm text-gaming-textMuted font-medium">
                  ({product.reviewCount})
                </span>
              </div>
            )}

            <div className="mt-auto flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-neon-cyan font-bold text-2xl tracking-tight">
                    {formatPrice(displayPrice)}
                  </span>
                  {product.salePrice && product.price > product.salePrice && (
                    <span className="text-gaming-textMuted line-through text-lg">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {discountAmount && (
                  <p className="text-xs text-neon-green mb-2">
                    Save {formatPrice(discountAmount)}
                  </p>
                )}

                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      product.isOutOfStock
                        ? "bg-red-500"
                        : product.stockQuantity <= 5
                          ? "bg-neon-yellow"
                          : "bg-neon-green"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      product.isOutOfStock
                        ? "text-red-500"
                        : product.stockQuantity <= 5
                          ? "text-neon-yellow"
                          : "text-neon-green"
                    }`}
                  >
                    {product.isOutOfStock
                      ? "Out of Stock"
                      : product.stockQuantity <= 5
                        ? `Low Stock (${product.stockQuantity} left)`
                        : "In Stock"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-xl transition-all duration-200 active:scale-90 hover:scale-105 ${
                    inWishlist
                      ? "bg-neon-pink text-white"
                      : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink border border-gaming-border"
                  }`}
                >
                  <Heart className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.isOutOfStock}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-cyan-600 text-gaming-dark font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-200 active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gaming-surface/80 border border-gaming-border rounded-2xl overflow-hidden group hover:border-neon-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)]">
      <div>
        <div className="relative aspect-square overflow-hidden bg-gaming-dark">
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
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={handleImageError}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {badges}

          <div className="absolute right-3 top-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 active:scale-90 hover:scale-110 ${
                inWishlist
                  ? "bg-neon-pink text-white"
                  : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink border border-white/10"
              }`}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
            </button>

            <button
              className="p-2.5 rounded-full bg-gaming-dark/80 backdrop-blur-sm text-gaming-textMuted hover:text-neon-cyan border border-white/10 transition-all duration-200 active:scale-90 hover:scale-110"
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-30 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={product.isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-cyan-600 text-gaming-dark font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="p-4">
          {categoryName && (
            <p className="text-[11px] text-gaming-textMuted mb-1.5 uppercase tracking-wider font-medium">
              {categoryName}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gaming-text group-hover:text-neon-cyan transition-colors duration-200 line-clamp-2 text-sm leading-snug mb-2">
              {product.name}
            </h3>
          </Link>

          {variantDots}

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-0.5">{starElements}</div>
              <span className="text-xs text-gaming-textMuted font-medium">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-neon-cyan font-bold text-lg tracking-tight">
                {formatPrice(displayPrice)}
              </span>
              {product.salePrice && product.price > product.salePrice && (
                <span className="text-gaming-textMuted line-through text-sm">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {discountAmount && (
              <p className="text-[11px] text-neon-green mt-0.5 font-medium">
                Save {formatPrice(discountAmount)}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  product.isOutOfStock
                    ? "bg-red-500"
                    : product.stockQuantity <= 5
                      ? "bg-neon-yellow"
                      : "bg-neon-green"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  product.isOutOfStock
                    ? "text-red-500"
                    : product.stockQuantity <= 5
                      ? "text-neon-yellow"
                      : "text-neon-green"
                }`}
              >
                {product.isOutOfStock
                  ? "Out of Stock"
                  : product.stockQuantity <= 5
                    ? `Low Stock (${product.stockQuantity} left)`
                    : "In Stock"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;
