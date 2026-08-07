"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const COUNTRIES = [
  { value: "PK", label: "Pakistan" },
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
];

const clientDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  whatsapp: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  orderNotes: z.string().optional(),
});

type ClientDetailsForm = z.infer<typeof clientDetailsSchema>;

interface BuyNowProduct {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice: number | null;
  quantity: number;
}

function ClientDetailsForm() {
  const router = useRouter();
  const [product, setProduct] = useState<BuyNowProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientDetailsForm>({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: { country: "PK" },
  });

  useEffect(() => {
    const stored = localStorage.getItem("buyNowProduct");
    if (stored) {
      setProduct(JSON.parse(stored));
    }
  }, []);

  const onSubmit = (data: ClientDetailsForm) => {
    if (!product) {
      toast.error("No product selected. Please go back and try again.");
      return;
    }

    setLoading(true);
    localStorage.setItem("buyNowClientDetails", JSON.stringify(data));
    router.push("/checkout?buyNow=true");
  };

  if (!product) {
    return (
      <div className="page-container py-24 text-center">
        <p className="text-gaming-textMuted mb-4">No product selected for purchase.</p>
        <Link href="/categories" className="btn-primary inline-flex items-center gap-2">
          Browse Products
        </Link>
      </div>
    );
  }

  const displayPrice = product.salePrice ?? product.price;

  return (
    <div className="page-container py-12">
      <Link
        href={`/products/${product.slug}`}
        className="inline-flex items-center gap-2 text-gaming-textMuted hover:text-neon-cyan transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to product
      </Link>

      <h1 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-8">
        Client <span className="text-gradient">Details</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="gaming-card p-6">
              <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register("fullName")}
                    className="input-gaming w-full"
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="input-gaming w-full"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="input-gaming w-full"
                    placeholder="+92 300 1234567"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    {...register("whatsapp")}
                    type="tel"
                    className="input-gaming w-full"
                    placeholder="+92 300 1234567 (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="gaming-card p-6">
              <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    Country *
                  </label>
                  <select {...register("country")} className="input-gaming w-full">
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    City *
                  </label>
                  <input
                    {...register("city")}
                    className="input-gaming w-full"
                    placeholder="Lahore"
                  />
                  {errors.city && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    Address *
                  </label>
                  <input
                    {...register("address")}
                    className="input-gaming w-full"
                    placeholder="Street address, house number"
                  />
                  {errors.address && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gaming-textMuted mb-1">
                    Postal Code *
                  </label>
                  <input
                    {...register("postalCode")}
                    className="input-gaming w-full"
                    placeholder="54000"
                  />
                  {errors.postalCode && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="gaming-card p-6">
              <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                Order Notes
              </h2>
              <textarea
                {...register("orderNotes")}
                className="input-gaming w-full h-24 resize-none"
                placeholder="Any special instructions for your order (optional)"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
              {loading ? "Processing..." : "Proceed to Checkout"}
            </motion.button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="gaming-card p-6 sticky top-24">
            <h2 className="text-xl font-gaming font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neon-cyan" />
              Order Summary
            </h2>

            <div className="flex gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-neon-cyan text-gaming-dark text-xs rounded-full flex items-center justify-center font-bold">
                  {product.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gaming-text font-medium truncate">
                  {product.name}
                </p>
                <p className="text-neon-cyan font-bold mt-1">
                  {formatPrice(displayPrice)}
                </p>
                {product.salePrice && product.price > product.salePrice && (
                  <p className="text-gaming-textMuted line-through text-sm">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-gaming-border pt-4">
              <div className="flex justify-between text-gaming-textMuted text-sm">
                <span>Subtotal ({product.quantity} item{product.quantity > 1 ? "s" : ""})</span>
                <span className="text-gaming-text">
                  {formatPrice(displayPrice * product.quantity)}
                </span>
              </div>
              <div className="flex justify-between text-gaming-textMuted text-sm">
                <span>Shipping</span>
                <span className="text-gaming-text">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gaming-border">
                <span>Total</span>
                <span className="text-neon-cyan">
                  {formatPrice(displayPrice * product.quantity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuyNowClient() {
  return <ClientDetailsForm />;
}
