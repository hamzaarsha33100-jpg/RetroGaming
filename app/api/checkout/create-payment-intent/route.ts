import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { calculateTax, calculateShipping } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, couponDiscount = 0 } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (acc: number, item: { price: number; salePrice?: number; quantity: number }) => {
        const price = item.salePrice ?? item.price;
        return acc + price * item.quantity;
      },
      0
    );

    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    const total = subtotal + tax + shipping - couponDiscount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: {
        subtotal,
        tax,
        shipping,
        discount: couponDiscount,
        total,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create payment intent";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
