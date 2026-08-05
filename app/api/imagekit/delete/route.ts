import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteImageKitFile } from "@/lib/imagekit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    if (!fileId || typeof fileId !== "string") {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    await deleteImageKitFile(fileId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
