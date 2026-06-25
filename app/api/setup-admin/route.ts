import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
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

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("Admin@123456", salt);

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@retrogaming.com",
      password: hashedPassword,
      role: "admin",
      provider: "credentials",
      isActive: true,
      addresses: [],
      wishlist: [],
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully!",
      credentials: {
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
