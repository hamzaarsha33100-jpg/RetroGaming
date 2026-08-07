import mongoose, { Document, Schema } from "mongoose";

export type CategoryPlatform =
  | "playstation"
  | "xbox"
  | "nintendo"
  | "pc"
  | "general";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: mongoose.Types.ObjectId;
  platform: CategoryPlatform;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: String,
    image: String,
    icon: String,
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    platform: {
      type: String,
      enum: ["playstation", "xbox", "nintendo", "pc", "general"],
      default: "general",
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

CategorySchema.index({ isActive: 1, sortOrder: 1 });

const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
