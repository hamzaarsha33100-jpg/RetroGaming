"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function WishlistClient() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const hasMounted = useHasMounted();
  const displayItems = hasMounted ? items : [];

  const handleAddToCart = (item: any) => {
    if (item.isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      salePrice: item.salePrice,
      quantity: 1,
      maxQuantity: 100,
      isOutOfStock: item.isOutOfStock,
    });

    toast.success("Added to cart!");
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    toast.success("Removed from wishlist");
  };

  if (displayItems.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-12 text-center">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Your Wishlist is Empty
        </h3>
        <p className="text-gray-400 mb-6">
          Save your favorite products to your wishlist for easy access later!
        </p>
        <Link href="/categories">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">
          {displayItems.length} {displayItems.length === 1 ? "item" : "items"} in wishlist
        </p>
        <Button
          onClick={clearWishlist}
          variant="ghost"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          Clear All
        </Button>
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayItems.map((item, index) => {
          const displayPrice = item.salePrice ?? item.price;

          return (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 group hover:border-purple-500/40 transition"
            >
              <Link href={`/products/${item.slug}`} className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-purple-400 transition">
                    {item.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400 font-bold">
                      {formatPrice(displayPrice)}
                    </span>
                    {item.salePrice && item.price > item.salePrice && (
                      <span className="text-gray-500 line-through text-sm">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isOutOfStock ? "bg-red-500" : "bg-green-500"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        item.isOutOfStock ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {item.isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(item);
                      }}
                      disabled={item.isOutOfStock}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(item.productId);
                      }}
                      size="sm"
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <Link href="/categories">
          <Button
            variant="outline"
            className="border-purple-500/20 hover:border-purple-500/40"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
