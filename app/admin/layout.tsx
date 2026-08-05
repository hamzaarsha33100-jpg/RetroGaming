import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppProviders from "@/components/providers/AppProviders";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <AppProviders>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AppProviders>
  );
}
