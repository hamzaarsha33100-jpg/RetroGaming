import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculateTax, calculateShipping } from "@/lib/utils";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalBaseUrl =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to get PayPal access token");
  }

  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { error: "PayPal is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { items, couponDiscount = 0 } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (
        acc: number,
        item: { price: number; salePrice?: number; quantity: number }
      ) => {
        const price = item.salePrice ?? item.price;
        return acc + price * item.quantity;
      },
      0
    );

    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    const total = subtotal + tax + shipping - couponDiscount;

    const accessToken = await getPayPalAccessToken();

    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: { currency_code: "USD", value: subtotal.toFixed(2) },
                tax_total: { currency_code: "USD", value: tax.toFixed(2) },
                shipping: {
                  currency_code: "USD",
                  value: shipping.toFixed(2),
                },
                discount: {
                  currency_code: "USD",
                  value: couponDiscount.toFixed(2),
                },
              },
            },
          },
        ],
        application_context: {
          brand_name: "Retro Gaming",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?paypal=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?paypal=cancel`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.message || "Failed to create PayPal order");
    }

    const paypalOrderId = orderData.id;
    const approveLink = orderData.links?.find(
      (l: { rel: string; href: string }) => l.rel === "approve"
    )?.href;

    return NextResponse.json({
      success: true,
      paypalOrderId,
      approveUrl: approveLink,
      breakdown: {
        subtotal,
        tax,
        shipping,
        discount: couponDiscount,
        total,
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create PayPal order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
