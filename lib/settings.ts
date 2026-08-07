import "server-only";
import connectDB from "@/lib/mongodb";
import Settings, { DEFAULT_SETTINGS } from "@/models/Settings";

export interface StoreSettings {
  siteName: string;
  supportEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  social: Record<string, string>;
  freeShippingThreshold: number;
  taxRate: number;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailNotifications: boolean;
  email?: {
    fromName?: string;
    enabled?: boolean;
    sendOrderEmails?: boolean;
    sendMarketingEmails?: boolean;
    sendStockAlerts?: boolean;
  };
  newsletter?: {
    requireConsent?: boolean;
    confirmationEmail?: boolean;
    doubleOptIn?: boolean;
  };
  notifications?: {
    newOrderAlerts?: boolean;
    lowStockAlerts?: boolean;
    reviewAlerts?: boolean;
  };
  countdown?: {
    defaultFlashSaleHours?: number;
    showOnHomepage?: boolean;
  };
  inventory?: {
    lowStockThreshold?: number;
    lowStockAlerts?: boolean;
    disablePurchaseWhenOut?: boolean;
  };
  seo?: {
    robotsEnabled?: boolean;
    defaultChangeFrequency?: string;
    includeOutOfStock?: boolean;
  };
}

let cachedSettings: StoreSettings | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 1000;

export async function getSettings(): Promise<StoreSettings> {
  if (cachedSettings && Date.now() < cacheExpiry) {
    return cachedSettings;
  }

  try {
    await connectDB();
    const settings = await Settings.findOne().lean();
    cachedSettings = (settings ?? DEFAULT_SETTINGS) as StoreSettings;
    cacheExpiry = Date.now() + CACHE_TTL;
    return cachedSettings;
  } catch {
    return DEFAULT_SETTINGS as StoreSettings;
  }
}

export function invalidateSettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}
