import { Suspense } from "react";
import dynamic from "next/dynamic";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Banner from "@/models/Banner";
import ProductSection from "@/components/home/ProductSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import CountdownBanner from "@/components/countdown/CountdownBanner";
import { demoBanners, demoCategories, demoProducts } from "@/lib/demo-data";

export const revalidate = 300;

const HeroSection = dynamic(() => import("@/components/home/HeroSection"));
const FeaturedCategories = dynamic(() => import("@/components/home/FeaturedCategories"));
const BrandPartnersSection = dynamic(() => import("@/components/home/BrandPartnersSection"));

async function getHomeData() {
  try {
    await connectDB();

    const [
      banners,
      categories,
      featuredProducts,
      trendingProducts,
      bestSellers,
      newArrivals,
      flashSaleProducts,
    ] = await Promise.all([
      Banner.find({ isActive: true, position: "hero" })
        .sort({ sortOrder: 1 })
        .limit(5)
        .lean(),
      Category.find({ isActive: true })
        .sort({ sortOrder: 1 })
        .limit(6)
        .lean(),
      Product.find({ isActive: true, isFeatured: true })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({ isActive: true, isTrending: true })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({ isActive: true, isBestSeller: true })
        .populate("category", "name slug")
        .sort({ rating: -1 })
        .limit(8)
        .lean(),
      Product.find({ isActive: true, isNewArrival: true })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({
        isActive: true,
        salePrice: { $exists: true, $gt: 0 },
      })
        .populate("category", "name slug")
        .sort({ discountPercentage: -1 })
        .limit(8)
        .lean(),
    ]);

    return {
      banners: banners.length
        ? JSON.parse(JSON.stringify(banners))
        : demoBanners,
      categories: categories.length
        ? JSON.parse(JSON.stringify(categories))
        : demoCategories,
      featuredProducts: featuredProducts.length
        ? JSON.parse(JSON.stringify(featuredProducts))
        : demoProducts,
      trendingProducts: trendingProducts.length
        ? JSON.parse(JSON.stringify(trendingProducts))
        : demoProducts.filter((p) => p.isTrending),
      bestSellers: bestSellers.length
        ? JSON.parse(JSON.stringify(bestSellers))
        : demoProducts.filter((p) => p.isBestSeller),
      newArrivals: newArrivals.length
        ? JSON.parse(JSON.stringify(newArrivals))
        : demoProducts.filter((p) => p.isNewArrival),
      flashSaleProducts: flashSaleProducts.length
        ? JSON.parse(JSON.stringify(flashSaleProducts))
        : demoProducts.filter((p) => p.salePrice),
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
        <CountdownBanner />
      </Suspense>

      <Suspense fallback={null}>
        <FeaturedCategories categories={data.categories} />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="Featured"
          accent="Gear"
          subtitle="Handpicked by our gaming experts"
          products={data.featuredProducts}
          viewAllLink="/categories?filter=featured"
          accentColor="cyan"
        />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="Trending"
          accent="Now"
          subtitle="What gamers are buying this week"
          products={data.trendingProducts}
          viewAllLink="/categories?filter=trending"
          accentColor="pink"
        />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="Best"
          accent="Sellers"
          subtitle="Top-rated gear loved by thousands"
          products={data.bestSellers}
          viewAllLink="/categories?filter=bestseller"
          accentColor="purple"
        />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="New"
          accent="Arrivals"
          subtitle="Fresh drops just landed in the store"
          products={data.newArrivals}
          viewAllLink="/categories?filter=new"
          accentColor="green"
        />
      </Suspense>

      <Suspense fallback={null}>
        <FlashSaleSection products={data.flashSaleProducts} />
      </Suspense>

      <NewsletterSection />

      <Suspense fallback={null}>
        <BrandPartnersSection />
      </Suspense>
    </>
  );
}
