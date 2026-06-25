"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    role: "Professional Esports Player",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Retro Gaming has completely transformed my setup. The mechanical keyboard I got here has insane response time and the RGB looks absolutely fire on stream. 10/10 would recommend to any competitive player.",
    product: "Pro Series Mechanical Keyboard",
  },
  {
    id: 2,
    name: "Sarah Martinez",
    role: "Content Creator",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "The noise-canceling headset I ordered arrived in perfect condition and the sound quality is phenomenal. My stream audio has never been cleaner. Shipping was fast and the packaging was premium.",
    product: "Elite Gaming Headset 7.1",
  },
  {
    id: 3,
    name: "Marcus Johnson",
    role: "PC Gaming Enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Been buying gaming gear for 10+ years and this is genuinely the best experience I've had. The product quality matches the price and customer service actually cares. My go-to store from now on.",
    product: "Ultra-Precision Gaming Mouse",
  },
  {
    id: 4,
    name: "Emma Williams",
    role: "Casual Gamer",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b6f6b3f8?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    text: "Ordered a controller bundle and it arrived in 2 days. The build quality is excellent for the price. My kids love the RGB feature and it really elevated our gaming room aesthetic.",
    product: "Next-Gen Controller Bundle",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  const goNext = () =>
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gaming-surface/30">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-neon-cyan text-sm font-gaming uppercase tracking-widest mb-2">
            What Players Say
          </p>
          <h2 className="section-title">
            Customer <span className="text-gradient">Reviews</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="gaming-card p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="relative">
                      <img
                        src={current.avatar}
                        alt={current.name}
                        className="w-20 h-20 rounded-full border-2 border-neon-cyan/30 object-cover"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20 animate-ping" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">{current.name}</p>
                      <p className="text-gaming-textMuted text-xs">{current.role}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5"
                          fill={i < current.rating ? "#ffe600" : "transparent"}
                          stroke={i < current.rating ? "#ffe600" : "#8888aa"}
                        />
                      ))}
                    </div>

                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-neon-cyan/20" />
                      <p className="text-gaming-text text-lg leading-relaxed pl-6">
                        {current.text}
                      </p>
                    </div>

                    <p className="text-neon-cyan/70 text-sm mt-4 font-medium">
                      Purchased: {current.product}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goPrev}
                className="p-3 rounded-full border border-gaming-border text-gaming-textMuted hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-6 h-2 bg-neon-cyan shadow-neon"
                        : "w-2 h-2 bg-gaming-border hover:bg-gaming-textMuted"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="p-3 rounded-full border border-gaming-border text-gaming-textMuted hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* All testimonial thumbnails */}
          <div className="flex justify-center gap-4 mt-8">
            {testimonials.map((t, index) => (
              <button
                key={t.id}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? "ring-2 ring-neon-cyan scale-110"
                    : "opacity-50 hover:opacity-80"
                } rounded-full`}
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
