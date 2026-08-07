"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart, Search, Menu, X, User, Heart, ChevronDown, LogOut,
  Package, Settings, Zap, ChevronRight, Monitor, Tv,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useLanguageStore } from "@/store/languageStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { t } from "@/lib/i18n";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });
const SearchModal = dynamic(() => import("@/components/search/SearchModal"), { ssr: false });
const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"), { ssr: false });
const CurrencySelector = dynamic(() => import("@/components/currency/CurrencySelector"), { ssr: false });
const LanguageSelector = dynamic(() => import("@/components/language/LanguageSelector"), { ssr: false });

const FALLBACK_PS_CATEGORIES = [
  { href: "/playstation?cat=playstation-5", label: "PlayStation 5" },
  { href: "/playstation?cat=playstation-5-slim", label: "PS5 Slim" },
  { href: "/playstation?cat=playstation-5-pro", label: "PS5 Pro" },
  { href: "/playstation?cat=playstation-4", label: "PS4" },
  { href: "/playstation?cat=ps5-games", label: "PS5 Games" },
  { href: "/playstation?cat=ps4-games", label: "PS4 Games" },
  { href: "/playstation?cat=playstation-indies", label: "Indie Games" },
  { href: "/playstation?cat=playstation-exclusives", label: "Exclusives" },
];

const FALLBACK_XBOX_CATEGORIES = [
  { href: "/xbox?cat=xbox-series-x", label: "Xbox Series X" },
  { href: "/xbox?cat=xbox-series-s", label: "Xbox Series S" },
  { href: "/xbox?cat=xbox-one", label: "Xbox One" },
  { href: "/xbox?cat=controllers", label: "Controllers" },
  { href: "/xbox?cat=headsets", label: "Headsets" },
  { href: "/xbox?cat=xbox-game-pass", label: "Game Pass" },
  { href: "/xbox?cat=xbox-series-xs-games", label: "Series X|S Games" },
  { href: "/xbox?cat=xbox-exclusives", label: "Exclusives" },
];

