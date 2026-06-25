"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Play } from "lucide-react";
import { Banner } from "@/types";
import gsap from "gsap";

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
  const activeBanners = banners.length > 0 ? banners : defaultBanners;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particlesRef.current) {
      const particles = particlesRef.current.querySelectorAll(".particle");
      gsap.to(particles, {
        y: "random(-30, 30)",
        x: "random(-20, 20)",
        opacity: "random(0.3, 1)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.2, from: "random" },
        ease: "sine.inOut",
      });
    }
  }, []);

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

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goNext = () => goTo((currentIndex + 1) % activeBanners.length);
  const goPrev = () =>
    goTo((currentIndex - 1 + activeBanners.length) % activeBanners.length);

  const current = activeBanners[currentIndex];

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
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
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gaming-dark via-gaming-dark/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              backgroundColor: i % 3 === 0 ? "#00fff5" : i % 3 === 1 ? "#9b59b6" : "#ff006e",
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Neon grid effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 245, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 245, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative h-full page-container flex items-center">
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
                className="font-gaming font-black text-4xl md:text-6xl lg:text-7xl text-white leading-tight"
              >
                {current.title.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className={
                      i === 0 ? "text-gradient block" : ""
                    }
                  >
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
                className="flex flex-wrap gap-4"
              >
                {current.ctaLink && current.ctaText && (
                  <Link href={current.ctaLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary flex items-center gap-2 text-base px-8 py-4"
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
                      className="btn-secondary flex items-center gap-2 text-base px-8 py-4"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass border border-white/10 text-white hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-200 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass border border-white/10 text-white hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-200 group"
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
