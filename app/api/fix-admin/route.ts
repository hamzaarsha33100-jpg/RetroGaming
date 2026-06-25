import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectDB();

    // Find admin user
    const admin = await User.findOne({ email: "admin@retrogaming.com" });
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin user not found. Please create one first." },
        { status: 404 }
      );
    }

    // Generate new password hash
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("Admin@123456", salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully!",
      credentials: {
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
