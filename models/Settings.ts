import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  supportEmail: string;
  freeShippingThreshold: number;
  taxRate: number;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailNotifications: boolean;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: "Retro Gaming" },
    supportEmail: { type: String, default: "support@retrogaming.com" },
    freeShippingThreshold: { type: Number, default: 75 },
    taxRate: { type: Number, default: 8 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;

export const DEFAULT_SETTINGS = {
  siteName: "Retro Gaming",
  supportEmail: "support@retrogaming.com",
  freeShippingThreshold: 75,
  taxRate: 8,
  maintenanceMode: false,
  allowRegistrations: true,
  emailNotifications: true,
};
