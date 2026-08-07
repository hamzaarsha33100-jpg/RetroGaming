"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { toast } from "sonner";
import {
  Lock,
  Loader2,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import {
  formatPrice,
  calculateTax,
  calculateShipping,
  US_STATES,
} from "@/lib/utils";

const hasStripeKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const hasPaypalKey = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const stripePromise = hasStripeKey
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : null;

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

interface BuyNowProduct {
  productId: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  quantity: number;
}

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

function StripePaymentForm({
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

function PayPalPaymentForm({
  onSuccess,
  total,
  loading,
  setLoading,
}: {
  onSuccess: (paymentId: string) => void;
  total: number;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  const createOrder = async () => {
    setLoading(true);
    try {
      const { items } = useCartStore.getState();
      const res = await fetch("/api/checkout/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            price: i.price,
            salePrice: i.salePrice,
            quantity: i.quantity,
          })),
          couponDiscount: useCartStore.getState().couponDiscount,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to create PayPal order");
      }

      return result.paypalOrderId;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create PayPal order"
      );
      setLoading(false);
      return "";
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId: data.orderID }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to capture PayPal payment");
      }

      onSuccess(result.paymentId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to capture PayPal payment"
      );
      setLoading(false);
    }
  };

  const onError = () => {
    toast.error("PayPal payment failed");
    setLoading(false);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
        <span className="ml-2 text-gaming-textMuted">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "silver",
          shape: "rect",
          label: "pay",
          height: 50,
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={loading}
      />

      <p className="text-center text-gaming-textMuted text-xs flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        Secured by PayPal · Buyer Protection
      </p>
    </div>
  );
}

