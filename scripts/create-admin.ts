import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Get MongoDB URI from environment (with database name)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://hamzaarshad33100_db_user:FPIZX9BQSnx1xuR4@cluster0.g7m4jgl.mongodb.net/retrogaming?retryWrites=true&w=majority";

async function createAdmin() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      provider: String,
      isActive: Boolean,
      addresses: [Schema.Types.Mixed],
      wishlist: [Schema.Types.ObjectId],
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@retrogaming.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email: admin@retrogaming.com");
      console.log("🔓 Use password: Admin@123456");
      return;
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

    console.log("✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@retrogaming.com");
    console.log("🔑 Password: Admin@123456");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANT: Change password after first login!");
  } catch (error: any) {
    console.error("❌ Error creating admin:");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

createAdmin();
