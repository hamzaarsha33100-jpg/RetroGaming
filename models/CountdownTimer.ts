import mongoose, { Document, Schema } from "mongoose";

export type CountdownTarget =
  | "flash_sale"
  | "limited_offer"
  | "product_launch"
  | "seasonal_discount"
  | "special_promotion";

export type CountdownPlacement = "homepage" | "product" | "category" | "banner";

export interface ICountdownTimer extends Document {
  name: string;
  description?: string;
  target: CountdownTarget;
  placement: CountdownPlacement;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  displayOn: {
    homepage: boolean;
    productIds?: mongoose.Types.ObjectId[];
    categoryIds?: mongoose.Types.ObjectId[];
    bannerIds?: mongoose.Types.ObjectId[];
  };
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  endAction: {
    removeDiscount: boolean;
    setOutOfStock: boolean;
  };
  bannerText?: string;
  bannerImage?: string;
  isEnded: boolean;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CountdownTimerSchema = new Schema<ICountdownTimer>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    target: {
      type: String,
      enum: [
        "flash_sale",
        "limited_offer",
        "product_launch",
        "seasonal_discount",
        "special_promotion",
      ],
      required: true,
    },
    placement: {
      type: String,
      enum: ["homepage", "product", "category", "banner"],
      default: "homepage",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    displayOn: {
      homepage: { type: Boolean, default: true },
      productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      bannerIds: [{ type: Schema.Types.ObjectId, ref: "Banner" }],
    },
    discountType: { type: String, enum: ["percentage", "fixed"] },
    discountValue: { type: Number, min: 0 },
    endAction: {
      removeDiscount: { type: Boolean, default: true },
      setOutOfStock: { type: Boolean, default: false },
    },
    bannerText: String,
    bannerImage: String,
    isEnded: { type: Boolean, default: false },
    endedAt: Date,
  },
  { timestamps: true }
);

CountdownTimerSchema.index({ isActive: 1, isEnded: 1, endDate: 1 });

const CountdownTimer =
  mongoose.models.CountdownTimer ||
  mongoose.model<ICountdownTimer>("CountdownTimer", CountdownTimerSchema);

export default CountdownTimer;
