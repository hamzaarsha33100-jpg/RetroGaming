"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Play, Gamepad2, Zap } from "lucide-react";
import { Banner } from "@/types";

interface HeroSectionProps {
  banners: Banner[];
}

const defaultBanners: Banner[] = [
  {
    _id: "1",
    title: "Level Up Your Gaming",
    subtitle: "PlayStation Collection",
    description:
      "Discover the full PlayStation ecosystem. From PS5 consoles to DualSense controllers, experience gaming the way it was meant to be played.",
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1600&h=900&fit=crop",
    ctaText: "Shop PlayStation",
    ctaLink: "/categories/playstation-5",
    secondaryCtaText: "View Deals",
    secondaryCtaLink: "/categories?sale=true",
    badge: "New Collection",
    isActive: true,
    sortOrder: 0,
    position: "hero",
  },
  {
    _id: "2",
    title: "Power Your Play",
    subtitle: "Xbox Universe",
    description:
      "Xbox Series X, Elite controllers, and everything you need to dominate. Play thousands of games across four generations.",
    image:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=1600&h=900&fit=crop",
    ctaText: "Shop Xbox",
    ctaLink: "/categories/xbox-series-x",
    secondaryCtaText: "Explore Bundles",
    secondaryCtaLink: "/categories?filter=featured",
    badge: "Best Sellers",
    isActive: true,
    sortOrder: 1,
    position: "hero",
  },
  {
    _id: "3",
    title: "Upgrade Your Setup",
    subtitle: "Premium Accessories",
    description:
      "Controllers, headsets, keyboards, and monitors. Everything you need to build the ultimate gaming battle station.",
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1600&h=900&fit=crop",
    ctaText: "Shop Accessories",
    ctaLink: "/categories",
    secondaryCtaText: "New Arrivals",
    secondaryCtaLink: "/categories?filter=new",
    badge: "Hot This Week",
    isActive: true,
    sortOrder: 2,
    position: "hero",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 1.05,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function HeroSection({ banners }: HeroSectionProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeBanners = useMemo(
    () => (banners.length > 0 ? banners : defaultBanners),
    [banners]
  );

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrentIndex(([prev]) => {
        const next =
          (prev + newDirection + activeBanners.length) % activeBanners.length;
        return [next, newDirection];
      });
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    },
    [activeBanners.length]
  );

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(([prev]) => [index, index > prev ? 1 : -1]);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    },
    []
  );

  useEffect(() => {
    if (isAutoPlaying && activeBanners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(([prev]) => [
          (prev + 1) % activeBanners.length,
          1,
        ]);
      }, 5500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, activeBanners.length]);

  const current = activeBanners[currentIndex];
  const fallbackImage =
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1600&h=900&fit=crop";
  const currentImage = failedImages.has(current.image)
    ? fallbackImage
    : current.image;

  return (
    <section className="relative h-[70vh] min-h-[520px] max-h-[800px] overflow-hidden bg-gaming-darker">
      {/* Background slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage}
            alt={current.title}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover"
            onError={() => {
              if (!failedImages.has(current.image)) {
                setFailedImages((prev) => new Set(prev).add(current.image));
              }
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-gaming-dark/90 via-gaming-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-transparent to-gaming-dark/30" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(0,255,245,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,245,0.3) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex items-center page-container">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5"
            >
              {/* Badge */}
              {current.badge && (
                <motion.span
                  custom={0}
                  variants={contentVariants}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25 backdrop-blur-sm"
                >
                  <Zap className="w-3 h-3" />
                  {current.badge}
                </motion.span>
              )}

              {/* Subtitle */}
              {current.subtitle && (
                <motion.p
                  custom={1}
                  variants={contentVariants}
                  className="text-neon-cyan text-sm font-medium uppercase tracking-[0.25em]"
                >
                  {current.subtitle}
                </motion.p>
              )}

              {/* Title */}
              <motion.h1
                custom={2}
                variants={contentVariants}
                className="font-gaming font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-white"
              >
                {current.title.split(" ").map((word, i) => {
                  const isLast = i === current.title.split(" ").length - 1;
                  return (
                    <span key={i} className="block">
                      {isLast ? (
                        <span className="text-gradient">{word}</span>
                      ) : (
                        word
                      )}
                    </span>
                  );
                })}
              </motion.h1>

              {/* Description */}
              {current.description && (
                <motion.p
                  custom={3}
                  variants={contentVariants}
                  className="text-gaming-textMuted text-base sm:text-lg max-w-md leading-relaxed"
                >
                  {current.description}
                </motion.p>
              )}

              {/* CTAs */}
              <motion.div
                custom={4}
                variants={contentVariants}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                {current.ctaLink && current.ctaText && (
                  <Link href={current.ctaLink}>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0,255,245,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-primary flex items-center justify-center gap-2.5 text-base px-8 py-3.5 w-full sm:w-auto"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {current.ctaText}
                    </motion.button>
                  </Link>
                )}
                {current.secondaryCtaLink && current.secondaryCtaText && (
                  <Link href={current.secondaryCtaLink}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-secondary flex items-center justify-center gap-2.5 text-base px-8 py-3.5 w-full sm:w-auto"
                    >
                      <Play className="w-4 h-4" />
                      {current.secondaryCtaText}
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 p-3 text-white/70 transition-all duration-200 glass hover:border-neon-cyan/50 hover:text-neon-cyan group z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 p-3 text-white/70 transition-all duration-200 glass hover:border-neon-cyan/50 hover:text-neon-cyan group z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {activeBanners.map((banner, index) => (
          <button
            key={banner._id}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all duration-400 ${
              index === currentIndex
                ? "w-8 h-2 bg-neon-cyan shadow-[0_0_12px_rgba(0,255,245,0.5)]"
                : "w-2 h-2 bg-white/25 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-8 text-gaming-textMuted text-xs font-mono tracking-wider z-10 hidden sm:block">
        <span className="text-neon-cyan font-bold">{String(currentIndex + 1).padStart(2, "0")}</span>
        <span className="mx-1.5 text-white/20">/</span>
        <span>{String(activeBanners.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
