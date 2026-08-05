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

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@retrogaming.com" });
    
    if (existingAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Admin user already exists",
          email: "admin@retrogaming.com"
        },
        { status: 400 }
      );
    }

    // Create admin user
    await User.create({
      name: "Admin User",
      email: "admin@retrogaming.com",
      password: "Admin@123456",
      role: "admin",
      provider: "credentials",
      isActive: true,
      addresses: [],
      wishlist: [],
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully!",
      credentials: process.env.NODE_ENV === "production" ? undefined : {
        email: "admin@retrogaming.com",
        password: "Admin@123456",
        warning: "IMPORTANT: Change password after first login!"
      }
    });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create admin user" 
      },
      { status: 500 }
    );
  }
}
