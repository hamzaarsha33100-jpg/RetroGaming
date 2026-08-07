import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings, { DEFAULT_SETTINGS } from "@/models/Settings";
import { auth } from "@/lib/auth";
import { invalidateSettingsCache } from "@/lib/settings";

async function getSettings() {
  await connectDB();
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }
  return settings;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getSettings();
    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(settings)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        siteName: body.siteName,
        supportEmail: body.supportEmail,
        contactPhone: body.contactPhone,
        contactAddress: body.contactAddress,
        businessHours: body.businessHours,
        social: body.social ?? {},
        freeShippingThreshold: body.freeShippingThreshold,
        taxRate: body.taxRate,
        maintenanceMode: body.maintenanceMode,
        allowRegistrations: body.allowRegistrations,
        emailNotifications: body.emailNotifications,
        email: body.email ?? {},
        newsletter: body.newsletter ?? {},
        notifications: body.notifications ?? {},
        countdown: body.countdown ?? {},
        inventory: body.inventory ?? {},
        seo: body.seo ?? {},
      },
      { new: true, upsert: true, runValidators: true }
    );

    invalidateSettingsCache();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(settings)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
