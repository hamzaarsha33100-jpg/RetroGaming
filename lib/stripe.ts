import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required for checkout");
  }

  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
  });

  return stripe;
}

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};
