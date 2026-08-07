import "server-only";
import connectDB from "@/lib/mongodb";
import AdminNotification, {
  AdminNotificationType,
} from "@/models/AdminNotification";
import { getSettings } from "@/lib/settings";

interface CreateNotificationInput {
  type: AdminNotificationType;
  title: string;
  message: string;
  severity?: "info" | "warning" | "danger" | "success";
  link?: string;
  data?: Record<string, unknown>;
}

const NOTIFICATION_CATEGORY: Partial<Record<AdminNotificationType, "order" | "stock" | "review" | "other">> = {
  new_order: "order",
  pending_order: "order",
  failed_payment: "order",
  low_stock: "stock",
  out_of_stock: "stock",
  back_in_stock: "stock",
  review: "review",
};

export async function createAdminNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    // Respect admin notification settings toggles
    const settings = await getSettings();
    const category = NOTIFICATION_CATEGORY[input.type];
    if (category === "order" && settings.notifications?.newOrderAlerts === false) return;
    if (category === "stock" && settings.notifications?.lowStockAlerts === false) return;
    if (category === "review" && settings.notifications?.reviewAlerts === false) return;

    await connectDB();
    await AdminNotification.create({
      type: input.type,
      title: input.title,
      message: input.message,
      severity: input.severity ?? "info",
      link: input.link,
      data: input.data,
    });
  } catch {
    // Notification creation must never break the primary flow
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    await connectDB();
    return await AdminNotification.countDocuments({ isRead: false });
  } catch {
    return 0;
  }
}
