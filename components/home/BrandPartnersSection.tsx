"use client";

const brands = [
  { name: "Razer", logo: null },
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
        <div className="text-center mb-10">
          <p className="text-gaming-textMuted text-sm uppercase tracking-widest">
            Official Partner Brands
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-16 items-center w-max animate-marquee">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[120px] group cursor-pointer"
              >
                <span className="font-gaming font-bold text-gaming-border group-hover:text-neon-cyan transition-colors duration-300 text-lg whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gaming-dark to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gaming-dark to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
