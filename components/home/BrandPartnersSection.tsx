"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "Razer", logo: "https://images.unsplash.com/photo-1593640408182-31c228b4a85d?w=100&h=50&fit=crop" },
  { name: "SteelSeries", logo: null },
  { name: "Logitech G", logo: null },
  { name: "HyperX", logo: null },
  { name: "Corsair", logo: null },
  { name: "ASUS ROG", logo: null },
  { name: "MSI", logo: null },
  { name: "Alienware", logo: null },
];

export default function BrandPartnersSection() {
  return (
    <section className="py-16 border-t border-gaming-border">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-gaming-textMuted text-sm uppercase tracking-widest">
            Official Partner Brands
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -50 + "%"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-16 items-center w-max"
          >
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[120px] group cursor-pointer"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-40 group-hover:opacity-100"
                  />
                ) : (
                  <span className="font-gaming font-bold text-gaming-border group-hover:text-neon-cyan transition-colors duration-300 text-lg whitespace-nowrap">
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gaming-dark to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gaming-dark to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
