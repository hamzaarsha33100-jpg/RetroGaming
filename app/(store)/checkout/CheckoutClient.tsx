"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Lock, Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateTax, calculateShipping, US_STATES } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address1: z.string().min(5, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().default("US"),
  phone: z.string().optional(),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  sameAsShipping: z.boolean().default(true),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#e0e0ff",
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#8888aa",
      },
    },
    invalid: {
      color: "#ff4444",
    },
  },
};

function PaymentForm({
  clientSecret,
  onSuccess,
  total,
  loading,
  setLoading,
}: {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  total: number;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (error) {
        toast.error(error.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch {
      toast.error("Payment processing failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-gaming-dark border border-gaming-border">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <motion.button
        onClick={handlePay}
        disabled={loading || !stripe}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Lock className="w-5 h-5" />
        )}
        {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
      </motion.button>

      <p className="text-center text-gaming-textMuted text-xs flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        Secured by Stripe · 256-bit SSL encryption
      </p>
    </div>
  );
}

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getSubtotal, couponDiscount, couponCode, clearCart } = useCartStore();
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [breakdown, setBreakdown] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const subtotal = getSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping - couponDiscount;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { sameAsShipping: true },
  });

  useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items, router]);

  const onShippingSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            price: i.price,
            salePrice: i.salePrice,
            quantity: i.quantity,
          })),
          couponDiscount,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
        setBreakdown(result.breakdown);
        setStep("payment");
      } else {
        toast.error(result.error || "Failed to initialize payment");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (piId: string) => {
    setLoading(true);
    try {
      const formData = getValues();
      const shippingAddress = formData.shippingAddress;
      const billingAddress = sameAsShipping
        ? shippingAddress
        : formData.billingAddress;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
          })),
          shippingAddress,
          billingAddress,
          paymentIntentId: piId,
          couponCode,
        }),
      });

      const result = await res.json();
      if (result.success) {
        clearCart();
        router.push(`/order-success?orderId=${result.data.orderId}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch {
      toast.error("Failed to complete order");
    } finally {
      setLoading(false);
    }
  };

  const AddressFields = ({ prefix }: { prefix: "shippingAddress" | "billingAddress" }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">First Name *</label>
        <input {...register(`${prefix}.firstName`)} className="input-gaming w-full" />
        {errors[prefix]?.firstName && (
          <p className="text-destructive text-xs mt-1">{errors[prefix]?.firstName?.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">Last Name *</label>
        <input {...register(`${prefix}.lastName`)} className="input-gaming w-full" />
        {errors[prefix]?.lastName && (
          <p className="text-destructive text-xs mt-1">{errors[prefix]?.lastName?.message}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-gaming-textMuted mb-1">Company (Optional)</label>
        <input {...register(`${prefix}.company`)} className="input-gaming w-full" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-gaming-textMuted mb-1">Address *</label>
        <input {...register(`${prefix}.address1`)} className="input-gaming w-full" placeholder="Street address" />
        {errors[prefix]?.address1 && (
          <p className="text-destructive text-xs mt-1">{errors[prefix]?.address1?.message}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <input {...register(`${prefix}.address2`)} className="input-gaming w-full" placeholder="Apt, suite, unit (optional)" />
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">City *</label>
        <input {...register(`${prefix}.city`)} className="input-gaming w-full" />
        {errors[prefix]?.city && (
          <p className="text-destructive text-xs mt-1">{errors[prefix]?.city?.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">State *</label>
        <select {...register(`${prefix}.state`)} className="input-gaming w-full">
          <option value="">Select state</option>
          {US_STATES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {errors[prefix]?.state && (
          <p className="text-destructive text-xs mt-1">{errors[prefix]?.state?.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">ZIP Code *</label>
        <input {...register(`${prefix}.zipCode`)} className="input-gaming w-full" placeholder="12345" />
        {errors[prefix]?.zipCode && (
          <p className="text-destructive text-xs mt-1">{errors[prefix]?.zipCode?.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">Phone</label>
        <input {...register(`${prefix}.phone`)} type="tel" className="input-gaming w-full" placeholder="(555) 555-5555" />
      </div>
    </div>
  );

  return (
    <div className="page-container py-12">
      <h1 className="text-3xl font-gaming font-bold text-white mb-8">
        {step === "shipping" ? "Shipping" : "Payment"}{" "}
        <span className="text-gradient">Information</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {step === "shipping" ? (
            <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
              <div className="gaming-card p-6">
                <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                  Shipping Address
                </h2>
                <AddressFields prefix="shippingAddress" />
              </div>

              <div className="gaming-card p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4 accent-neon-cyan"
                  />
                  <span className="text-gaming-text">Billing address same as shipping</span>
                </label>
              </div>

              {!sameAsShipping && (
                <div className="gaming-card p-6">
                  <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                    Billing Address
                  </h2>
                  <AddressFields prefix="billingAddress" />
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? "Processing..." : "Continue to Payment"}
              </motion.button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="gaming-card p-6">
                <h2 className="text-xl font-gaming font-semibold text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-neon-cyan" />
                  Secure Payment
                </h2>

                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret }}
                  >
                    <PaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      total={breakdown.total || total}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </Elements>
                )}
              </div>

              <button
                onClick={() => setStep("shipping")}
                className="text-gaming-textMuted hover:text-neon-cyan text-sm transition-colors"
              >
                ← Back to shipping
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="gaming-card p-6 sticky top-24">
            <h2 className="text-xl font-gaming font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neon-cyan" />
              Order Summary
            </h2>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-neon-cyan text-gaming-dark text-xs rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gaming-text text-sm font-medium truncate">
                      {item.name}
                    </p>
                    <p className="text-neon-cyan text-sm">
                      {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gaming-border pt-4">
              <div className="flex justify-between text-gaming-textMuted text-sm">
                <span>Subtotal</span>
                <span className="text-gaming-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gaming-textMuted text-sm">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-neon-green" : "text-gaming-text"}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gaming-textMuted text-sm">
                <span>Tax</span>
                <span className="text-gaming-text">{formatPrice(tax)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-neon-green text-sm">
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gaming-border">
                <span>Total</span>
                <span className="text-neon-cyan">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
