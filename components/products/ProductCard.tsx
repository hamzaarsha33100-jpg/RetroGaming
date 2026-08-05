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
  variant?: "default" | "compact" | "featured";
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

  if (viewMode === "list") {
    return (
      <div className="gaming-card group relative animate-fade-in">
        <div className="flex gap-4">
          <Link
            href={`/products/${product.slug}`}
            className="relative overflow-hidden w-48 h-48 bg-gaming-dark flex-shrink-0"
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
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onError={handleImageError}
              />
            )}

            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
              {product.isOutOfStock ? (
                <span className="badge-gaming bg-gaming-dark/80 text-gaming-textMuted border border-gaming-border">
                  Out of Stock
                </span>
              ) : (
                <>
                  {product.discountPercentage &&
                    product.discountPercentage > 0 && (
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
          </Link>

          <div className="flex-1 py-2 flex flex-col">
            {categoryName && (
              <p className="text-xs text-gaming-textMuted mb-1 uppercase tracking-wider">
                {categoryName}
              </p>
            )}

            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-gaming-text group-hover:text-neon-cyan transition-colors duration-200 text-lg mb-2">
                {product.name}
              </h3>
            </Link>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-0.5">{starElements}</div>
                <span className="text-sm text-gaming-textMuted">
                  ({product.reviewCount})
                </span>
              </div>
            )}

            {product.shortDescription && (
              <p className="text-sm text-gaming-textMuted mb-4 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

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

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-lg transition-all duration-200 active:scale-95 ${
                    inWishlist
                      ? "bg-neon-pink text-white"
                      : "bg-gaming-dark/80 text-gaming-textMuted hover:text-neon-pink"
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={inWishlist ? "currentColor" : "none"}
                  />
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.isOutOfStock}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold hover:shadow-neon transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted"
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
    <div className="gaming-card group relative animate-fade-in hover:-translate-y-1 transition-transform duration-300">
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
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={handleImageError}
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
                    Trending
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
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="w-4 h-4"
                fill={inWishlist ? "currentColor" : "none"}
              />
            </button>

            <button
              className="p-2 rounded-lg bg-gaming-dark/80 backdrop-blur-sm text-gaming-textMuted hover:text-neon-cyan transition-all duration-200 active:scale-95"
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={product.isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-accent text-gaming-dark font-semibold text-sm hover:shadow-neon transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gaming-border disabled:to-gaming-border disabled:text-gaming-textMuted"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="p-4">
          {categoryName && (
            <p className="text-xs text-gaming-textMuted mb-1 uppercase tracking-wider">
              {categoryName}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-gaming-text group-hover:text-neon-cyan transition-colors duration-200 line-clamp-2 text-sm leading-snug mb-2">
              {product.name}
            </h3>
          </Link>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">{starElements}</div>
              <span className="text-xs text-gaming-textMuted">
                ({product.reviewCount})
              </span>
            </div>
          )}

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
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;
