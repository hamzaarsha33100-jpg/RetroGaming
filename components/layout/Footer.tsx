"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  Twitch,
  Send,
} from "lucide-react";
import { toast } from "sonner";

const copyrightYear = 2026;

const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "Blog" },
    { href: "/contact", label: "Careers" },
  ],
  categories: [
    { href: "/categories", label: "Headsets" },
    { href: "/categories", label: "Keyboards" },
    { href: "/categories", label: "Gaming Mice" },
    { href: "/categories", label: "Controllers" },
    { href: "/categories", label: "Monitors" },
  ],
  support: [
    { href: "/contact", label: "FAQ" },
    { href: "/contact", label: "Shipping Info" },
    { href: "/terms", label: "Returns" },
    { href: "/account/orders", label: "Track Order" },
    { href: "/contact", label: "Support Center" },
  ],
  legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/privacy", label: "Cookie Policy" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-[#1DA1F2]" },
  {
    icon: Youtube,
    href: "#",
    label: "YouTube",
    color: "hover:text-[#FF0000]",
  },
  {
    icon: Instagram,
    href: "#",
    label: "Instagram",
    color: "hover:text-[#E1306C]",
  },
  {
    icon: Facebook,
    href: "#",
    label: "Facebook",
    color: "hover:text-[#1877F2]",
  },
  { icon: Twitch, href: "#", label: "Twitch", color: "hover:text-[#9146FF]" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Successfully subscribed to our newsletter!");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to subscribe");
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gaming-darker border-t border-gaming-border mt-20">
      {/* Newsletter Section */}
      <div className="border-b border-gaming-border py-12">
        <div className="page-container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-gaming font-bold text-white mb-2">
                Stay <span className="text-gradient">Updated</span>
              </h3>
              <p className="text-gaming-textMuted">
                Get the latest deals, new arrivals, and gaming news delivered to
                your inbox.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex gap-3 w-full max-w-md"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-gaming w-full pl-10"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading ? "Subscribing..." : "Subscribe"}
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-5">
                <Zap className="w-8 h-8 text-neon-cyan" />
                <span className="font-gaming font-bold text-xl text-white">
                  RETRO <span className="text-gradient">GAMING</span>
                </span>
              </Link>
              <p className="text-gaming-textMuted text-sm leading-relaxed mb-6 max-w-xs">
                Your premier destination for premium gaming accessories. Elevate
                your gaming experience with cutting-edge technology.
              </p>

              <div className="space-y-2 text-sm text-gaming-textMuted">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neon-cyan" />
                  <span>support@retrogaming.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neon-cyan" />
                  <span>1-800-RETRO-GG</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neon-cyan" />
                  <span>San Francisco, CA, USA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className={`p-2 rounded-lg bg-gaming-surface border border-gaming-border text-gaming-textMuted ${social.color} transition-colors duration-200`}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-gaming font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-gaming-textMuted hover:text-neon-cyan text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-gaming font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Categories
              </h4>
              <ul className="space-y-2">
                {footerLinks.categories.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-gaming-textMuted hover:text-neon-cyan text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-gaming font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Support
              </h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-gaming-textMuted hover:text-neon-cyan text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gaming-border py-6">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gaming-textMuted text-sm">
            © {copyrightYear} Retro Gaming. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-gaming-textMuted hover:text-neon-cyan text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gaming-textMuted text-xs">Payments by</span>
            <span className="text-white text-xs font-medium">Stripe</span>
            <span className="text-gaming-textMuted text-xs">·</span>
            <span className="text-gaming-textMuted text-xs">🇺🇸 United States</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
