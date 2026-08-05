import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppProviders from "@/components/providers/AppProviders";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AppProviders>
  );
}
