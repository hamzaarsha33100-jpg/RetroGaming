import mongoose, { Document, Schema } from "mongoose";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export interface INewsletterCampaign extends Document {
  name: string;
  subject: string;
  content: string;
  template: "promotional" | "new_product" | "flash_sale" | "offer";
  audience: "all" | "active";
  segments?: {
    tags?: string[];
    minOrders?: number;
  };
  status: CampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterCampaignSchema = new Schema<INewsletterCampaign>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    template: {
      type: String,
      enum: ["promotional", "new_product", "flash_sale", "offer"],
      default: "promotional",
    },
    audience: { type: String, enum: ["all", "active"], default: "active" },
    segments: {
      tags: [String],
      minOrders: Number,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    scheduledAt: Date,
    sentAt: Date,
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

NewsletterCampaignSchema.index({ status: 1, scheduledAt: 1 });

const NewsletterCampaign =
  mongoose.models.NewsletterCampaign ||
  mongoose.model<INewsletterCampaign>(
    "NewsletterCampaign",
    NewsletterCampaignSchema
  );

export default NewsletterCampaign;
