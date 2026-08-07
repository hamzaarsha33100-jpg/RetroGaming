import type { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import BlogPost from "@/models/BlogPost";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/categories",
  "/playstation",
  "/xbox",
  "/ps-games",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/search",
  "/blog",
  "/account",
  "/account/orders",
  "/account/wishlist",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const settings = await getSettings().catch(() => null);
  const changeFrequency = (settings?.seo?.defaultChangeFrequency ||
    "weekly") as MetadataRoute.Sitemap[number]["changeFrequency"];
  const includeOutOfStock = settings?.seo?.includeOutOfStock ?? false;

  const staticUrls = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority: route === "" ? 1 : route === "/blog" ? 0.7 : 0.8,
  }));

  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];
  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    await connectDB();
    const productQuery: Record<string, unknown> = { isActive: true };
    if (!includeOutOfStock) productQuery.isOutOfStock = { $ne: true };
    const products = await Product.find(productQuery)
      .select("slug updatedAt")
      .lean();
    productUrls = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency,
      priority: 0.7,
    }));

    const categories = await Category.find({ isActive: true })
      .select("slug updatedAt")
      .lean();
    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/categories?category=${c._id}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency,
      priority: 0.6,
    }));

    const posts = await BlogPost.find({ isPublished: true })
      .select("slug updatedAt publishedAt")
      .lean();
    blogUrls = posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // fall back to static routes only
  }

  return [...staticUrls, ...categoryUrls, ...productUrls, ...blogUrls];
}
