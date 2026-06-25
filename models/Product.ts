import mongoose, { Document, Schema } from "mongoose";

export type ImageTransition = "fade" | "slide" | "zoom" | "flip";

export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  sku: string;
  description: string;
  shortDescription?: string;
  specifications: IProductSpecification[];
  tags: string[];
  mainImage: string;
  galleryImages: IProductImage[];
  bannerImage?: string;
  imageTransition: ImageTransition;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  isOutOfStock: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  alt: String,
  isPrimary: { type: Boolean, default: false },
});

const ProductSpecificationSchema = new Schema<IProductSpecification>({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    discountPercentage: { type: Number, min: 0, max: 100 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    shortDescription: String,
    specifications: [ProductSpecificationSchema],
    tags: [{ type: String, trim: true, lowercase: true }],
    mainImage: { type: String, required: true },
    galleryImages: [ProductImageSchema],
    bannerImage: String,
    imageTransition: {
      type: String,
      enum: ["fade", "slide", "zoom", "flip"],
      default: "fade",
    },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isOutOfStock: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

// Auto update isOutOfStock based on stockQuantity
ProductSchema.pre("save", function (next) {
  this.isOutOfStock = this.stockQuantity <= 0;
  if (this.salePrice && this.price) {
    this.discountPercentage = Math.round(
      ((this.price - this.salePrice) / this.price) * 100
    );
  }
  next();
});

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isTrending: 1, isActive: 1 });
ProductSchema.index({ isNewArrival: 1, isActive: 1 });
ProductSchema.index({ isBestSeller: 1, isActive: 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