function CODPaymentForm({
  onSuccess,
  total,
  loading,
  setLoading,
}: {
  onSuccess: () => void;
  total: number;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { items } = useCartStore.getState();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
          })),
          paymentMethod: "cod",
          paymentStatus: "pending",
        }),
      });

      const result = await res.json();
      if (result.success) {
        onSuccess();
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-gaming-dark border border-gaming-border">
        <div className="flex items-center gap-3">
          <Banknote className="w-8 h-8 text-neon-green" />
          <div>
            <p className="text-gaming-text font-medium">Cash On Delivery</p>
            <p className="text-gaming-textMuted text-sm">
              Pay {formatPrice(total)} when your order arrives
            </p>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Banknote className="w-5 h-5" />
        )}
        {loading ? "Placing Order..." : `Place Order — Pay on Delivery`}
      </motion.button>

      <p className="text-center text-gaming-textMuted text-xs">
        Payment will be collected at the time of delivery
      </p>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  couponDiscount,
  buyNowProduct,
}: {
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  couponDiscount: number;
  buyNowProduct?: BuyNowProduct | null;
}) {
  const displayItems = buyNowProduct ? [buyNowProduct] : items;

  return (
    <div className="gaming-card p-6 sticky top-24">
      <h2 className="text-xl font-gaming font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-neon-cyan" />
        Order Summary
      </h2>

      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {displayItems.map((item: any) => {
          const effectivePrice = item.salePrice ?? item.price;
          return (
            <div
              key={item.productId}
              className="flex gap-3 p-3 rounded-lg bg-gaming-dark border border-gaming-border"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-neon-cyan text-gaming-dark text-xs rounded-full flex items-center justify-center font-bold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-gaming-text text-sm font-medium truncate">
                    {item.name}
                  </p>
                  {item.salePrice != null && item.salePrice < item.price && (
                    <p className="text-gaming-textMuted text-xs line-through">
                      {formatPrice(item.price)}
                    </p>
                  )}
                </div>
                <p className="text-neon-cyan text-sm font-semibold">
                  {formatPrice(effectivePrice * item.quantity)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-gaming-border pt-4">
        <div className="flex justify-between text-gaming-textMuted text-sm">
          <span>Subtotal</span>
          <span className="text-gaming-text">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gaming-textMuted text-sm">
          <span>Shipping</span>
          <span
            className={
              shipping === 0 ? "text-neon-green" : "text-gaming-text"
            }
          >
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
  );
}

function AddressFields({
  prefix,
  errors,
}: {
  prefix: "shippingAddress" | "billingAddress";
  errors: any;
}) {
  const { register } = useFormContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">
          First Name *
        </label>
        <input
          {...register(`${prefix}.firstName`)}
          className="input-gaming w-full"
        />
        {errors[prefix]?.firstName && (
          <p className="text-destructive text-xs mt-1">
            {errors[prefix]?.firstName?.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">
          Last Name *
        </label>
        <input
          {...register(`${prefix}.lastName`)}
          className="input-gaming w-full"
        />
        {errors[prefix]?.lastName && (
          <p className="text-destructive text-xs mt-1">
            {errors[prefix]?.lastName?.message}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-gaming-textMuted mb-1">
          Company (Optional)
        </label>
        <input
          {...register(`${prefix}.company`)}
          className="input-gaming w-full"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-gaming-textMuted mb-1">
          Address *
        </label>
        <input
          {...register(`${prefix}.address1`)}
          className="input-gaming w-full"
          placeholder="Street address"
        />
        {errors[prefix]?.address1 && (
          <p className="text-destructive text-xs mt-1">
            {errors[prefix]?.address1?.message}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <input
          {...register(`${prefix}.address2`)}
          className="input-gaming w-full"
          placeholder="Apt, suite, unit (optional)"
        />
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">
          City *
        </label>
        <input
          {...register(`${prefix}.city`)}
          className="input-gaming w-full"
        />
        {errors[prefix]?.city && (
          <p className="text-destructive text-xs mt-1">
            {errors[prefix]?.city?.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">
          State *
        </label>
        <select
          {...register(`${prefix}.state`)}
          className="input-gaming w-full"
        >
          <option value="">Select state</option>
          {US_STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors[prefix]?.state && (
          <p className="text-destructive text-xs mt-1">
            {errors[prefix]?.state?.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">
          ZIP Code *
        </label>
        <input
          {...register(`${prefix}.zipCode`)}
          className="input-gaming w-full"
          placeholder="12345"
        />
        {errors[prefix]?.zipCode && (
          <p className="text-destructive text-xs mt-1">
            {errors[prefix]?.zipCode?.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gaming-textMuted mb-1">
          Phone
        </label>
        <input
          {...register(`${prefix}.phone`)}
          type="tel"
          className="input-gaming w-full"
          placeholder="(555) 555-5555"
        />
      </div>
    </div>
  );
}

function CheckoutFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    getSubtotal,
    couponDiscount,
    couponCode,
    clearCart,
  } = useCartStore();

  const buyNowParam = searchParams.get("buyNow");
  const isBuyNow = buyNowParam === "true";

  const [buyNowProduct, setBuyNowProduct] = useState<BuyNowProduct | null>(
    null
  );
  const [buyNowDetails, setBuyNowDetails] = useState<any>(null);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "stripe" | "paypal"
  >("cod");
  const [clientSecret, setClientSecret] = useState("");
  const [breakdown, setBreakdown] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [settings, setSettings] = useState<{
    taxRate: number;
    freeShippingThreshold: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setSettings({
            taxRate: json.data.taxRate,
            freeShippingThreshold: json.data.freeShippingThreshold,
          });
        }
      })
      .catch(() => {});
  }, []);

  const taxRate = settings ? settings.taxRate / 100 : 0.08;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 75;

  const cartSubtotal = getSubtotal();
  const cartTax = calculateTax(cartSubtotal, taxRate);
  const cartShipping = calculateShipping(cartSubtotal, freeShippingThreshold);
  const cartTotal = cartSubtotal + cartTax + cartShipping - couponDiscount;

  const subtotal = buyNowProduct
    ? (buyNowProduct.salePrice ?? buyNowProduct.price) *
      buyNowProduct.quantity
    : cartSubtotal;
  const tax = calculateTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal, freeShippingThreshold);
  const total = subtotal + tax + shipping - (isBuyNow ? 0 : couponDiscount);

  const methods = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { sameAsShipping: true },
  });

  const {
    handleSubmit,
    getValues,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isBuyNow) {
      try {
        const stored = localStorage.getItem("buyNowProduct");
        const details = localStorage.getItem("buyNowClientDetails");
        if (stored) {
          setBuyNowProduct(JSON.parse(stored));
        }
        if (details) {
          setBuyNowDetails(JSON.parse(details));
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [isBuyNow]);

  useEffect(() => {
    if (isBuyNow && buyNowProduct) return;
    if (!isBuyNow && items.length === 0) router.push("/cart");
  }, [items, router, isBuyNow, buyNowProduct]);

  useEffect(() => {
    const paypalSuccess = searchParams.get("paypal");
    if (paypalSuccess === "success") {
      toast.success("PayPal payment successful!");
      clearCart();
      router.push("/order-success");
    } else if (paypalSuccess === "cancel") {
      toast.error("PayPal payment was cancelled");
    }
  }, [searchParams, router, clearCart]);

  const onShippingSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      if (paymentMethod === "stripe" && hasStripeKey) {
        const payloadItems = isBuyNow
          ? [
              {
                price: buyNowProduct!.price,
                salePrice: buyNowProduct!.salePrice,
                quantity: buyNowProduct!.quantity,
              },
            ]
          : items.map((i) => ({
              price: i.price,
              salePrice: i.salePrice,
              quantity: i.quantity,
            }));

        const res = await fetch("/api/checkout/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: payloadItems,
            couponDiscount: isBuyNow ? 0 : couponDiscount,
          }),
        });

        const result = await res.json();
        if (result.success) {
          setClientSecret(result.clientSecret);
          setBreakdown(result.breakdown);
          setStep("payment");
        } else {
          toast.error(result.error || "Failed to initialize payment");
        }
      } else {
        setBreakdown({ subtotal, tax, shipping, total });
        setStep("payment");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCODSuccess = () => {
    if (!isBuyNow) clearCart();
    localStorage.removeItem("buyNowProduct");
    toast.success("Order placed successfully! Pay on delivery.");
    router.push(`/order-success?orderId=cod-${Date.now()}`);
  };

  const handlePaymentSuccess = async (piId: string) => {
    setLoading(true);
    try {
      const formData = getValues();
      const shippingAddress = formData.shippingAddress;
      const billingAddress = sameAsShipping
        ? shippingAddress
        : formData.billingAddress;

      const orderItems = isBuyNow
        ? [
            {
              productId: buyNowProduct!.productId,
              name: buyNowProduct!.name,
              quantity: buyNowProduct!.quantity,
            },
          ]
        : items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
          }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress,
          billingAddress,
          paymentIntentId: piId,
          couponCode: isBuyNow ? undefined : couponCode,
        }),
      });

      const result = await res.json();
      if (result.success) {
        if (!isBuyNow) clearCart();
        localStorage.removeItem("buyNowProduct");
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

  const showStripe = hasStripeKey && paymentMethod === "stripe" && clientSecret;
  const showPaypal = hasPaypalKey && paymentMethod === "paypal";
  const showCod = paymentMethod === "cod";

  return (
    <div className="page-container py-8 md:py-12">
      {isBuyNow && (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gaming-textMuted hover:text-neon-cyan text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <h1 className="text-2xl md:text-3xl font-gaming font-bold text-white mb-8">
        {step === "shipping" ? "Shipping" : "Payment"}{" "}
        <span className="text-gradient">Information</span>
      </h1>

      <FormProvider {...methods}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <form
                onSubmit={handleSubmit(onShippingSubmit)}
                className="space-y-6"
              >
                <div className="gaming-card p-6">
                  <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                    {isBuyNow ? "Your Details" : "Shipping Address"}
                  </h2>
                  <AddressFields
                    prefix="shippingAddress"
                    errors={errors}
                  />
                </div>

                {!isBuyNow && (
                  <div className="gaming-card p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="w-4 h-4 accent-neon-cyan"
                      />
                      <span className="text-gaming-text">
                        Billing address same as shipping
                      </span>
                    </label>
                  </div>
                )}

                {!sameAsShipping && !isBuyNow && (
                  <div className="gaming-card p-6">
                    <h2 className="text-xl font-gaming font-semibold text-white mb-6">
                      Billing Address
                    </h2>
                    <AddressFields
                      prefix="billingAddress"
                      errors={errors}
                    />
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : null}
                  {loading ? "Processing..." : "Continue to Payment"}
                </motion.button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Payment Method Selector */}
                <div className="gaming-card p-6">
                  <h2 className="text-xl font-gaming font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-neon-cyan" />
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 font-medium ${
                        paymentMethod === "cod"
                          ? "border-neon-green bg-neon-green/10 text-neon-green"
                          : "border-gaming-border text-gaming-textMuted hover:border-gaming-border/80"
                      }`}
                    >
                      <Banknote className="w-6 h-6" />
                      <span className="text-sm">Cash On Delivery</span>
                    </button>

                    {hasStripeKey && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("stripe")}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 font-medium ${
                          paymentMethod === "stripe"
                            ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                            : "border-gaming-border text-gaming-textMuted hover:border-gaming-border/80"
                        }`}
                      >
                        <CreditCard className="w-6 h-6" />
                        <span className="text-sm">Card (Stripe)</span>
                      </button>
                    )}

                    {hasPaypalKey && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 font-medium ${
                          paymentMethod === "paypal"
                            ? "border-[#003087] bg-[#003087]/10 text-[#0070ba]"
                            : "border-gaming-border text-gaming-textMuted hover:border-gaming-border/80"
                        }`}
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                        </svg>
                        <span className="text-sm">PayPal</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Form */}
                <div className="gaming-card p-6">
                  <h2 className="text-xl font-gaming font-semibold text-white mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-neon-cyan" />
                    Secure Payment
                  </h2>

                  {showCod && (
                    <CODPaymentForm
                      onSuccess={handleCODSuccess}
                      total={breakdown.total || total}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}

                  {showStripe && stripePromise && (
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret }}
                    >
                      <StripePaymentForm
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        total={breakdown.total || total}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </Elements>
                  )}

                  {showPaypal && (
                    <PayPalPaymentForm
                      onSuccess={handlePaymentSuccess}
                      total={breakdown.total || total}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                </div>

                <button
                  onClick={() => setStep("shipping")}
                  className="text-gaming-textMuted hover:text-neon-cyan text-sm transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to shipping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary
              items={items}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={breakdown.total || total}
              couponDiscount={isBuyNow ? 0 : couponDiscount}
              buyNowProduct={isBuyNow ? buyNowProduct : null}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
}

export default function CheckoutClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      }
    >
      <CheckoutFormInner />
    </Suspense>
  );
}
