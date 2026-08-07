"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Loader2,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

interface AdminNotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const SEVERITY_STYLES: Record<string, { color: string; bg: string; icon: typeof Info; label: string }> = {
  info: { color: "text-neon-cyan", bg: "bg-neon-cyan/10", icon: Info, label: "Info" },
  warning: { color: "text-neon-yellow", bg: "bg-neon-yellow/10", icon: AlertTriangle, label: "Warning" },
  danger: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle, label: "Critical" },
  success: { color: "text-neon-green", bg: "bg-neon-green/10", icon: CheckCircle, label: "Success" },
};

const TYPE_LABELS: Record<string, string> = {
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  new_order: "New Order",
  pending_order: "Pending Order",
  failed_payment: "Failed Payment",
  new_subscriber: "New Subscriber",
  contact_message: "Customer Message",
  review: "Review",
  flash_sale_ending: "Flash Sale Ending",
  expired_discount: "Expired Discount",
  campaign: "Campaign",
  price_drop: "Price Drop",
  back_in_stock: "Back in Stock",
  system: "System",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/notifications?limit=100&unread=${filter === "unread"}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/admin/notifications?all=true", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await fetch(`/api/admin/notifications?id=${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const deleteAll = async () => {
    if (!confirm("Delete all notifications? This cannot be undone.")) return;
    await fetch("/api/admin/notifications?all=true", { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  };

  const unreadOnly = notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-neon-cyan" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-neon-pink/10 text-neon-pink text-xs border border-neon-pink/20">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Stay on top of stock, orders, payments, and customer activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gaming-border overflow-hidden">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "all" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gaming-textMuted hover:text-gaming-text"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "unread" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gaming-textMuted hover:text-gaming-text"
              }`}
            >
              Unread
            </button>
          </div>
          <button
            onClick={fetchNotifications}
            className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5 border border-gaming-border"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-neon-cyan border border-gaming-border rounded-lg hover:bg-neon-cyan/5 transition-colors disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
          <button
            onClick={deleteAll}
            className="p-2 text-gaming-textMuted hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 border border-gaming-border"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="gaming-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <Bell className="w-16 h-16 text-gaming-border mx-auto mb-4" />
            <p className="text-gaming-textMuted">
              {filter === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gaming-border">
            {(filter === "unread" ? unreadOnly : notifications).map((n, index) => {
              const style = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
              const Icon = style.icon;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className={`px-4 sm:px-6 py-4 flex items-start gap-4 transition-colors ${
                    !n.isRead ? "bg-neon-cyan/[0.03]" : ""
                  } hover:bg-white/5`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${style.bg}`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gaming-text font-medium text-sm">{n.title}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-gaming-border/30 text-gaming-textMuted border border-gaming-border">
                        {TYPE_LABELS[n.type] || n.type}
                      </span>
                    </div>
                    <p className="text-gaming-textMuted text-sm mt-0.5">{n.message}</p>
                    <p className="text-gaming-textMuted/60 text-xs mt-1.5">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="px-2.5 py-1 text-xs text-neon-cyan border border-gaming-border rounded-lg hover:bg-neon-cyan/5 transition-colors"
                      >
                        View
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n._id)}
                        className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
                        title="Mark read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/notifications?id=${n._id}`, { method: "DELETE" });
                        setNotifications((prev) => prev.filter((x) => x._id !== n._id));
                      }}
                      className="p-2 text-gaming-textMuted hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
