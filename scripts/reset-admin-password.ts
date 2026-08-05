import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@retrogaming.com";
const ADMIN_PASSWORD = "Admin@123456";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] ??= value;
  }
}

async function resetAdminPassword() {
  loadLocalEnv();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local first.");
  }

  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection did not expose a database.");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const result = await db.collection("users").updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: "Admin User",
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: "admin",
        provider: "credentials",
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log(
    result.upsertedCount
      ? "Admin user created successfully."
      : "Admin password reset successfully."
  );
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

resetAdminPassword()
  .catch((error) => {
    console.error("Failed to reset admin password:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
