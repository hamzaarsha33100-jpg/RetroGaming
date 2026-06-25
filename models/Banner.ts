import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: Date;
  endDate?: Date;
  position: "hero" | "promotional" | "category" | "sidebar";
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: String,
    description: String,
    image: { type: String, required: true },
    mobileImage: String,
    ctaText: String,
    ctaLink: String,
    secondaryCtaText: String,
    secondaryCtaLink: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    position: {
      type: String,
      enum: ["hero", "promotional", "category", "sidebar"],
      default: "hero",
    },
  },
  { timestamps: true }
);

BannerSchema.index({ isActive: 1, position: 1, sortOrder: 1 });

const Banner =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;
