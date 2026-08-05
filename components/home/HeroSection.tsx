"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Play } from "lucide-react";
import { Banner } from "@/types";

const heroParticles = Array.from({ length: 8 }, (_, i) => ({
  id: `hero-particle-${i}`,
  width: `${1 + ((i * 17) % 40) / 10}px`,
  height: `${1 + ((i * 29) % 40) / 10}px`,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  backgroundColor:
    i % 3 === 0 ? "#00fff5" : i % 3 === 1 ? "#9b59b6" : "#ff006e",
  opacity: 0.3 + ((i * 19) % 70) / 100,
}));

interface HeroSectionProps {
  banners: Banner[];
}

const defaultBanners: Banner[] = [
  {
    _id: "1",
    title: "Next-Gen Gaming Starts Here",
    subtitle: "Premium Gaming Accessories",
    description:
      "Dominate every game with our cutting-edge peripherals designed for competitive play.",
    image:
      "https://images.unsplash.com/photo-1593640408182-31c228b4a85d?w=1600&h=800&fit=crop",
    ctaText: "Shop Now",
    ctaLink: "/categories",
    secondaryCtaText: "Explore All",
    secondaryCtaLink: "/categories",
    isActive: true,
    sortOrder: 0,
    position: "hero",
  },
  {
    _id: "2",
    title: "RGB Everything",
    subtitle: "Make Your Setup Shine",
    description:
      "Express yourself with our full RGB ecosystem. Sync colors across all your peripherals.",
    image:
      "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=1600&h=800&fit=crop",
    ctaText: "View Collection",
    ctaLink: "/categories/keyboards",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/about",
    isActive: true,
    sortOrder: 1,
    position: "hero",
  },
  {
    _id: "3",
    title: "Pro-Level Performance",
    subtitle: "Engineered for Champions",
    description:
      "Tools used by esports professionals worldwide. Precision, speed, and endurance in every product.",
    image:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1600&h=800&fit=crop",
    ctaText: "Shop Pro Gear",
    ctaLink: "/categories",
    secondaryCtaText: "View Brands",
    secondaryCtaLink: "/categories",
    isActive: true,
    sortOrder: 2,
    position: "hero",
  },
];

export default function HeroSection({ banners }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const activeBanners = useMemo(
    () => (banners.length > 0 ? banners : defaultBanners),
    [banners]
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 8000);
    },
    []
  );

  const goNext = useCallback(
    () => goTo((currentIndex + 1) % activeBanners.length),
    [currentIndex, activeBanners.length, goTo]
  );

  const goPrev = useCallback(
    () =>
      goTo(
        (currentIndex - 1 + activeBanners.length) % activeBanners.length
      ),
    [currentIndex, activeBanners.length, goTo]
  );

  useEffect(() => {
    if (isAutoPlaying && activeBanners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, activeBanners.length]);

  const current = activeBanners[currentIndex];

  return (
    <section className="relative min-h-[560px] overflow-hidden sm:h-[78vh] sm:min-h-[620px] sm:max-h-[860px]">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={current.image}
            alt={current.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gaming-dark via-gaming-dark/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {heroParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              width: particle.width,
              height: particle.height,
              left: particle.left,
              top: particle.top,
              backgroundColor: particle.backgroundColor,
              opacity: particle.opacity,
              animationDelay: `${(particle.id.length % 5) * 0.35}s`,
              animationDuration: `${3 + (particle.id.length % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Neon grid effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 245, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 245, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-[560px] items-center page-container py-24 sm:h-full sm:min-h-0 sm:py-0">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {current.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-neon-cyan text-sm font-gaming font-medium uppercase tracking-widest"
                >
                  {current.subtitle}
                </motion.p>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-gaming font-black text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {current.title.split(" ").map((word, i) => (
                  <span key={i} className={i === 0 ? "text-gradient block" : ""}>
                    {i === 0 ? word : " " + word}
                  </span>
                ))}
              </motion.h1>

              {current.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gaming-textMuted text-lg max-w-lg leading-relaxed"
                >
                  {current.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              >
                {current.ctaLink && current.ctaText && (
                  <Link href={current.ctaLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {current.ctaText}
                    </motion.button>
                  </Link>
                )}

                {current.secondaryCtaLink && current.secondaryCtaText && (
                  <Link href={current.secondaryCtaLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-4"
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
            onClick={goPrev}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 p-3 text-white transition-all duration-200 glass hover:border-neon-cyan/50 hover:text-neon-cyan sm:block group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 p-3 text-white transition-all duration-200 glass hover:border-neon-cyan/50 hover:text-neon-cyan sm:block group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {activeBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 h-2 bg-neon-cyan shadow-neon"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 right-8 flex flex-col items-center gap-1 text-gaming-textMuted text-xs"
      >
        <span className="writing-mode-vertical tracking-widest uppercase hidden lg:block">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-gaming-textMuted to-transparent" />
      </motion.div>
    </section>
  );
}
