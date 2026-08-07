"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Heart,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AccountSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const menuItems = [
  {
    label: "Profile",
    href: "/account",
    icon: User,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
];

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="sticky top-24">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        {/* User Info */}
        <div className="text-center mb-6 pb-6 border-b border-purple-500/20">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-white text-lg">{user.name}</h3>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="outline"
          className="w-full border-purple-500/20 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
