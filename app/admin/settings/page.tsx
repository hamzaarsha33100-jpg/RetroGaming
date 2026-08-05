"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Bell, CreditCard, Mail, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: "Retro Gaming",
    supportEmail: "support@retrogaming.com",
    freeShippingThreshold: 75,
    taxRate: 8,
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings({
            siteName: data.data.siteName,
            supportEmail: data.data.supportEmail,
            freeShippingThreshold: data.data.freeShippingThreshold,
            taxRate: data.data.taxRate,
            maintenanceMode: data.data.maintenanceMode,
            allowRegistrations: data.data.allowRegistrations,
            emailNotifications: data.data.emailNotifications,
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

  const sections = [
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
          <label className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark border border-gaming-border cursor-pointer hover:border-neon-cyan/30 transition-all">
            <div>
              <p className="text-gaming-text font-medium">Maintenance Mode</p>
              <p className="text-gaming-textMuted text-sm">Take the site offline for maintenance</p>
            </div>
            <div
              onClick={() =>
                setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
              }
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                settings.maintenanceMode ? "bg-neon-pink" : "bg-gaming-border"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
          </label>
          <label className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark border border-gaming-border cursor-pointer hover:border-neon-cyan/30 transition-all">
            <div>
              <p className="text-gaming-text font-medium">Allow Registrations</p>
              <p className="text-gaming-textMuted text-sm">Allow new users to create accounts</p>
            </div>
            <div
              onClick={() =>
                setSettings({ ...settings, allowRegistrations: !settings.allowRegistrations })
              }
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                settings.allowRegistrations ? "bg-neon-cyan" : "bg-gaming-border"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.allowRegistrations ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
          </label>
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
          <label className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark border border-gaming-border cursor-pointer hover:border-neon-cyan/30 transition-all">
            <div>
              <p className="text-gaming-text font-medium">Email Notifications</p>
              <p className="text-gaming-textMuted text-sm">
                Send email alerts for new orders and signups
              </p>
            </div>
            <div
              onClick={() =>
                setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
              }
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                settings.emailNotifications ? "bg-neon-cyan" : "bg-gaming-border"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
          </label>
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
            Configure store-wide preferences and options.
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
            <Mail className="w-5 h-5 text-gaming-textMuted" />
          </div>
          <h2 className="text-lg font-gaming font-semibold text-white">Environment Variables</h2>
        </div>
        <p className="text-gaming-textMuted text-sm mb-4">
          Some settings are configured via environment variables in your <code className="text-neon-cyan bg-gaming-dark px-1 py-0.5 rounded text-xs">.env.local</code> file.
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
            "SMTP_HOST / SMTP_PORT",
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
