import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "Retro Gaming | Premium Gaming Accessories",
    template: "%s | Retro Gaming",
  },
  description:
    "Shop the latest premium gaming accessories at Retro Gaming. Controllers, headsets, keyboards, mice, and more for the ultimate gaming setup.",
  keywords: [
    "gaming accessories",
    "gaming headset",
    "gaming keyboard",
    "gaming mouse",
    "gaming controller",
    "retro gaming",
    "gaming peripherals",
  ],
  authors: [{ name: "Retro Gaming" }],
  creator: "Retro Gaming",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Retro Gaming",
    title: "Retro Gaming | Premium Gaming Accessories",
    description:
      "Shop the latest premium gaming accessories. Elevate your gaming experience.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Retro Gaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Retro Gaming | Premium Gaming Accessories",
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
          toastOptions={{
            style: {
              background: "#0f0f1a",
              border: "1px solid #1e1e3f",
              color: "#e0e0ff",
            },
          }}
        />
      </body>
    </html>
  );
}
