import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Newsletter from "@/models/Newsletter";
import NotifyRequest from "@/models/NotifyRequest";
import { auth } from "@/lib/auth";
import { deleteImageKitFile } from "@/lib/imagekit";
import { sendNewProductEmail, sendPriceDropEmail, sendBackInStockEmail } from "@/lib/email";
import { createAdminNotification } from "@/lib/notifications";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(product)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const existingProduct = await Product.findById(id).lean() as (Record<string, any> & { _id: any }) | null;

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (
      existingProduct.mainImageFileId &&
      existingProduct.mainImageFileId !== product.mainImageFileId
    ) {
      deleteImageKitFile(existingProduct.mainImageFileId).catch((error) => {
        console.error("Failed to delete replaced ImageKit file:", error);
      });
    }

    // === Price drop notification ===
    const wasOnSale =
      (existingProduct as any).salePrice && (existingProduct as any).salePrice > 0;
    const nowOnSale = product.salePrice && product.salePrice > 0;
    const priceDropped =
      nowOnSale &&
      (!wasOnSale ||
        Number(product.salePrice) < Number((existingProduct as any).salePrice || Infinity));

    if (priceDropped && product.isActive && product.isOutOfStock !== true) {
      try {
        const targets = await NotifyRequest.find({
          product: id,
          type: "price_drop",
          isNotified: false,
          $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }],
        })
          .select("email user originalPrice")
          .limit(500)
          .lean();

        if (targets.length > 0) {
          const notifiedIds = targets.map((t) => t._id);
          const results = await Promise.allSettled(
            targets.map((t) =>
              sendPriceDropEmail({
                to: t.email,
                productName: product.name,
                oldPrice: t.originalPrice || (existingProduct as any).price,
                newPrice: product.salePrice,
                productUrl: `/products/${product.slug}`,
              })
            )
          );
          await NotifyRequest.updateMany(
            { _id: { $in: notifiedIds } },
            { $set: { isNotified: true, notifiedAt: new Date() } }
          );
          const successCount = results.filter((r) => r.status === "fulfilled").length;
          createAdminNotification({
            type: "price_drop",
            severity: "info",
            title: "Price drop emails sent",
            message: `${successCount} customer(s) notified about a price drop on "${product.name}".`,
            link: `/admin/inventory`,
          });
        }
      } catch (err) {
        console.error("Price drop emails failed:", err);
      }
    }

    // === Back in stock notification ===
    const wasOut = (existingProduct as any).isOutOfStock === true || (existingProduct as any).stockQuantity <= 0;
    const nowIn = product.isOutOfStock === false && product.stockQuantity > 0;
    if (wasOut && nowIn && product.isActive) {
      try {
        const targets = await NotifyRequest.find({
          product: id,
          type: "back_in_stock",
          isNotified: false,
          $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }],
        })
          .select("email")
          .limit(500)
          .lean();

        if (targets.length > 0) {
          const notifiedIds = targets.map((t) => t._id);
          await Promise.allSettled(
            targets.map((t) =>
              sendBackInStockEmail({
                to: t.email,
                productName: product.name,
                productUrl: `/products/${product.slug}`,
              })
            )
          );
          await NotifyRequest.updateMany(
            { _id: { $in: notifiedIds } },
            { $set: { isNotified: true, notifiedAt: new Date() } }
          );
          createAdminNotification({
            type: "back_in_stock",
            severity: "info",
            title: "Back in stock",
            message: `"${product.name}" is back in stock — ${targets.length} customer(s) notified.`,
            link: `/admin/inventory`,
          });
        }
      } catch (err) {
        console.error("Back in stock emails failed:", err);
      }
    }

    // === New arrival announcement ===
    if (
      body.isNewArrival &&
      body.isActive &&
      !(existingProduct as any).isNewArrival
    ) {
      try {
        const subscribers = await Newsletter.find({
          isActive: true,
          "consent.newProduct": true,
        })
          .select("email name")
          .limit(1000)
          .lean();
        if (subscribers.length > 0) {
          await Promise.allSettled(
            subscribers.map((s) =>
              sendNewProductEmail({
                to: s.email,
                name: s.name,
                productName: product.name,
                productImage: product.mainImage,
                productUrl: `/products/${product.slug}`,
              })
            )
          );
        }
      } catch (err) {
        console.error("New product emails failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(product)),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.mainImageFileId) {
      deleteImageKitFile(product.mainImageFileId).catch((error) => {
        console.error("Failed to delete product ImageKit file:", error);
      });
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
