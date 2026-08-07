import mongoose, { Document, Schema } from "mongoose";

export type AdminNotificationType =
  | "low_stock"
  | "out_of_stock"
  | "new_order"
  | "pending_order"
  | "failed_payment"
  | "new_subscriber"
  | "contact_message"
  | "review"
  | "flash_sale_ending"
  | "expired_discount"
  | "campaign"
  | "price_drop"
  | "back_in_stock"
  | "system";

export interface IAdminNotification extends Document {
  type: AdminNotificationType;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger" | "success";
  link?: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    type: {
      type: String,
      enum: [
        "low_stock",
        "out_of_stock",
        "new_order",
        "pending_order",
        "failed_payment",
        "new_subscriber",
        "contact_message",
        "review",
        "flash_sale_ending",
        "expired_discount",
        "campaign",
        "price_drop",
        "back_in_stock",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["info", "warning", "danger", "success"],
      default: "info",
    },
    link: String,
    isRead: { type: Boolean, default: false },
    data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

AdminNotificationSchema.index({ isRead: 1, createdAt: -1 });
AdminNotificationSchema.index({ type: 1, createdAt: -1 });

const AdminNotification =
  mongoose.models.AdminNotification ||
  mongoose.model<IAdminNotification>(
    "AdminNotification",
    AdminNotificationSchema
  );

export default AdminNotification;
