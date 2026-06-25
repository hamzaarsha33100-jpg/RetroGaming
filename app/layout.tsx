import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  verification: {
    google: "your-google-verification-code",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-body`}>
        <SessionProvider session={session}>
          <QueryProvider>
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
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
