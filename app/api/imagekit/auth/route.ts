import { NextResponse } from "next/server";
import { getAuthenticationParameters } from "@/lib/imagekit";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authParams = getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch (error) {
    const message =
      error instanceof Error &&
      error.message.includes("IMAGEKIT_PRIVATE_KEY")
        ? "ImageKit is not configured"
        : "Failed to get authentication parameters";

    return NextResponse.json(
      { error: message },
      { status: message.includes("not configured") ? 503 : 500 }
    );
  }
}
