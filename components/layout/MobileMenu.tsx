"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, ShoppingCart, Gamepad2, Info, Phone, User, Package, Heart,
  LogOut, LogIn, UserPlus, ChevronDown, ChevronRight, Tv, Monitor,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useLanguageStore } from "@/store/languageStore";
import { t } from "@/lib/i18n";
import dynamic from "next/dynamic";

const CurrencySelector = dynamic(
  () => import("@/components/currency/CurrencySelector"),
  { ssr: false }
);
const LanguageSelector = dynamic(
  () => import("@/components/language/LanguageSelector"),
  { ssr: false }
);

const FALLBACK_PS_CATEGORIES = [
  { href: "/playstation?cat=playstation-5", label: "PlayStation 5" },
  { href: "/playstation?cat=playstation-5-slim", label: "PS5 Slim" },
  { href: "/playstation?cat=playstation-5-pro", label: "PS5 Pro" },
  { href: "/playstation?cat=ps5-games", label: "PS5 Games" },
  { href: "/playstation?cat=ps4-games", label: "PS4 Games" },
  { href: "/playstation?cat=playstation-exclusives", label: "Exclusives" },
];
const FALLBACK_XBOX_CATEGORIES = [
  { href: "/xbox?cat=xbox-series-x", label: "Xbox Series X" },
  { href: "/xbox?cat=xbox-series-s", label: "Xbox Series S" },
  { href: "/xbox?cat=xbox-one", label: "Xbox One" },
  { href: "/xbox?cat=xbox-game-pass", label: "Game Pass" },
  { href: "/xbox?cat=xbox-series-xs-games", label: "Series X|S Games" },
  { href: "/xbox?cat=xbox-exclusives", label: "Exclusives" },
];

const psGamesCategories = [
  { href: "/categories?ps=ps5", label: "PS5 Games" },
  { href: "/categories?ps=ps4", label: "PS4 Games" },
  { href: "/categories?ps=ps3", label: "PS3 Games" },
  { href: "/categories?ps=ps2", label: "PS2 Games" },
  { href: "/categories?filter=accessories", label: "Accessories" },
  { href: "/categories?filter=digital", label: "Digital Games" },
  { href: "/categories?filter=used", label: "Used Games" },
  { href: "/categories?filter=new", label: "New Arrivals" },
  { href: "/categories?filter=bestseller", label: "Best Sellers" },
];

const menuLinks = [
  { href: "/", label: "nav.home", icon: Home },
  { href: "/categories", label: "nav.shop", icon: ShoppingCart },
  { href: "/playstation", label: "nav.playstation", icon: Tv, hasSubmenu: true, submenuType: "playstation" as const },
  { href: "/xbox", label: "nav.xbox", icon: Monitor, hasSubmenu: true, submenuType: "xbox" as const },
  { href: "/ps-games", label: "nav.psGames", icon: Gamepad2, hasSubmenu: true, submenuType: "psgames" as const },
  { href: "/about", label: "nav.about", icon: Info },
  { href: "/contact", label: "nav.contact", icon: Phone },
];

const menuVariants = {
  closed: { x: "100%", opacity: 0 },
  open: { x: 0, opacity: 1 },
};

