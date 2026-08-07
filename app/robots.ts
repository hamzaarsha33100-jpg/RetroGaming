import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const settings = await getSettings().catch(() => null);
  const robotsEnabled = settings?.seo?.robotsEnabled ?? true;

  if (!robotsEnabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/checkout", "/buy-now", "/cart"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
