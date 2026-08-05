import { Metadata } from "next";
import { Trophy, Users, Zap, Shield, Heart, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Retro Gaming",
  description:
    "Learn about Retro Gaming - Your trusted destination for premium gaming accessories in the United States.",
  openGraph: {
    title: "About Us | Retro Gaming",
    description: "Your trusted destination for premium gaming accessories",
  },
};

const stats = [
  { label: "Products", value: "500+", icon: Package },
  { label: "Happy Customers", value: "50K+", icon: Users },
  { label: "Years Experience", value: "10+", icon: Trophy },
  { label: "Fast Delivery", value: "24/7", icon: Zap },
];

const values = [
  {
    icon: Trophy,
    title: "Quality First",
    description:
      "We only stock products from trusted brands that meet our high standards for quality and performance.",
  },
  {
    icon: Shield,
    title: "Customer Protection",
    description:
      "All purchases are protected with our 30-day return policy and comprehensive warranty coverage.",
  },
  {
    icon: Zap,
    title: "Fast Shipping",
    description:
      "Free shipping on orders over $50 with expedited delivery options available across the US.",
  },
  {
    icon: Heart,
    title: "Gaming Community",
    description:
      "More than a store - we're a community of passionate gamers helping you level up your setup.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              About Retro Gaming
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Your trusted destination for premium gaming accessories. We bring you
              the latest and greatest gear to elevate your gaming experience.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 text-center hover:border-purple-500/40 transition"
              >
                <Icon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our Story */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Founded in 2014, Retro Gaming started with a simple mission: to
                provide gamers across the United States with access to the best
                gaming accessories at competitive prices.
              </p>
              <p>
                What began as a small online store has grown into a trusted
                destination for over 50,000 gamers. We've built our reputation on
                quality products, exceptional customer service, and a genuine
                passion for gaming.
              </p>
              <p>
                Today, we partner with leading brands like Sony PlayStation,
                Microsoft Xbox, Razer, Logitech, and more to bring you the latest
                controllers, headsets, keyboards, mice, and accessories that help
                you perform at your best.
              </p>
              <p>
                Our team of gaming enthusiasts carefully curates every product,
                ensuring it meets our high standards before it reaches your hands.
                Whether you're a casual player or a competitive pro, we're here to
                help you build the ultimate gaming setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose Us
          </h2>
          <p className="text-gray-400 text-lg">
            The values that drive everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Upgrade Your Setup?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Explore our collection of premium gaming accessories and take your
            gaming experience to the next level.
          </p>
          <a
            href="/categories"
            className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
