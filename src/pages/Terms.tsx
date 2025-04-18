import { Navbar } from "@/components/layout/Navbar";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"></div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
                Terms of <span className="text-primary">Service</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Please read these terms carefully before using our platform.
              </p>
              <div className="mt-6 w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary mb-8">
                <p className="text-gray-700 font-medium">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to BrandIt ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the BrandIt website, applications, and services (collectively, the "Services").
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                2. Account Registration
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To access certain features of the Services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                3. Use of Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You may use our Services only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the Services in any way that violates any applicable law or regulation</li>
                <li>Use the Services to transmit any material that is defamatory, offensive, or otherwise objectionable</li>
                <li>Attempt to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Services</li>
                <li>Use any robot, spider, or other automatic device to access the Services for any purpose</li>
                <li>Impersonate or attempt to impersonate BrandIt, a BrandIt employee, or another user</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                4. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by BrandIt, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon completion of the branding process and full payment (if applicable), you will own the rights to the final brand assets generated specifically for you. However, BrandIt retains ownership of the underlying technology, algorithms, and systems used to generate these assets.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                5. Payment Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Certain aspects of the Services may be provided for a fee. You agree to pay all fees in accordance with the fees, charges, and billing terms in effect at the time a fee is due and payable.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All payments are non-refundable except as expressly set forth in these Terms or as required by applicable law.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                6. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                In no event will BrandIt, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Services, including any direct, indirect, special, incidental, consequential, or punitive damages.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                7. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them, and apply to all access to and use of the Services thereafter.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of the Services following the posting of revised Terms means that you accept and agree to the changes.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                8. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Questions or comments about the Services or these Terms may be directed to our support team at <a href="mailto:support@brandit.com" className="text-primary hover:underline font-medium">support@brandit.com</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-white mt-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
              <div className="mb-8 md:mb-0">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo_brandit.png" alt="BrandIt Logo" className="h-16 w-auto object-contain" />
                </div>
                <p className="text-gray-400 max-w-xs">
                  Your AI branding co-pilot. Create professional brand identities in minutes, not months.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold mb-3">Product</h3>
                  <ul className="space-y-2">
                    <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                    <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Company</h3>
                  <ul className="space-y-2">
                    <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                    <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Legal</h3>
                  <ul className="space-y-2">
                    <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                    <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left">
              <p className="text-gray-500">© {new Date().getFullYear()} BrandIt. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
