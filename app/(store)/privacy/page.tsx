import { Metadata } from "next";

const lastUpdated = "July 4, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | Retro Gaming",
  description: "Read our privacy policy to understand how we collect, use, and protect your data",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 mb-8">
            Last updated: {lastUpdated}
          </p>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                At Retro Gaming, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read this privacy policy carefully. If you do not agree with the terms, please discontinue use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, billing address</li>
                <li><strong>Payment Information:</strong> Credit card details (processed securely through Stripe)</li>
                <li><strong>Account Information:</strong> Username, password, purchase history, wishlist</li>
                <li><strong>Communication Data:</strong> Messages you send us, reviews, and feedback</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders, account, and customer service</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website, products, and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
                <li>Personalize your shopping experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Sharing Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Payment processors (Stripe), shipping companies, email service providers</li>
                <li><strong>Business Partners:</strong> With your consent for joint promotions or offerings</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze site traffic, and for marketing purposes. Cookies are small data files stored on your device. You can control cookie preferences through your browser settings, but disabling cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. This includes encryption of sensitive data, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                To exercise these rights, contact us at privacy@retrogaming.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Links</h2>
              <p className="text-gray-300 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page with a new "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 text-gray-300">
                <p>Retro Gaming</p>
                <p>123 Gaming Street</p>
                <p>San Francisco, CA 94102</p>
                <p>Email: privacy@retrogaming.com</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
