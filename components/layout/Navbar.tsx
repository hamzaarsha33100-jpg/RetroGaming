"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useHasMounted } from "@/hooks/useHasMounted";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), {
  ssr: false,
});
const SearchModal = dynamic(() => import("@/components/search/SearchModal"), {
  ssr: false,
});
const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"), {
  ssr: false,
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const hasMounted = useHasMounted();
  const { toggleCart, toggleSearch, toggleMobileMenu, isMobileMenuOpen } =
    useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleUserMenuToggle = useCallback(
    () => setUserMenuOpen((prev) => !prev),
    []
  );

  const handleUserMenuClose = useCallback(
    () => setUserMenuOpen(false),
    []
  );

  const handleSignOut = useCallback(() => {
    setUserMenuOpen(false);
    signOut({ callbackUrl: "/" });
  }, []);

  const cartCount = hasMounted ? getItemCount() : 0;
  const wishlistCount = useMemo(() => (hasMounted ? wishlistItems.length : 0), [hasMounted, wishlistItems.length]);

  return (
    <>
      <nav
        className={`sticky-nav animate-slide-down ${
          scrolled
            ? "bg-gaming-dark/90 backdrop-blur-xl border-b border-gaming-border shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Zap className="w-8 h-8 text-neon-cyan group-hover:animate-pulse" />
                <div className="absolute inset-0 blur-sm bg-neon-cyan/20 group-hover:bg-neon-cyan/40 transition-all duration-300 rounded-full" />
              </div>
              <span className="font-gaming font-bold text-xl text-white">
                RETRO{" "}
                <span className="text-gradient">GAMING</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-gaming-textMuted hover:text-neon-cyan transition-colors duration-200 font-medium text-sm group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-cyan transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Desktop Search Bar */}
            <button
              onClick={toggleSearch}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:border-neon-cyan/50 hover:text-gaming-text transition-all duration-300 text-sm min-w-[200px]"
            >
              <Search className="w-4 h-4" />
              <span>Search products...</span>
              <kbd className="ml-auto text-xs border border-gaming-border rounded px-1.5 py-0.5">
                /
              </kbd>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search Icon (Mobile) */}
              <button
                onClick={toggleSearch}
                className="lg:hidden p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-gaming-textMuted hover:text-neon-pink transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink text-white text-xs rounded-full flex items-center justify-center font-bold animate-pop-in">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-cyan text-gaming-dark text-xs rounded-full flex items-center justify-center font-bold animate-pop-in">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gaming-surface border border-gaming-border hover:border-neon-cyan/50 transition-all duration-300"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-neon-cyan" />
                    )}
                    <span className="hidden lg:block text-sm text-gaming-text max-w-[100px] truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gaming-textMuted transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-gaming-surface border border-gaming-border rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in"
                      onMouseLeave={handleUserMenuClose}
                    >
                      <div className="p-3 border-b border-gaming-border">
                        <p className="text-sm font-medium text-gaming-text truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gaming-textMuted truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      {session.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={handleUserMenuClose}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={handleUserMenuClose}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={handleUserMenuClose}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gaming-textMuted hover:text-neon-cyan hover:bg-white/5 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>

                      <div className="border-t border-gaming-border">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link href="/login" className="btn-ghost text-sm px-4 py-2">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 animate-rotate-in" />
                ) : (
                  <Menu className="w-6 h-6 animate-rotate-in" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Search Modal */}
      <SearchModal />
    </>
  );
}
