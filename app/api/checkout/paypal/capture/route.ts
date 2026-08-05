import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalBaseUrl =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const authHeader = Buffer.from(
    `${paypalClientId}:${paypalClientSecret}`
  ).toString("base64");

  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
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
    const { paypalOrderId } = body;

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: "PayPal order ID is required" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const captureResponse = await fetch(
      `${paypalBaseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      throw new Error(
        captureData.message || "Failed to capture PayPal payment"
      );
    }

    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];

    return NextResponse.json({
      success: true,
      paymentId: capture?.id || paypalOrderId,
      status: capture?.status || captureData.status,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : "Failed to capture PayPal payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
