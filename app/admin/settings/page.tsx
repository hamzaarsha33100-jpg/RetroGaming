"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Bell,
  CreditCard,
  Mail,
  Globe,
  Loader2,
  MailOpen,
  Megaphone,
  Timer,
  Boxes,
  Search,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, type ReactNode } from "react";

interface SettingsState {
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
  email: {
    fromName: string;
    enabled: boolean;
    sendOrderEmails: boolean;
    sendMarketingEmails: boolean;
    sendStockAlerts: boolean;
  };
  newsletter: {
    requireConsent: boolean;
    confirmationEmail: boolean;
    doubleOptIn: boolean;
  };
  notifications: {
    newOrderAlerts: boolean;
    lowStockAlerts: boolean;
    reviewAlerts: boolean;
  };
  countdown: {
    defaultFlashSaleHours: number;
    showOnHomepage: boolean;
  };
  inventory: {
    lowStockThreshold: number;
    lowStockAlerts: boolean;
    disablePurchaseWhenOut: boolean;
  };
  seo: {
    robotsEnabled: boolean;
    defaultChangeFrequency: string;
    includeOutOfStock: boolean;
  };
}

const DEFAULT_STATE: SettingsState = {
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

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_STATE);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const d = data.data;
          setSettings({
            ...DEFAULT_STATE,
            ...d,
            social: d.social ?? {},
            email: { ...DEFAULT_STATE.email, ...(d.email ?? {}) },
            newsletter: { ...DEFAULT_STATE.newsletter, ...(d.newsletter ?? {}) },
            notifications: { ...DEFAULT_STATE.notifications, ...(d.notifications ?? {}) },
            countdown: { ...DEFAULT_STATE.countdown, ...(d.countdown ?? {}) },
            inventory: { ...DEFAULT_STATE.inventory, ...(d.inventory ?? {}) },
            seo: { ...DEFAULT_STATE.seo, ...(d.seo ?? {}) },
          });
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    );
  }

  const Toggle = ({
    value,
    onChange,
    label,
    desc,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    desc: string;
  }) => (
    <label className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark border border-gaming-border cursor-pointer hover:border-neon-cyan/30 transition-all">
      <div>
        <p className="text-gaming-text font-medium">{label}</p>
        <p className="text-gaming-textMuted text-sm">{desc}</p>
      </div>
      <div
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
          value ? "bg-neon-cyan" : "bg-gaming-border"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </div>
    </label>
  );

  const sections: Array<{
    icon: typeof Globe;
    title: string;
    color: string;
    bg: string;
    fields: ReactNode;
  }> = [
    {
      icon: Globe,
      title: "General Settings",
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Site Name</label>
            <input
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="input-gaming w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="input-gaming w-full"
            />
          </div>
        </div>
      ),
    },
    {
      icon: Mail,
      title: "Contact Information",
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Contact Phone</label>
            <input
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="input-gaming w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Contact Address</label>
            <input
              value={settings.contactAddress}
              onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
              className="input-gaming w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Business Hours</label>
            <input
              value={settings.businessHours}
              onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
              className="input-gaming w-full"
            />
          </div>
        </div>
      ),
    },
    {
      icon: Globe,
      title: "Social Links",
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
      fields: (
        <div className="space-y-4">
          {[
            ["facebook", "Facebook URL"],
            ["instagram", "Instagram URL"],
            ["twitter", "Twitter URL"],
            ["youtube", "YouTube URL"],
            ["discord", "Discord Invite URL"],
            ["tiktok", "TikTok URL"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm text-gaming-textMuted mb-1">{label}</label>
              <input
                type="url"
                value={settings.social[key] ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, [key]: e.target.value },
                  })
                }
                className="input-gaming w-full"
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: CreditCard,
      title: "Commerce Settings",
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">
              Free Shipping Threshold ($)
            </label>
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) =>
                setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
              }
              className="input-gaming w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
              className="input-gaming w-full"
            />
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Access Control",
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
      fields: (
        <div className="space-y-4">
          <Toggle
            value={settings.maintenanceMode}
            onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
            label="Maintenance Mode"
            desc="Take the site offline for maintenance"
          />
          <Toggle
            value={settings.allowRegistrations}
            onChange={(v) => setSettings({ ...settings, allowRegistrations: v })}
            label="Allow Registrations"
            desc="Allow new users to create accounts"
          />
        </div>
      ),
    },
    {
      icon: Bell,
      title: "Notifications",
      color: "text-neon-yellow",
      bg: "bg-neon-yellow/10",
      fields: (
        <div className="space-y-4">
          <Toggle
            value={settings.emailNotifications}
            onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
            label="Email Notifications"
            desc="Send email alerts for new orders and signups"
          />
          <Toggle
            value={settings.notifications.newOrderAlerts}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: { ...settings.notifications, newOrderAlerts: v },
              })
            }
            label="New Order Alerts"
            desc="Notify admins when a new order is placed"
          />
          <Toggle
            value={settings.notifications.lowStockAlerts}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: { ...settings.notifications, lowStockAlerts: v },
              })
            }
            label="Low Stock Alerts"
            desc="Notify admins when products run low"
          />
          <Toggle
            value={settings.notifications.reviewAlerts}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: { ...settings.notifications, reviewAlerts: v },
              })
            }
            label="Review Alerts"
            desc="Notify admins about new reviews"
          />
        </div>
      ),
    },
    {
      icon: MailOpen,
      title: "Email Configuration",
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">From Name</label>
            <input
              value={settings.email.fromName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, fromName: e.target.value },
                })
              }
              className="input-gaming w-full"
              placeholder="Retro Gaming"
            />
          </div>
          <Toggle
            value={settings.email.enabled}
            onChange={(v) =>
              setSettings({ ...settings, email: { ...settings.email, enabled: v } })
            }
            label="Email System Enabled"
            desc="Master switch for all outgoing emails"
          />
          <Toggle
            value={settings.email.sendOrderEmails}
            onChange={(v) =>
              setSettings({
                ...settings,
                email: { ...settings.email, sendOrderEmails: v },
              })
            }
            label="Order Emails"
            desc="Confirmation, shipped, delivered & cancellation emails"
          />
          <Toggle
            value={settings.email.sendMarketingEmails}
            onChange={(v) =>
              setSettings({
                ...settings,
                email: { ...settings.email, sendMarketingEmails: v },
              })
            }
            label="Marketing Emails"
            desc="Campaigns, flash sales, new arrivals & offers"
          />
          <Toggle
            value={settings.email.sendStockAlerts}
            onChange={(v) =>
              setSettings({
                ...settings,
                email: { ...settings.email, sendStockAlerts: v },
              })
            }
            label="Stock Alert Emails"
            desc="Low-stock & back-in-stock notifications"
          />
        </div>
      ),
    },
    {
      icon: Megaphone,
      title: "Newsletter Settings",
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
      fields: (
        <div className="space-y-4">
          <Toggle
            value={settings.newsletter.requireConsent}
            onChange={(v) =>
              setSettings({
                ...settings,
                newsletter: { ...settings.newsletter, requireConsent: v },
              })
            }
            label="Require Consent"
            desc="Only subscribe users who explicitly agree"
          />
          <Toggle
            value={settings.newsletter.confirmationEmail}
            onChange={(v) =>
              setSettings({
                ...settings,
                newsletter: { ...settings.newsletter, confirmationEmail: v },
              })
            }
            label="Confirmation Email"
            desc="Send a welcome email on subscribe"
          />
          <Toggle
            value={settings.newsletter.doubleOptIn}
            onChange={(v) =>
              setSettings({
                ...settings,
                newsletter: { ...settings.newsletter, doubleOptIn: v },
              })
            }
            label="Double Opt-In"
            desc="Require email confirmation before activating"
          />
        </div>
      ),
    },
    {
      icon: Timer,
      title: "Countdown Timers",
      color: "text-neon-yellow",
      bg: "bg-neon-yellow/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">
              Default Flash Sale Duration (hours)
            </label>
            <input
              type="number"
              min={1}
              value={settings.countdown.defaultFlashSaleHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  countdown: {
                    ...settings.countdown,
                    defaultFlashSaleHours: Number(e.target.value),
                  },
                })
              }
              className="input-gaming w-full"
            />
          </div>
          <Toggle
            value={settings.countdown.showOnHomepage}
            onChange={(v) =>
              setSettings({
                ...settings,
                countdown: { ...settings.countdown, showOnHomepage: v },
              })
            }
            label="Show Countdown on Homepage"
            desc="Display active sale banners on the storefront"
          />
        </div>
      ),
    },
    {
      icon: Boxes,
      title: "Inventory Management",
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min={1}
              value={settings.inventory.lowStockThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  inventory: {
                    ...settings.inventory,
                    lowStockThreshold: Number(e.target.value),
                  },
                })
              }
              className="input-gaming w-full"
            />
            <p className="text-gaming-textMuted text-xs mt-1">
              Products at or below this quantity are flagged as low stock.
            </p>
          </div>
          <Toggle
            value={settings.inventory.lowStockAlerts}
            onChange={(v) =>
              setSettings({
                ...settings,
                inventory: { ...settings.inventory, lowStockAlerts: v },
              })
            }
            label="Low Stock Alerts"
            desc="Send admin alerts when stock drops below threshold"
          />
          <Toggle
            value={settings.inventory.disablePurchaseWhenOut}
            onChange={(v) =>
              setSettings({
                ...settings,
                inventory: { ...settings.inventory, disablePurchaseWhenOut: v },
              })
            }
            label="Disable Purchase When Out of Stock"
            desc="Hide Add to Cart for out-of-stock products"
          />
        </div>
      ),
    },
    {
      icon: Search,
      title: "SEO Settings",
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">
              Default Change Frequency
            </label>
            <select
              value={settings.seo.defaultChangeFrequency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  seo: { ...settings.seo, defaultChangeFrequency: e.target.value },
                })
              }
              className="input-gaming w-full"
            >
              {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map(
                (f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                )
              )}
            </select>
          </div>
          <Toggle
            value={settings.seo.robotsEnabled}
            onChange={(v) =>
              setSettings({ ...settings, seo: { ...settings.seo, robotsEnabled: v } })
            }
            label="Robots.txt Enabled"
            desc="Allow search engines to crawl the site"
          />
          <Toggle
            value={settings.seo.includeOutOfStock}
            onChange={(v) =>
              setSettings({
                ...settings,
                seo: { ...settings.seo, includeOutOfStock: v },
              })
            }
            label="Index Out-of-Stock Products"
            desc="Include out-of-stock products in the sitemap"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-neon-cyan" />
            Settings
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Configure store-wide preferences, email, marketing, inventory &amp; SEO options.
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-gaming-dark/30 border-t-gaming-dark rounded-full animate-spin" />
          ) : null}
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="gaming-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${section.bg}`}>
                <section.icon className={`w-5 h-5 ${section.color}`} />
              </div>
              <h2 className="text-lg font-gaming font-semibold text-white">{section.title}</h2>
            </div>
            {section.fields}
          </motion.div>
        ))}
      </div>

      {/* Environment Variables Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gaming-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gaming-border/30">
            <Zap className="w-5 h-5 text-gaming-textMuted" />
          </div>
          <h2 className="text-lg font-gaming font-semibold text-white">Environment Variables</h2>
        </div>
        <p className="text-gaming-textMuted text-sm mb-4">
          Some settings are configured via environment variables in your{" "}
          <code className="text-neon-cyan bg-gaming-dark px-1 py-0.5 rounded text-xs">
            .env.local
          </code>{" "}
          file. SMTP variables power the entire email notification system.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            "MONGODB_URI",
            "NEXTAUTH_SECRET",
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET",
            "STRIPE_SECRET_KEY",
            "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
            "IMAGEKIT_PRIVATE_KEY",
            "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
            "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_USER",
            "SMTP_PASS",
            "SMTP_FROM",
            "SMTP_FROM_NAME",
            "NEXT_PUBLIC_APP_URL",
          ].map((envVar) => (
            <div
              key={envVar}
              className="flex items-center gap-2 px-3 py-2 rounded bg-gaming-dark border border-gaming-border"
            >
              <div className="w-2 h-2 rounded-full bg-neon-cyan flex-shrink-0" />
              <code className="text-neon-cyan text-xs font-mono">{envVar}</code>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
