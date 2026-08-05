"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Bookmark,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { formatPrice } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const {
    items,
    savedItems,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedItem,
    getSubtotal,
  } = useCartStore();
  const hasMounted = useHasMounted();

  const displayItems = hasMounted ? items : [];
  const displaySavedItems = hasMounted ? savedItems : [];
  const subtotal = hasMounted ? getSubtotal() : 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gaming-surface border-l border-gaming-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gaming-border">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-neon-cyan" />
                <h2 className="font-gaming font-bold text-lg text-white">
                  Cart ({displayItems.length})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {displayItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <ShoppingBag className="w-16 h-16 text-gaming-textMuted mb-4" />
                  <h3 className="text-gaming-text font-medium mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gaming-textMuted text-sm mb-6">
                    Add some gaming gear to get started
                  </p>
                  <Link
                    href="/categories"
                    onClick={closeCart}
                    className="btn-primary text-sm"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {displayItems.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="gaming-card p-3"
                    >
                      <div className="flex gap-3">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gaming-dark"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                          >
                            <h4 className="text-sm font-medium text-gaming-text hover:text-neon-cyan transition-colors truncate">
                              {item.name}
                            </h4>
                          </Link>

                          <div className="flex items-center gap-2 mt-1">
                            {item.salePrice ? (
                              <>
                                <span className="text-neon-cyan font-semibold text-sm">
                                  {formatPrice(item.salePrice)}
                                </span>
                                <span className="text-gaming-textMuted line-through text-xs">
                                  {formatPrice(item.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-neon-cyan font-semibold text-sm">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="w-7 h-7 rounded border border-gaming-border flex items-center justify-center text-gaming-textMuted hover:border-neon-cyan hover:text-neon-cyan transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm text-gaming-text font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= item.maxQuantity}
                                className="w-7 h-7 rounded border border-gaming-border flex items-center justify-center text-gaming-textMuted hover:border-neon-cyan hover:text-neon-cyan transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => saveForLater(item.productId)}
                                className="p-1.5 text-gaming-textMuted hover:text-neon-cyan transition-colors"
                                title="Save for later"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="p-1.5 text-gaming-textMuted hover:text-destructive transition-colors"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Saved for Later */}
              {displaySavedItems.length > 0 && (
                <div className="pt-4 border-t border-gaming-border">
                  <h3 className="text-sm font-medium text-gaming-textMuted mb-3">
                    Saved for Later ({displaySavedItems.length})
                  </h3>
                  {displaySavedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gaming-text truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-neon-cyan">
                          {formatPrice(item.salePrice ?? item.price)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveToCart(item.productId)}
                          className="text-xs text-neon-cyan hover:text-neon-cyan/80 px-2 py-1 border border-neon-cyan/30 rounded transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => removeSavedItem(item.productId)}
                          className="p-1 text-gaming-textMuted hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayItems.length > 0 && (
              <div className="p-6 border-t border-gaming-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gaming-textMuted">Subtotal</span>
                  <span className="text-white font-semibold text-lg">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-gaming-textMuted">
                  Shipping and taxes calculated at checkout
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
