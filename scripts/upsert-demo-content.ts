import fs from "fs";
import path from "path";
import { slugify } from "../lib/utils";
import { demoBanners, demoCategories, demoProducts } from "../lib/demo-data";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] ??= value;
  }
}

async function upsertDemoContent() {
  loadLocalEnv();
  const [{ default: connectDB }, { default: Category }, { default: Product }, { default: Banner }] =
    await Promise.all([
      import("../lib/mongodb"),
      import("../models/Category"),
      import("../models/Product"),
      import("../models/Banner"),
    ]);

  await connectDB();

  const categoryBySlug = new Map<string, { _id: unknown; slug: string }>();

  for (const category of demoCategories) {
    const savedCategory = await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        $set: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          isActive: true,
          sortOrder: category.sortOrder,
        },
      },
      { upsert: true, new: true }
    );

    categoryBySlug.set(savedCategory.slug, savedCategory);
  }

  for (const product of demoProducts) {
    const categorySlug =
      typeof product.category === "object" ? product.category.slug : "controllers";
    const fallbackCategory = categoryBySlug.values().next().value;
    const category = categoryBySlug.get(categorySlug) || fallbackCategory;

    if (!category) {
      throw new Error("No demo category was available for product seeding.");
    }

    await Product.findOneAndUpdate(
      { sku: product.sku },
      {
        $set: {
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
          isOutOfStock: false,
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
        },
        $setOnInsert: {
          views: 0,
        },
      },
      { upsert: true }
    );
  }

  for (const banner of demoBanners) {
    await Banner.findOneAndUpdate(
      { title: banner.title, position: banner.position },
      {
        $set: {
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
        },
      },
      { upsert: true }
    );
  }

  console.log(
    `Upserted ${demoCategories.length} categories, ${demoProducts.length} products, and ${demoBanners.length} banners.`
  );
}

upsertDemoContent()
  .catch((error) => {
    console.error("Failed to upsert demo content:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  });
