import { Metadata } from "next";

const lastUpdated = "July 4, 2026";

export const metadata: Metadata = {
  title: "Terms & Conditions | Retro Gaming",
  description: "Read our terms and conditions for using Retro Gaming services",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 mb-8">
            Last updated: {lastUpdated}
          </p>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using Retro Gaming's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms & Conditions, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Use of Services</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Use our services in any way that violates any applicable federal, state, local, or international law</li>
                <li>Impersonate or attempt to impersonate Retro Gaming, a Retro Gaming employee, another user, or any other person or entity</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
                <li>Use any robot, spider, or other automatic device to access our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
              <p className="text-gray-300 leading-relaxed">
                To access certain features, you may be required to register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Product Information</h2>
              <p className="text-gray-300 leading-relaxed">
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Orders and Payments</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Payment must be received before products are shipped. We accept major credit cards and other payment methods as indicated on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Shipping and Delivery</h2>
              <p className="text-gray-300 leading-relaxed">
                We offer shipping within the United States. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, weather, or other circumstances beyond our control. Risk of loss and title for products pass to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Returns and Refunds</h2>
              <p className="text-gray-300 leading-relaxed">
                We accept returns within 30 days of purchase for unused products in original packaging. Return shipping costs are the responsibility of the customer unless the product is defective. Refunds will be processed within 5-10 business days after we receive the returned item. Please refer to our Returns Policy for complete details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of Retro Gaming or its content suppliers and is protected by United States and international copyright laws. You may not reproduce, distribute, modify, or create derivative works from any content without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, Retro Gaming shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms & Conditions at any time. We will notify users of any material changes by posting the new Terms & Conditions on this page with an updated "Last Updated" date. Your continued use of our services after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-4 text-gray-300">
                <p>Retro Gaming</p>
                <p>123 Gaming Street</p>
                <p>San Francisco, CA 94102</p>
                <p>Email: legal@retrogaming.com</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
