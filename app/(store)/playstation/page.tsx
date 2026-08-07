import { Suspense } from "react";
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { demoPSCategories, demoPSProducts } from "@/lib/demo-data-ps-xbox";
import PlayStationClient from "./PlayStationClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "PlayStation Store | Retro Gaming",
  description:
    "Browse our premium collection of PlayStation PS5, PS4, PS3, and PS2 games, accessories, and more. Find the best deals on PlayStation gear.",
  openGraph: {
    title: "PlayStation Store | Retro Gaming",
    description:
      "Premium PlayStation games, consoles, and accessories at Retro Gaming.",
  },
};

async function getPlayStationData() {
  try {
    await connectDB();

    const categories = await Category.find({
      isActive: true,
      platform: "playstation",
    })
      .sort({ sortOrder: 1 })
      .lean();
    const psCategoryIds = categories.map((c) => c._id);
    const productQuery =
      psCategoryIds.length > 0
        ? { isActive: true, category: { $in: psCategoryIds } }
        : { isActive: true };

    const [allProducts, featuredProducts, newArrivals, bestSellers, onSale] =
      await Promise.all([
        Product.find(productQuery)
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(50)
          .lean(),
        Product.find({ ...productQuery, isFeatured: true })
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Product.find({ ...productQuery, isNewArrival: true })
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Product.find({ ...productQuery, isBestSeller: true })
          .populate("category", "name slug")
          .sort({ rating: -1 })
          .limit(8)
          .lean(),
        Product.find({ ...productQuery, salePrice: { $gt: 0 } })
          .populate("category", "name slug")
          .sort({ discountPercentage: -1 })
          .limit(8)
          .lean(),
      ]);

    const hasData = allProducts.length > 0;

    return {
      categories: hasData
        ? JSON.parse(JSON.stringify(categories))
        : demoPSCategories,
      allProducts: hasData
        ? JSON.parse(JSON.stringify(allProducts))
        : demoPSProducts,
      featuredProducts: hasData
        ? JSON.parse(JSON.stringify(featuredProducts))
        : demoPSProducts.filter((p) => p.isFeatured),
      newArrivals: hasData
        ? JSON.parse(JSON.stringify(newArrivals))
        : demoPSProducts.filter((p) => p.isNewArrival),
      bestSellers: hasData
        ? JSON.parse(JSON.stringify(bestSellers))
        : demoPSProducts.filter((p) => p.isBestSeller),
      onSale: hasData
        ? JSON.parse(JSON.stringify(onSale))
        : demoPSProducts.filter((p) => p.salePrice && p.salePrice > 0),
    };
  } catch {
    return {
      categories: demoPSCategories,
      allProducts: demoPSProducts,
      featuredProducts: demoPSProducts.filter((p) => p.isFeatured),
      newArrivals: demoPSProducts.filter((p) => p.isNewArrival),
      bestSellers: demoPSProducts.filter((p) => p.isBestSeller),
      onSale: demoPSProducts.filter((p) => p.salePrice && p.salePrice > 0),
    };
  }
}

export default async function PlayStationPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const data = await getPlayStationData();

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-[#0070d1] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PlayStationClient
          categories={data.categories}
          allProducts={data.allProducts}
          featuredProducts={data.featuredProducts}
          newArrivals={data.newArrivals}
          bestSellers={data.bestSellers}
          onSale={data.onSale}
          initialCategory={cat || ""}
        />
      </Suspense>
    </div>
  );
}
