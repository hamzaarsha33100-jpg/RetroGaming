"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, User, Menu, CheckCheck, Loader2, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";

interface AdminHeaderProps {
  onToggleMobile: () => void;
}

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

const SEVERITY_STYLES: Record<string, { color: string; icon: typeof Info }> = {
  info: { color: "text-neon-cyan", icon: Info },
  warning: { color: "text-neon-yellow", icon: AlertTriangle },
  danger: { color: "text-destructive", icon: AlertCircle },
  success: { color: "text-neon-green", icon: CheckCircle },
};

export default function AdminHeader({ onToggleMobile }: AdminHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=15");
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
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch("/api/admin/notifications?all=true", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setMarking(false);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push("/admin/notifications");
  };

  return (
    <header className="bg-gaming-surface border-b border-gaming-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-gaming-textMuted text-xs sm:text-sm">
          Welcome back,{" "}
          <span className="text-neon-cyan font-semibold">
            {session?.user?.name}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setOpen(!open);
              if (!open) fetchNotifications();
            }}
            className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-neon-pink text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-gaming-border bg-gaming-surface shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gaming-border">
                <h3 className="text-white font-semibold text-sm">Notifications</h3>
                <button
                  onClick={markAllRead}
                  disabled={marking || unreadCount === 0}
                  className="flex items-center gap-1 text-neon-cyan text-xs hover:underline disabled:opacity-40"
                >
                  {marking ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Mark all read
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 text-gaming-textMuted text-sm">
                    <Bell className="w-10 h-10 mx-auto mb-3 text-gaming-border" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => {
                    const style = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
                    const Icon = style.icon;
                    return (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (!n.isRead) {
                            fetch(`/api/admin/notifications?id=${n._id}`, { method: "PATCH" }).catch(() => undefined);
                            setUnreadCount((c) => Math.max(0, c - 1));
                          }
                          if (n.link) {
                            setOpen(false);
                            router.push(n.link);
                          }
                        }}
                        className={`px-4 py-3 border-b border-gaming-border cursor-pointer transition-colors hover:bg-white/5 ${
                          !n.isRead ? "bg-neon-cyan/[0.03]" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.color}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gaming-text font-medium">{n.title}</p>
                            <p className="text-xs text-gaming-textMuted line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gaming-textMuted/60 mt-1">
                              {formatDateTime(n.createdAt)}
                            </p>
                          </div>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-neon-pink flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={handleViewAll}
                className="w-full py-3 text-center text-sm text-neon-cyan hover:bg-white/5 transition-colors border-t border-gaming-border"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <Link
          href="/"
          target="_blank"
          className="hidden sm:block text-xs text-gaming-textMuted hover:text-neon-cyan transition-colors px-3 py-1.5 border border-gaming-border rounded-lg"
        >
          View Store
        </Link>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gaming-border">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || ""}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gaming-surfaceLight flex items-center justify-center">
              <User className="w-4 h-4 text-neon-cyan" />
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gaming-textMuted hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
