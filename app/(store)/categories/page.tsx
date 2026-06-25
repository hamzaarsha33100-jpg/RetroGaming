import { Suspense } from "react";
import { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our complete collection of premium gaming accessories. Find controllers, headsets, keyboards, mice, and more.",
  openGraph: {
    title: "Shop All Products | Retro Gaming",
    description: "Browse our complete collection of premium gaming accessories",
  },
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ProductsClient />
      </Suspense>
    </div>
  );
}
