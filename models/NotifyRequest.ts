import mongoose, { Document, Schema } from "mongoose";

export type NotifyRequestType = "back_in_stock" | "price_drop";

export interface INotifyRequest extends Document {
  type: NotifyRequestType;
  email: string;
  product: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  originalPrice?: number;
  targetPrice?: number;
  isNotified: boolean;
  notifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotifyRequestSchema = new Schema<INotifyRequest>(
  {
    type: { type: String, enum: ["back_in_stock", "price_drop"], required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    originalPrice: Number,
    targetPrice: Number,
    isNotified: { type: Boolean, default: false },
    notifiedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

NotifyRequestSchema.index({ product: 1, type: 1, isNotified: 1 });
NotifyRequestSchema.index({ type: 1, isNotified: 1, expiresAt: 1 });

const NotifyRequest =
  mongoose.models.NotifyRequest ||
  mongoose.model<INotifyRequest>("NotifyRequest", NotifyRequestSchema);

export default NotifyRequest;
