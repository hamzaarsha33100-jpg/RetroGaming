import { Suspense } from "react";
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { demoXboxCategories, demoXboxProducts } from "@/lib/demo-data-ps-xbox";
import XboxClient from "./XboxClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Xbox Store | Retro Gaming",
  description:
    "Browse our complete collection of Xbox consoles, controllers, headsets, and Game Pass subscriptions.",
  openGraph: {
    title: "Xbox Store | Retro Gaming",
    description:
      "Shop Xbox Series X, Series S, controllers, headsets, and Game Pass.",
  },
};

function toXboxCategory(category: { name: string; slug: string }) {
  return { name: category.name, slug: category.slug, param: category.slug };
}

async function getXboxData() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true, platform: "xbox" })
      .sort({ sortOrder: 1 })
      .lean();
    const xboxCategoryIds = categories.map((c) => c._id);
    const productQuery =
      xboxCategoryIds.length > 0
        ? { isActive: true, category: { $in: xboxCategoryIds } }
        : { isActive: true };

    const [featuredProducts, newArrivals, bestSellers, onSale, allProducts] =
      await Promise.all([
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
        Product.find(productQuery)
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(50)
          .lean(),
      ]);

    const hasData = allProducts.length > 0;

    return {
      categories: hasData ? JSON.parse(JSON.stringify(categories)) : [],
      xboxCategories: hasData
        ? categories.map((c) => ({ name: c.name, slug: c.slug, param: c.slug }))
        : demoXboxCategories.map(toXboxCategory),
      featuredProducts: hasData
        ? JSON.parse(JSON.stringify(featuredProducts))
        : demoXboxProducts.filter((p) => p.isFeatured),
      newArrivals: hasData
        ? JSON.parse(JSON.stringify(newArrivals))
        : demoXboxProducts.filter((p) => p.isNewArrival),
      bestSellers: hasData
        ? JSON.parse(JSON.stringify(bestSellers))
        : demoXboxProducts.filter((p) => p.isBestSeller),
      onSale: hasData
        ? JSON.parse(JSON.stringify(onSale))
        : demoXboxProducts.filter((p) => p.salePrice && p.salePrice > 0),
      allProducts: hasData
        ? JSON.parse(JSON.stringify(allProducts))
        : demoXboxProducts,
    };
  } catch {
    return {
      categories: [],
      xboxCategories: demoXboxCategories.map(toXboxCategory),
      featuredProducts: demoXboxProducts.filter((p) => p.isFeatured),
      newArrivals: demoXboxProducts.filter((p) => p.isNewArrival),
      bestSellers: demoXboxProducts.filter((p) => p.isBestSeller),
      onSale: demoXboxProducts.filter((p) => p.salePrice && p.salePrice > 0),
      allProducts: demoXboxProducts,
    };
  }
}

export default async function XboxStorePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const data = await getXboxData();

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-[#107C10] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <XboxClient
          xboxCategories={data.xboxCategories}
          categories={data.categories}
          featuredProducts={data.featuredProducts}
          newArrivals={data.newArrivals}
          bestSellers={data.bestSellers}
          onSale={data.onSale}
          allProducts={data.allProducts}
          initialCategory={cat || ""}
        />
      </Suspense>
    </div>
  );
}
