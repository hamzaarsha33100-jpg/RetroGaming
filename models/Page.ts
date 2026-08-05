import mongoose, { Document, Schema } from "mongoose";

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  isActive: boolean;
  isSystem: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  template?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: { type: String, required: true },
    excerpt: String,
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,
    template: { type: String, default: "default" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PageSchema.index({ isActive: 1 });

const Page =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;
