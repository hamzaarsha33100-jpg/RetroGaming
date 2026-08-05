import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImageToImageKit } from "@/lib/imagekit";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const productName = String(formData.get("productName") || "product");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB" },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${slugify(productName)}-${Date.now()}.${extension}`;
    const uploaded = await uploadImageToImageKit(file, fileName);

    return NextResponse.json({ success: true, data: uploaded });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
