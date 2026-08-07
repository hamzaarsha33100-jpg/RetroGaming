import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Support both "email" and "email,name" formats; skip header if it looks like one
    const parsed = lines
      .slice(0, 1000)
      .map((line) => {
        const [email, name] = line.split(",").map((c) => c.trim());
        return { email: email?.toLowerCase(), name };
      })
      .filter((row) => row.email && /.+@.+\..+/.test(row.email))
      .filter((row) => row.email !== "email");

    await connectDB();

    let created = 0;
    let reactivated = 0;
    let duplicates = 0;

    for (const row of parsed) {
      const existing = await Newsletter.findOne({ email: row.email });
      if (existing) {
        if (existing.isActive) {
          duplicates += 1;
        } else {
          await Newsletter.findByIdAndUpdate(existing._id, {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: undefined,
            source: "import",
          });
          reactivated += 1;
        }
      } else {
        await Newsletter.create({
          email: row.email,
          name: row.name || undefined,
          isActive: true,
          source: "import",
        });
        created += 1;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${created} new, reactivated ${reactivated}, skipped ${duplicates} duplicates.`,
      stats: { created, reactivated, duplicates, total: parsed.length },
    });
  } catch {
    return NextResponse.json({ error: "Failed to import subscribers" }, { status: 500 });
  }
}
