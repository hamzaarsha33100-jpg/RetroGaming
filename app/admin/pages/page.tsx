"use client";

import { motion } from "framer-motion";
import { FileText, Info } from "lucide-react";
import Link from "next/link";

const pages = [
  {
    title: "About Us",
    href: "/about",
    description: "Company story, mission, and team information.",
    status: "Live",
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Contact form and support information.",
    status: "Live",
  },
  {
    title: "Privacy Policy",
    href: "/privacy",
    description: "Data privacy and cookie policy.",
    status: "Live",
  },
  {
    title: "Terms of Service",
    href: "/terms",
    description: "Terms and conditions of use.",
    status: "Live",
  },
];

export default function AdminPagesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-neon-cyan" />
            Pages
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Manage static content pages on your store.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="gaming-card p-4 border-neon-cyan/20 bg-neon-cyan/5 flex items-start gap-3">
        <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
        <p className="text-gaming-textMuted text-sm">
          Static pages are currently managed as Next.js page components. Edit them directly in the{" "}
          <code className="text-neon-cyan text-xs bg-gaming-dark px-1 py-0.5 rounded">
            app/(store)/
          </code>{" "}
          directory. A full CMS integration can be added in a future update.
        </p>
      </div>

      {/* Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page, index) => (
          <motion.div
            key={page.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="gaming-card p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gaming-dark border border-gaming-border">
                <FileText className="w-5 h-5 text-gaming-textMuted" />
              </div>
              <div>
                <p className="text-gaming-text font-medium">{page.title}</p>
                <p className="text-gaming-textMuted text-sm">{page.description}</p>
                <code className="text-neon-cyan text-xs">{page.href}</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/20">
                {page.status}
              </span>
              <Link
                href={page.href}
                target="_blank"
                className="px-3 py-1.5 text-sm border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
              >
                View
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