export default function MobileMenu() {
  const { data: session } = useSession();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const language = useLanguageStore((s) => s.language);
  void language;
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const [psCategories, setPsCategories] = useState<{ href: string; label: string }[]>([]);
  const [xboxCategories, setXboxCategories] = useState<{ href: string; label: string }[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const [psRes, xboxRes] = await Promise.all([
          fetch("/api/categories?platform=playstation"),
          fetch("/api/categories?platform=xbox"),
        ]);
        const psJson = await psRes.json();
        const xboxJson = await xboxRes.json();
        const psData = psJson.data ?? [];
        const xboxData = xboxJson.data ?? [];
        if (mounted) {
          setPsCategories(psData.map((c: { slug: string; name: string }) => ({ href: `/playstation?cat=${c.slug}`, label: c.name })));
          setXboxCategories(xboxData.map((c: { slug: string; name: string }) => ({ href: `/xbox?cat=${c.slug}`, label: c.name })));
        }
      } catch { /* keep fallback */ }
    }
    loadCategories();
    return () => { mounted = false; };
  }, []);

  const toggleSubmenu = (type: string) => {
    setExpandedSubmenu((prev) => (prev === type ? null : type));
  };

  const getCategories = (type: string) => {
    switch (type) {
      case "playstation": return psCategories.length ? psCategories.slice(0, 10) : FALLBACK_PS_CATEGORIES;
      case "xbox": return xboxCategories.length ? xboxCategories.slice(0, 10) : FALLBACK_XBOX_CATEGORIES;
      case "psgames": return psGamesCategories;
      default: return [];
    }
  };

  const getViewAllLink = (type: string) => {
    switch (type) {
      case "playstation": return "/playstation";
      case "xbox": return "/xbox";
      case "psgames": return "/ps-games";
      default: return "/";
    }
  };

  const getViewAllLabel = (type: string) => {
    switch (type) {
      case "playstation": return `${t("nav.viewAll")} PlayStation`;
      case "xbox": return `${t("nav.viewAll")} Xbox`;
      case "psgames": return `${t("nav.viewAll")} PS Games`;
      default: return t("nav.viewAll");
    }
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.div
            key="mobile-menu-drawer"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gaming-surface border-l border-gaming-border z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gaming-border">
              <span className="font-gaming font-bold text-lg text-gradient">RETRO GAMING</span>
              <button onClick={closeMobileMenu} className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {session && (
              <div className="p-5 border-b border-gaming-border">
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <Image src={session.user.image} alt={session.user.name || "User"} width={44} height={44} className="w-11 h-11 rounded-full border border-neon-cyan/30" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gaming-dark flex items-center justify-center border border-gaming-border">
                      <User className="w-5 h-5 text-neon-cyan" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gaming-text truncate">{session.user?.name}</p>
                    <p className="text-xs text-gaming-textMuted truncate">{session.user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-3">
              <div className="space-y-0.5">
                {menuLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.hasSubmenu ? (
                      <div>
                        <div className="flex items-center">
                          <Link
                            href={link.href}
                            onClick={closeMobileMenu}
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                          >
                            <link.icon className="w-5 h-5" />
                            {t(link.label)}
                          </Link>
                          <button
                            onClick={() => toggleSubmenu(link.submenuType!)}
                            className="p-3 text-gaming-textMuted hover:text-neon-cyan transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedSubmenu === link.submenuType ? "rotate-180" : ""}`} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {expandedSubmenu === link.submenuType && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-6 pb-2 space-y-0.5">
                                {getCategories(link.submenuType!).map((cat) => (
                                  <Link
                                    key={cat.href}
                                    href={cat.href}
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                    {cat.label}
                                  </Link>
                                ))}
                                <Link
                                  href={getViewAllLink(link.submenuType!)}
                                  onClick={closeMobileMenu}
                                  className="flex items-center justify-center px-4 py-2.5 mx-2 rounded-lg bg-neon-cyan/10 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-all"
                                >
                                  {getViewAllLabel(link.submenuType!)}
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200"
                      >
                        <link.icon className="w-5 h-5" />
                        {t(link.label)}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* User Links */}
              {session ? (
                <>
                  <div className="mt-4 pt-4 border-t border-gaming-border space-y-0.5">
                    <Link href="/account" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200">
                      <User className="w-5 h-5" /> {t("nav.account")}
                    </Link>
                    <Link href="/account/orders" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200">
                      <Package className="w-5 h-5" /> {t("nav.orders")}
                    </Link>
                    <Link href="/account/wishlist" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-pink hover:bg-white/5 transition-all duration-200">
                      <Heart className="w-5 h-5" /> {t("nav.wishlist")}
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gaming-border">
                    <button onClick={() => { closeMobileMenu(); signOut({ callbackUrl: "/" }); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200">
                      <LogOut className="w-5 h-5" /> {t("nav.signout")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 pt-4 border-t border-gaming-border space-y-2">
                  <Link href="/login" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200">
                    <LogIn className="w-5 h-5" /> {t("nav.login")}
                  </Link>
                  <Link href="/signup" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-accent/10 border border-neon-cyan/30 text-neon-cyan hover:from-neon-cyan/20 hover:to-accent/20 transition-all duration-200">
                    <UserPlus className="w-5 h-5" /> {t("nav.signup")}
                  </Link>
                </div>
              )}

              {/* Currency Selector */}
              <div className="mt-4 pt-4 border-t border-gaming-border">
                <CurrencySelector />
              </div>

              {/* Language Selector */}
              <div className="mt-4 pt-4 border-t border-gaming-border">
                <LanguageSelector />
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
