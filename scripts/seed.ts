import fs from "fs";
import path from "path";

// Load .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    process.env[trimmed.slice(0, i).trim()] ??= trimmed.slice(i + 1).trim();
  }
}

loadEnv();

import connectDB from "../lib/mongodb";
import Category from "../models/Category";
import Product from "../models/Product";
import Banner from "../models/Banner";
import Settings, { DEFAULT_SETTINGS } from "../models/Settings";
import { slugify } from "../lib/utils";
import { demoBanners, demoCategories, demoProducts } from "../lib/demo-data";

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB");

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Banner.deleteMany({}),
  ]);

  const createdCategories = await Category.insertMany(
    demoCategories.map((cat, index) => ({
      name: cat.name,
      slug: cat.slug || slugify(cat.name),
      description: cat.description,
      image: cat.image,
      isActive: true,
      sortOrder: index,
    }))
  );
  console.log(`Created ${createdCategories.length} categories`);

  const categoryBySlug = new Map(
    createdCategories.map((category) => [category.slug, category])
  );

  const productsToSeed = demoProducts.map((product) => {
    const categorySlug =
      typeof product.category === "object" ? product.category.slug : "controllers";
    const category = categoryBySlug.get(categorySlug) || createdCategories[0];

    return {
      name: product.name,
      slug: slugify(product.name),
      category: category._id,
      brand: product.brand,
      price: product.price,
      salePrice: product.salePrice,
      discountPercentage: product.discountPercentage,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      mainImage: product.mainImage,
      isActive: true,
      isOutOfStock: product.isOutOfStock,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      specifications: product.specifications,
      tags: product.tags,
      galleryImages: product.galleryImages,
      imageTransition: product.imageTransition,
      rating: product.rating,
      reviewCount: product.reviewCount,
      views: 0,
    };
  });

  await Product.insertMany(productsToSeed);
  console.log(`Created ${productsToSeed.length} products`);

  await Banner.insertMany(
    demoBanners.map((banner) => ({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      image: banner.image,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      secondaryCtaText: banner.secondaryCtaText,
      secondaryCtaLink: banner.secondaryCtaLink,
      isActive: true,
      sortOrder: banner.sortOrder,
      position: banner.position,
    }))
  );
  console.log("Created homepage banner");

  await Settings.findOneAndUpdate({}, DEFAULT_SETTINGS, { upsert: true });
  console.log("Initialized settings");

  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
