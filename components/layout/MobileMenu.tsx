"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Grid, Info, User, Package, Heart, LogOut, LogIn, UserPlus, Settings } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

const menuLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: Grid },
  { href: "/about", label: "About Us", icon: Info },
];

const menuVariants = {
  closed: { x: "100%", opacity: 0 },
  open: { x: 0, opacity: 1 },
};

export default function MobileMenu() {
  const { data: session } = useSession();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-gaming-surface border-l border-gaming-border z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gaming-border">
              <span className="font-gaming font-bold text-lg text-gradient">
                RETRO GAMING
              </span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {session && (
              <div className="p-6 border-b border-gaming-border">
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full border border-neon-cyan/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gaming-surfaceLight flex items-center justify-center border border-gaming-border">
                      <User className="w-6 h-6 text-neon-cyan" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gaming-text">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gaming-textMuted">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-4">
              <div className="space-y-1">
                {menuLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* User Links */}
              {session ? (
                <>
                  <div className="mt-4 pt-4 border-t border-gaming-border space-y-1">
                    {session.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                      >
                        <Settings className="w-5 h-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                    >
                      <Package className="w-5 h-5" />
                      My Orders
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-pink hover:bg-white/5 transition-all duration-200"
                    >
                      <Heart className="w-5 h-5" />
                      Wishlist
                    </Link>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gaming-border">
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 pt-4 border-t border-gaming-border space-y-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-accent/10 border border-neon-cyan/30 text-neon-cyan hover:from-neon-cyan/20 hover:to-accent/20 transition-all duration-200"
                  >
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
