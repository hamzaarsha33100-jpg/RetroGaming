import { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Banner from "@/models/Banner";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ProductSection from "@/components/home/ProductSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BrandPartnersSection from "@/components/home/BrandPartnersSection";
import PromoBannerSection from "@/components/home/PromoBannerSection";

async function getHomeData() {
  try {
    await connectDB();

    const [banners, categories, featuredProducts, trendingProducts, bestSellers, newArrivals, flashSaleProducts] =
      await Promise.all([
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
        Product.find({ isActive: true, salePrice: { $exists: true, $gt: 0 } })
          .populate("category", "name slug")
          .sort({ discountPercentage: -1 })
          .limit(4)
          .lean(),
      ]);

    return {
      banners: JSON.parse(JSON.stringify(banners)),
      categories: JSON.parse(JSON.stringify(categories)),
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      trendingProducts: JSON.parse(JSON.stringify(trendingProducts)),
      bestSellers: JSON.parse(JSON.stringify(bestSellers)),
      newArrivals: JSON.parse(JSON.stringify(newArrivals)),
      flashSaleProducts: JSON.parse(JSON.stringify(flashSaleProducts)),
    };
  } catch {
    return {
      banners: [],
      categories: [],
      featuredProducts: [],
      trendingProducts: [],
      bestSellers: [],
      newArrivals: [],
      flashSaleProducts: [],
    };
  }
}

export default async function HomePage() {
  const {
    banners,
    categories,
    featuredProducts,
    trendingProducts,
    bestSellers,
    newArrivals,
    flashSaleProducts,
  } = await getHomeData();

  return (
    <>
      <HeroSection banners={banners} />

      <Suspense fallback={null}>
        <FeaturedCategories categories={categories} />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="Featured"
          accent="Products"
          subtitle="Handpicked"
          products={featuredProducts}
          viewAllLink="/categories"
        />
      </Suspense>

      <Suspense fallback={null}>
        <FlashSaleSection products={flashSaleProducts} />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="Trending"
          accent="Now"
          subtitle="What's Hot"
          products={trendingProducts}
          viewAllLink="/categories?filter=trending"
        />
      </Suspense>

      <PromoBannerSection />

      <Suspense fallback={null}>
        <ProductSection
          title="Best"
          accent="Sellers"
          subtitle="Top Rated"
          products={bestSellers}
          viewAllLink="/categories?filter=bestseller"
        />
      </Suspense>

      <Suspense fallback={null}>
        <ProductSection
          title="New"
          accent="Arrivals"
          subtitle="Just Dropped"
          products={newArrivals}
          viewAllLink="/categories?filter=new"
        />
      </Suspense>

      <TestimonialsSection />

      <BrandPartnersSection />
    </>
  );
}
