import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  supportEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    discord?: string;
    tiktok?: string;
  };
  freeShippingThreshold: number;
  taxRate: number;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailNotifications: boolean;
  email?: {
    fromName: string;
    enabled: boolean;
    sendOrderEmails: boolean;
    sendMarketingEmails: boolean;
    sendStockAlerts: boolean;
  };
  newsletter?: {
    requireConsent: boolean;
    confirmationEmail: boolean;
    doubleOptIn: boolean;
  };
  notifications?: {
    newOrderAlerts: boolean;
    lowStockAlerts: boolean;
    reviewAlerts: boolean;
  };
  countdown?: {
    defaultFlashSaleHours: number;
    showOnHomepage: boolean;
  };
  inventory?: {
    lowStockThreshold: number;
    lowStockAlerts: boolean;
    disablePurchaseWhenOut: boolean;
  };
  seo?: {
    robotsEnabled: boolean;
    defaultChangeFrequency: string;
    includeOutOfStock: boolean;
  };
  updatedAt: Date;
}

const SocialSchema = new Schema(
  {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    discord: String,
    tiktok: String,
  },
  { _id: false }
);

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: "Retro Gaming" },
    supportEmail: { type: String, default: "support@retrogaming.com" },
    contactPhone: { type: String, default: "+1 (555) 123-4567" },
    contactAddress: {
      type: String,
      default: "123 Gaming Street, San Francisco, CA 94102",
    },
    businessHours: {
      type: String,
      default: "Monday - Friday: 9AM - 6PM",
    },
    social: { type: SocialSchema, default: () => ({}) },
    freeShippingThreshold: { type: Number, default: 75 },
    taxRate: { type: Number, default: 8 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    email: {
      type: new Schema(
        {
          fromName: { type: String, default: "Retro Gaming" },
          enabled: { type: Boolean, default: true },
          sendOrderEmails: { type: Boolean, default: true },
          sendMarketingEmails: { type: Boolean, default: true },
          sendStockAlerts: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    newsletter: {
      type: new Schema(
        {
          requireConsent: { type: Boolean, default: true },
          confirmationEmail: { type: Boolean, default: true },
          doubleOptIn: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    notifications: {
      type: new Schema(
        {
          newOrderAlerts: { type: Boolean, default: true },
          lowStockAlerts: { type: Boolean, default: true },
          reviewAlerts: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    countdown: {
      type: new Schema(
        {
          defaultFlashSaleHours: { type: Number, default: 48 },
          showOnHomepage: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    inventory: {
      type: new Schema(
        {
          lowStockThreshold: { type: Number, default: 5 },
          lowStockAlerts: { type: Boolean, default: true },
          disablePurchaseWhenOut: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    seo: {
      type: new Schema(
        {
          robotsEnabled: { type: Boolean, default: true },
          defaultChangeFrequency: { type: String, default: "weekly" },
          includeOutOfStock: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
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
  contactPhone: "+1 (555) 123-4567",
  contactAddress: "123 Gaming Street, San Francisco, CA 94102",
  businessHours: "Monday - Friday: 9AM - 6PM",
  social: {},
  freeShippingThreshold: 75,
  taxRate: 8,
  maintenanceMode: false,
  allowRegistrations: true,
  emailNotifications: true,
  email: {
    fromName: "Retro Gaming",
    enabled: true,
    sendOrderEmails: true,
    sendMarketingEmails: true,
    sendStockAlerts: true,
  },
  newsletter: {
    requireConsent: true,
    confirmationEmail: true,
    doubleOptIn: false,
  },
  notifications: {
    newOrderAlerts: true,
    lowStockAlerts: true,
    reviewAlerts: true,
  },
  countdown: {
    defaultFlashSaleHours: 48,
    showOnHomepage: true,
  },
  inventory: {
    lowStockThreshold: 5,
    lowStockAlerts: true,
    disablePurchaseWhenOut: true,
  },
  seo: {
    robotsEnabled: true,
    defaultChangeFrequency: "weekly",
    includeOutOfStock: false,
  },
};
