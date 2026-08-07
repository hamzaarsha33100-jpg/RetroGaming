import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      success: true,
      data: {
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        contactPhone: settings.contactPhone,
        contactAddress: settings.contactAddress,
        businessHours: settings.businessHours,
        social: settings.social ?? {},
        freeShippingThreshold: settings.freeShippingThreshold,
        taxRate: settings.taxRate,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
