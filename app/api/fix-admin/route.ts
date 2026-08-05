import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

function canRunAdminSetup(req: NextRequest) {
  const setupSecret = process.env.SETUP_ADMIN_TOKEN;
  return Boolean(
    setupSecret && req.headers.get("x-setup-admin-token") === setupSecret
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!canRunAdminSetup(req)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();

    // Find admin user
    const admin = await User.findOne({ email: "admin@retrogaming.com" });
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin user not found. Please create one first." },
        { status: 404 }
      );
    }

    // Update password
    admin.password = "Admin@123456";
    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully!",
      credentials: process.env.NODE_ENV === "production" ? undefined : {
        email: "admin@retrogaming.com",
        password: "Admin@123456"
      }
    });
  } catch (error: any) {
    console.error("Error fixing admin:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
