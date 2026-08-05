"use client";

import { useState, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-gaming-darker overflow-hidden">
      <AdminSidebar mobileOpen={mobileOpen} onClose={handleCloseMobile} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader onToggleMobile={handleToggleMobile} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
