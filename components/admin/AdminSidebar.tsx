"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Image,
  Layout,
  Mail,
  FileText,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Timer,
  Bell,
  Boxes,
  Newspaper,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Shop", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/heroes", label: "Heroes", icon: Layout },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/countdowns", label: "Countdowns", icon: Timer },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ width: collapsed ? 72 : 240 }}
        className={cn(
          "relative bg-gaming-surface border-r border-gaming-border flex flex-col transition-all duration-300 ease-in-out z-50",
          "hidden lg:flex",
          mobileOpen && "!flex fixed top-0 left-0 h-full"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 p-5 border-b border-gaming-border overflow-hidden hover:bg-white/5 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Zap className="w-7 h-7 text-neon-cyan flex-shrink-0" />
          {!collapsed && (
            <span className="font-gaming font-bold text-white text-sm whitespace-nowrap animate-fade-in">
              RETRO{" "}
              <span className="text-gradient">ADMIN</span>
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-0.5",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                      : "text-gaming-textMuted hover:text-gaming-text hover:bg-white/5"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                      {item.label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pop-in" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:text-neon-cyan transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}
