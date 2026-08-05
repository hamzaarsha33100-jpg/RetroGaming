import { Suspense } from "react";
import dynamic from "next/dynamic";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Banner from "@/models/Banner";
import ProductSection from "@/components/home/ProductSection";
import { demoBanners, demoCategories, demoProducts } from "@/lib/demo-data";

export const revalidate = 300;

const HeroSection = dynamic(() => import("@/components/home/HeroSection"));
const FeaturedCategories = dynamic(() => import("@/components/home/FeaturedCategories"));

const LazySections = dynamic(() => import("@/components/home/LazySections").then(mod => mod.LazySections));

async function getHomeData() {
  try {
    await connectDB();

    const [banners, categories, featuredProducts, trendingProducts, bestSellers, newArrivals, flashSaleProducts] =
      await Promise.all([
        Banner.find({ isActive: true, position: "hero" }).sort({ sortOrder: 1 }).limit(5).lean(),
        Category.find({ isActive: true }).sort({ sortOrder: 1 }).limit(6).lean(),
        Product.find({ isActive: true, isFeatured: true }).populate("category", "name slug").sort({ createdAt: -1 }).limit(8).lean(),
        Product.find({ isActive: true, isTrending: true }).populate("category", "name slug").sort({ createdAt: -1 }).limit(8).lean(),
        Product.find({ isActive: true, isBestSeller: true }).populate("category", "name slug").sort({ rating: -1 }).limit(8).lean(),
        Product.find({ isActive: true, isNewArrival: true }).populate("category", "name slug").sort({ createdAt: -1 }).limit(8).lean(),
        Product.find({ isActive: true, salePrice: { $exists: true, $gt: 0 } }).populate("category", "name slug").sort({ discountPercentage: -1 }).limit(4).lean(),
      ]);

    return {
      banners: banners.length ? JSON.parse(JSON.stringify(banners)) : demoBanners,
      categories: categories.length ? JSON.parse(JSON.stringify(categories)) : demoCategories,
      featuredProducts: featuredProducts.length ? JSON.parse(JSON.stringify(featuredProducts)) : demoProducts,
      trendingProducts: trendingProducts.length ? JSON.parse(JSON.stringify(trendingProducts)) : demoProducts.filter((p) => p.isTrending),
      bestSellers: bestSellers.length ? JSON.parse(JSON.stringify(bestSellers)) : demoProducts.filter((p) => p.isBestSeller),
      newArrivals: newArrivals.length ? JSON.parse(JSON.stringify(newArrivals)) : demoProducts.filter((p) => p.isNewArrival),
      flashSaleProducts: flashSaleProducts.length ? JSON.parse(JSON.stringify(flashSaleProducts)) : demoProducts.filter((p) => p.salePrice),
    };
  } catch {
    return {
      banners: demoBanners,
      categories: demoCategories,
      featuredProducts: demoProducts,
      trendingProducts: demoProducts.filter((p) => p.isTrending),
      bestSellers: demoProducts.filter((p) => p.isBestSeller),
      newArrivals: demoProducts.filter((p) => p.isNewArrival),
      flashSaleProducts: demoProducts.filter((p) => p.salePrice),
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <HeroSection banners={data.banners} />
      <Suspense fallback={null}>
        <FeaturedCategories categories={data.categories} />
      </Suspense>
      <Suspense fallback={null}>
        <ProductSection title="Featured" accent="Gear" products={data.featuredProducts} viewAllLink="/categories?filter=featured" />
      </Suspense>
      <LazySections flashSaleProducts={data.flashSaleProducts} />
      <Suspense fallback={null}>
        <ProductSection title="Trending" accent="Now" products={data.trendingProducts} viewAllLink="/categories?filter=trending" />
      </Suspense>
      <Suspense fallback={null}>
        <ProductSection title="Best" accent="Sellers" products={data.bestSellers} viewAllLink="/categories?filter=bestseller" />
      </Suspense>
      <Suspense fallback={null}>
        <ProductSection title="New" accent="Arrivals" products={data.newArrivals} viewAllLink="/categories?filter=new" />
      </Suspense>
    </>
  );
}
