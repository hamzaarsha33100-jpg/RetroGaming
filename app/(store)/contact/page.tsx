import { Metadata } from "next";
import ContactForm from "./ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact Us | Retro Gaming",
  description:
    "Get in touch with Retro Gaming. We're here to help with any questions about products, orders, or support.",
  openGraph: {
    title: "Contact Us | Retro Gaming",
    description: "Get in touch with our team for any questions or support",
  },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: settings.supportEmail,
      description: "We'll respond within 24 hours",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: settings.contactPhone,
      description: settings.businessHours,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: settings.contactAddress,
      description: "United States",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question about our products or need support? We're here to
            help! Fill out the form below or use our contact information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{info.title}</h3>
                  <p className="text-gray-300 mb-1">{info.value}</p>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  What is your shipping policy?
                </h3>
                <p className="text-gray-400">
                  We offer free shipping on all orders over $50 within the United
                  States. Standard delivery takes 3-5 business days, with expedited
                  options available at checkout.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  What is your return policy?
                </h3>
                <p className="text-gray-400">
                  We accept returns within 30 days of purchase for a full refund.
                  Products must be unused and in original packaging. Return shipping
                  is free for defective items.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Do you offer warranty on products?
                </h3>
                <p className="text-gray-400">
                  Yes! All products come with manufacturer warranty. Additionally,
                  we offer extended warranty options at checkout for added peace of
                  mind.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  How can I track my order?
                </h3>
                <p className="text-gray-400">
                  Once your order ships, you'll receive a tracking number via email.
                  You can also track your order anytime by logging into your account
                  and viewing your order history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
