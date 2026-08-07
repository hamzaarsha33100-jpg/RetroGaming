"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  Bookmark,
  ArrowRight,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateTax, calculateShipping } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useQuery } from "@tanstack/react-query";

export default function CartPage() {
  const {
    items,
    savedItems,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedItem,
    getSubtotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();
  const hasMounted = useHasMounted();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      return json.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const taxRate = settingsData ? settingsData.taxRate / 100 : 0.08;
  const freeShippingThreshold = settingsData?.freeShippingThreshold ?? 75;

  const displayItems = hasMounted ? items : [];
  const displaySavedItems = hasMounted ? savedItems : [];
  const subtotal = hasMounted ? getSubtotal() : 0;
  const tax = calculateTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal, freeShippingThreshold);
  const discount = couponDiscount;
  const total = subtotal + tax + shipping - discount;

  const handleCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();

      if (data.success) {
        applyCoupon(data.code, data.discount);
        toast.success(`Coupon applied! You saved ${formatPrice(data.discount)}`);
        setCouponInput("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  if (displayItems.length === 0 && displaySavedItems.length === 0) {
    return (
      <div className="page-container py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <ShoppingBag className="w-24 h-24 text-gaming-border mx-auto mb-6" />
          <h2 className="text-2xl font-gaming font-bold text-white mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gaming-textMuted mb-8">
            Looks like you haven&apos;t added any items yet. Start shopping to
            fill it up!
          </p>
          <Link href="/categories" className="btn-primary inline-flex items-center gap-2">
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-gaming font-bold text-white mb-8"
      >
        Shopping <span className="text-gradient">Cart</span>
        <span className="text-gaming-textMuted font-normal text-xl ml-3">
          ({displayItems.length} items)
        </span>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {displayItems.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="gaming-card p-6"
              >
                <div className="flex gap-5">
                  <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="w-28 h-28 rounded-xl object-cover hover:scale-105 transition-transform duration-200 bg-gaming-dark"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-semibold text-gaming-text hover:text-neon-cyan transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {item.salePrice ? (
                            <>
                              <span className="text-neon-cyan font-bold">
                                {formatPrice(item.salePrice)}
                              </span>
                              <span className="text-gaming-textMuted line-through text-sm">
                                {formatPrice(item.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-neon-cyan font-bold">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-white font-bold text-lg">
                        {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gaming-border flex items-center justify-center text-gaming-textMuted hover:border-neon-cyan hover:text-neon-cyan transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-gaming-text font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxQuantity}
                          className="w-8 h-8 rounded-lg border border-gaming-border flex items-center justify-center text-gaming-textMuted hover:border-neon-cyan hover:text-neon-cyan transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveForLater(item.productId)}
                          className="flex items-center gap-1.5 text-sm text-gaming-textMuted hover:text-neon-cyan transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                          <Bookmark className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="flex items-center gap-1.5 text-sm text-gaming-textMuted hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Saved for Later */}
          {displaySavedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-gaming font-semibold text-white mb-4">
                Saved for Later ({displaySavedItems.length})
              </h2>
              <div className="space-y-3">
                {displaySavedItems.map((item) => (
                  <div
                    key={item.productId}
                    className="gaming-card p-4 flex items-center gap-4"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-gaming-text font-medium">
                        {item.name}
                      </h4>
                      <p className="text-neon-cyan font-semibold">
                        {formatPrice(item.salePrice ?? item.price)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToCart(item.productId)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeSavedItem(item.productId)}
                        className="p-2 text-gaming-textMuted hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="gaming-card p-6 sticky top-24">
            <h2 className="text-xl font-gaming font-bold text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gaming-textMuted">
                <span>Subtotal</span>
                <span className="text-gaming-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gaming-textMuted">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-neon-green" : "text-gaming-text"}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gaming-textMuted">
                <span>{`Tax (${Math.round(taxRate * 100)}%)`}</span>
                <span className="text-gaming-text">{formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neon-green">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            {shipping > 0 && (
              <p className="text-xs text-gaming-textMuted mb-4 p-3 bg-neon-cyan/5 border border-neon-cyan/10 rounded-lg">
                Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping!
              </p>
            )}

            {/* Coupon */}
            {!couponCode ? (
              <form onSubmit={handleCoupon} className="mb-6">
                <label className="block text-sm text-gaming-textMuted mb-2">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="input-gaming flex-1 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="btn-secondary text-sm px-4 whitespace-nowrap"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between mb-6 p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                <div className="flex items-center gap-2 text-neon-green text-sm">
                  <Tag className="w-4 h-4" />
                  <span>{couponCode}</span>
                </div>
                <button
                  onClick={() => {
                    removeCoupon();
                    toast.info("Coupon removed");
                  }}
                  className="text-gaming-textMuted hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="border-t border-gaming-border pt-4 mb-6">
              <div className="flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-neon-cyan">{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/categories">
              <button className="w-full mt-3 text-gaming-textMuted hover:text-neon-cyan text-sm transition-colors py-2">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
