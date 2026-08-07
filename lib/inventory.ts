import "server-only";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import NotifyRequest from "@/models/NotifyRequest";
import { getSettings } from "@/lib/settings";
import { createAdminNotification } from "@/lib/notifications";
import { sendBackInStockEmail, sendLowStockEmail, sendOutOfStockEmail } from "@/lib/email";

export interface StockResult {
  ok: boolean;
  error?: string;
}

/**
 * Decrement product stock after a successful order. Also notifies
 * interested customers when a previously out-of-stock product is
 * reduced (unused here) — used at order time to keep totals in sync.
 */
export async function decrementStock(
  productId: string,
  quantity: number
): Promise<StockResult> {
  try {
    await connectDB();
    const product = await Product.findById(productId);
    if (!product) return { ok: false, error: "Product not found" };
    if (product.stockQuantity < quantity) {
      return { ok: false, error: "Insufficient stock" };
    }
    const newStock = product.stockQuantity - quantity;
    await Product.findByIdAndUpdate(productId, {
      $inc: { stockQuantity: -quantity },
      isOutOfStock: newStock <= 0,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update stock" };
  }
}

/**
 * Restore stock when an order is cancelled or refunded.
 * Idempotent — guarded by the caller via order.stockRestored.
 */
export async function restoreStock(
  productId: string,
  quantity: number
): Promise<StockResult> {
  try {
    await connectDB();
    await Product.findByIdAndUpdate(productId, {
      $inc: { stockQuantity: quantity },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to restore stock" };
  }
}

/** Returns true when the product's stock is at or below the threshold. */
export function isLowStock(stock: number, threshold: number): boolean {
  return stock > 0 && stock <= threshold;
}

/** Get the effective low-stock threshold for a product (falls back to global setting). */
export async function getLowStockThreshold(
  productMinStock?: number
): Promise<number> {
  if (productMinStock && productMinStock > 0) return productMinStock;
  const settings = await getSettings();
  return settings.inventory?.lowStockThreshold ?? 5;
}

/** Detect and notify about products that hit low-stock or out-of-stock state. */
export async function checkAndAlertStock(
  productId: string,
  newStock: number
): Promise<void> {
  try {
    const settings = await getSettings();
    if (!settings.inventory?.lowStockAlerts) return;

    const threshold = settings.inventory.lowStockThreshold ?? 5;
    const product = await Product.findById(productId).select(
      "name slug stockQuantity minStockLevel"
    );

    if (!product) return;

    if (newStock <= 0) {
      await createAdminNotification({
        type: "out_of_stock",
        title: "Product out of stock",
        message: `${product.name} is now out of stock.`,
        severity: "danger",
        link: `/admin/products`,
        data: { productId, name: product.name },
      });
      if (settings.emailNotifications) {
        sendOutOfStockEmail({
          to: settings.supportEmail,
          productName: product.name,
          productSlug: product.slug,
        }).catch(() => undefined);
      }
    } else if (isLowStock(newStock, threshold)) {
      await createAdminNotification({
        type: "low_stock",
        title: "Low stock warning",
        message: `${product.name} is low on stock (${newStock} left).`,
        severity: "warning",
        link: `/admin/products`,
        data: { productId, name: product.name, stock: newStock },
      });
      if (settings.emailNotifications) {
        sendLowStockEmail({
          to: settings.supportEmail,
          productName: product.name,
          productSlug: product.slug,
          stock: newStock,
        }).catch(() => undefined);
      }
    }
  } catch {
    // Stock alerts must never break the primary flow
  }
}

/** Notify waiting customers when a product comes back in stock. */
export async function notifyBackInStock(productId: string): Promise<void> {
  try {
    await connectDB();
    const requests = await NotifyRequest.find({
      product: productId,
      type: "back_in_stock",
      isNotified: false,
    })
      .populate("product", "name slug")
      .lean();

    if (requests.length === 0) return;

    for (const request of requests) {
      const product = request.product as unknown as {
        name: string;
        slug: string;
      };
      sendBackInStockEmail({
        to: request.email,
        productName: product.name,
        productUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/products/${product.slug}`,
      }).catch(() => undefined);
      await NotifyRequest.findByIdAndUpdate(request._id, {
        isNotified: true,
        notifiedAt: new Date(),
      });
    }
  } catch {
    // best-effort
  }
}