const navLinks = [
  { href: "/", label: "nav.home" },
  { href: "/categories", label: "nav.shop" },
  { href: "/playstation", label: "nav.playstation", hasDropdown: true, dropdownType: "playstation" as const },
  { href: "/xbox", label: "nav.xbox", hasDropdown: true, dropdownType: "xbox" as const },
  { href: "/ps-games", label: "nav.psGames" },
  { href: "/about", label: "nav.about" },
  { href: "/contact", label: "nav.contact" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const language = useLanguageStore((s) => s.language);
  void language;
  const pathname = usePathname();
  const [siteName, setSiteName] = useState("Retro Gaming");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.siteName) setSiteName(json.data.siteName);
      })
      .catch(() => {});
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"playstation" | "xbox" | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const hasMounted = useHasMounted();
  const { toggleCart, toggleSearch, toggleMobileMenu, isMobileMenuOpen } = useUIStore();

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
      } catch {
        // keep fallback arrays
      }
    }
    loadCategories();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleUserMenuToggle = useCallback(() => setUserMenuOpen((prev) => !prev), []);
  const handleUserMenuClose = useCallback(() => setUserMenuOpen(false), []);
  const handleSignOut = useCallback(() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }, []);

  const handleDropdownEnter = useCallback((type: "playstation" | "xbox") => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(type);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const cartCount = hasMounted ? getItemCount() : 0;
  const wishlistCount = useMemo(() => (hasMounted ? wishlistItems.length : 0), [hasMounted, wishlistItems.length]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const categories = activeDropdown === "playstation"
    ? (psCategories.length ? psCategories : FALLBACK_PS_CATEGORIES)
    : (xboxCategories.length ? xboxCategories : FALLBACK_XBOX_CATEGORIES);
  const visibleCategories = categories.slice(0, 10);

  return (
    <>
      <nav
        className={`sticky-nav animate-slide-down ${
          scrolled
            ? "bg-gaming-dark/95 backdrop-blur-xl border-b border-gaming-border shadow-lg shadow-black/20"
            : "bg-gaming-dark/60 backdrop-blur-sm"
        }`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-neon-cyan group-hover:animate-pulse" />
                <div className="absolute inset-0 blur-sm bg-neon-cyan/20 group-hover:bg-neon-cyan/40 transition-all duration-300 rounded-full" />
              </div>
              <span className="font-gaming font-bold text-lg sm:text-xl text-white hidden sm:block">
                {siteName.split(" ")[0]}{" "}
                <span className="text-gradient">
                  {siteName.split(" ").slice(1).join(" ") || "GAMING"}
                </span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(link.dropdownType!)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm group ${
                        isActive(link.href)
                          ? "text-neon-cyan bg-neon-cyan/10"
                          : "text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5"
                      }`}
                    >
                      {link.dropdownType === "playstation" ? <Tv className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      {t(link.label)}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.dropdownType ? "rotate-180" : ""}`} />
                    </Link>

                    {activeDropdown === link.dropdownType && (
                      <div
                        className="absolute top-full left-0 mt-1 w-64 bg-gaming-surface border border-gaming-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-scale-in"
                        onMouseEnter={() => handleDropdownEnter(link.dropdownType!)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="p-2">
                          {visibleCategories.map((cat) => (
                            <Link
                              key={cat.href}
                              href={cat.href}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-all duration-200 text-sm group"
                            >
                              <span>{cat.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gaming-border p-2">
                          <Link
                            href={link.href}
                            className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-all duration-200 text-sm font-medium"
                          >
                            View All {t(link.label)}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm group ${
                      isActive(link.href)
                        ? "text-neon-cyan bg-neon-cyan/10"
                        : "text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5"
                    }`}
                  >
                    {t(link.label)}
                    <span className={`absolute -bottom-1 left-3 right-3 h-0.5 bg-neon-cyan transition-all duration-300 rounded-full ${isActive(link.href) ? "w-[calc(100%-24px)]" : "w-0 group-hover:w-[calc(100%-24px)]"}`} />
                  </Link>
                )
              )}
            </div>

            {/* Desktop Search Bar */}
            <button onClick={toggleSearch} className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gaming-surface/50 border border-gaming-border text-gaming-textMuted hover:border-neon-cyan/50 hover:text-gaming-text transition-all duration-300 text-sm min-w-[200px]">
              <Search className="w-4 h-4" />
              <span>{t("nav.search")}</span>
              <kbd className="ml-auto text-xs border border-gaming-border rounded px-1.5 py-0.5 bg-gaming-dark/50">/</kbd>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <div className="hidden lg:block">
                <CurrencySelector />
              </div>
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
              <button onClick={toggleSearch} className="lg:hidden p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              <Link href="/account/wishlist" className="relative p-2 text-gaming-textMuted hover:text-neon-pink transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pop-in">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={toggleCart} className="relative p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-cyan text-gaming-dark text-[10px] rounded-full flex items-center justify-center font-bold animate-pop-in">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {session ? (
                <>
                  <Link href="/account" className="lg:hidden p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors" aria-label="Account">
                    {session.user?.image ? (
                      <Image src={session.user.image} alt={session.user.name || "User"} width={20} height={20} className="w-5 h-5 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Link>

                  <div className="relative hidden lg:block">
                    <button onClick={handleUserMenuToggle} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gaming-surface/50 border border-gaming-border hover:border-neon-cyan/50 transition-all duration-300">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || "User"} width={24} height={24} className="w-6 h-6 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-neon-cyan" />
                      )}
                      <span className="text-sm text-gaming-text max-w-[100px] truncate">{session.user?.name?.split(" ")[0]}</span>
                      <ChevronDown className={`w-4 h-4 text-gaming-textMuted transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-gaming-surface border border-gaming-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-scale-in" onMouseLeave={handleUserMenuClose}>
                        <div className="p-3 border-b border-gaming-border">
                          <p className="text-sm font-medium text-gaming-text truncate">{session.user?.name}</p>
                          <p className="text-xs text-gaming-textMuted truncate">{session.user?.email}</p>
                        </div>
                        {session.user?.role === "admin" && (
                          <Link href="/admin" onClick={handleUserMenuClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors">
                            <Settings className="w-4 h-4" /> {t("nav.admin")}
                          </Link>
                        )}
                        <Link href="/account" onClick={handleUserMenuClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4" /> {t("nav.account")}
                        </Link>
                        <Link href="/account/orders" onClick={handleUserMenuClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors">
                          <Package className="w-4 h-4" /> {t("nav.orders")}
                        </Link>
                        <div className="border-t border-gaming-border">
                          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="w-4 h-4" /> {t("nav.signout")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link href="/login" className="btn-ghost text-sm px-4 py-2">{t("nav.login")}</Link>
                  <Link href="/signup" className="btn-primary text-sm px-4 py-2">{t("nav.signup")}</Link>
                </div>
              )}

              <button onClick={toggleMobileMenu} className="lg:hidden p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors" aria-label="Toggle menu">
                {isMobileMenuOpen ? <X className="w-6 h-6 animate-rotate-in" /> : <Menu className="w-6 h-6 animate-rotate-in" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu />
      <CartDrawer />
      <SearchModal />
    </>
  );
}
