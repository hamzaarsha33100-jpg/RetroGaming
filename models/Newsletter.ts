import mongoose, { Document, Schema } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: String,
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: String,
  },
  { timestamps: true }
);

NewsletterSchema.index({ isActive: 1 });

const Newsletter =
  mongoose.models.Newsletter ||
  mongoose.model<INewsletter>("Newsletter", NewsletterSchema);

export default Newsletter;
