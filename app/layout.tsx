import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const siteName = settings?.siteName || "Retro Gaming";
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ),
    title: {
      default: `${siteName} | Premium Gaming Accessories`,
      template: `%s | ${siteName}`,
    },
    description:
      `Shop the latest premium gaming accessories at ${siteName}. Controllers, headsets, keyboards, mice, and more for the ultimate gaming setup.`,
    keywords: [
      "gaming accessories",
      "gaming headset",
      "gaming keyboard",
      "gaming mouse",
      "gaming controller",
      "retro gaming",
      "gaming peripherals",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_APP_URL,
      siteName,
      title: `${siteName} | Premium Gaming Accessories`,
      description:
        "Shop the latest premium gaming accessories. Elevate your gaming experience.",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Premium Gaming Accessories`,
      description: "Shop the latest premium gaming accessories.",
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          visibleToasts={4}
          expand={false}
          toastOptions={{
            style: {
              background: "#0f0f1a",
              border: "1px solid #1e1e3f",
              color: "#e0e0ff",
            },
            duration: 4000,
            classNames: {
              success: "border-neon-green/40",
              error: "border-destructive/40",
              warning: "border-neon-yellow/40",
              info: "border-neon-cyan/40",
            },
          }}
        />
      </body>
    </html>
  );
}
