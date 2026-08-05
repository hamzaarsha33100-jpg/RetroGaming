"use client";

import dynamic from "next/dynamic";

const FlashSaleSection = dynamic(() => import("@/components/home/FlashSaleSection"), { ssr: false });
const TestimonialsSection = dynamic(() => import("@/components/home/TestimonialsSection"), { ssr: false });
const BrandPartnersSection = dynamic(() => import("@/components/home/BrandPartnersSection"), { ssr: false });
const PromoBannerSection = dynamic(() => import("@/components/home/PromoBannerSection"), { ssr: false });

interface LazySectionsProps {
  flashSaleProducts: any[];
}

export function LazySections({ flashSaleProducts }: LazySectionsProps) {
  return (
    <>
      <FlashSaleSection products={flashSaleProducts} />
      <PromoBannerSection />
      <TestimonialsSection />
      <BrandPartnersSection />
    </>
  );
}
