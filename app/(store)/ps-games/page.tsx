import { Suspense } from "react";
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import PSGamesClient from "./PSGamesClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "PlayStation Games | Retro Gaming",
  description:
    "Browse our complete collection of PlayStation games and accessories. Find PS5, PS4, PS3, PS2 games and more.",
  openGraph: {
    title: "PlayStation Games | Retro Gaming",
    description:
      "Browse our complete collection of PlayStation games and accessories.",
  },
};

const PS_CATEGORIES = [
  { name: "PS5", slug: "ps5", param: "ps5" },
  { name: "PS4", slug: "ps4", param: "ps4" },
  { name: "PS3", slug: "ps3", param: "ps3" },
  { name: "PS2", slug: "ps2", param: "ps2" },
  { name: "Accessories", slug: "accessories", param: "accessories" },
  { name: "Digital Games", slug: "digital-games", param: "digital" },
  { name: "Used Games", slug: "used-games", param: "used" },
  { name: "New Arrivals", slug: "new-arrivals", param: "new" },
  { name: "Best Sellers", slug: "best-sellers", param: "best" },
];

async function getPSGamesData() {
  try {
    await connectDB();

    const [categories, featuredProducts, newArrivals, bestSellers] =
      await Promise.all([
        Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
        Product.find({ isActive: true, isFeatured: true })
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Product.find({ isActive: true, isNewArrival: true })
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Product.find({ isActive: true, isBestSeller: true })
          .populate("category", "name slug")
          .sort({ rating: -1 })
          .limit(8)
          .lean(),
      ]);

    return {
      categories: categories.length
        ? JSON.parse(JSON.stringify(categories))
        : [],
      featuredProducts: featuredProducts.length
        ? JSON.parse(JSON.stringify(featuredProducts))
        : [],
      newArrivals: newArrivals.length
        ? JSON.parse(JSON.stringify(newArrivals))
        : [],
      bestSellers: bestSellers.length
        ? JSON.parse(JSON.stringify(bestSellers))
        : [],
      psCategories: PS_CATEGORIES,
    };
  } catch {
    return {
      categories: [],
      featuredProducts: [],
      newArrivals: [],
      bestSellers: [],
      psCategories: PS_CATEGORIES,
    };
  }
}

export default async function PSGamesPage() {
  const data = await getPSGamesData();

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PSGamesClient
          psCategories={data.psCategories}
          categories={data.categories}
          featuredProducts={data.featuredProducts}
          newArrivals={data.newArrivals}
          bestSellers={data.bestSellers}
        />
      </Suspense>
    </div>
  );
}
