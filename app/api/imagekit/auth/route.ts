import { NextResponse } from "next/server";
import imagekit from "@/lib/imagekit";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authParams = imagekit.getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch {
    return NextResponse.json(
      { error: "Failed to get authentication parameters" },
      { status: 500 }
    );
  }
}
