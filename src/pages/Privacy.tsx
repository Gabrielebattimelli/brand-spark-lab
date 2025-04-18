import { Navbar } from "@/components/layout/Navbar";
import { Link } from "react-router-dom";

export default function Privacy() {
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
                Privacy <span className="text-primary">Policy</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                How we collect, use, and protect your information.
              </p>
              <div className="mt-6 w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
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
                At BrandIt ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Services").
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                2. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may collect several types of information from and about users of our Services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><span className="font-semibold">Personal Information:</span> This includes information that can be used to identify you, such as your name, email address, postal address, phone number, and payment information.</li>
                <li><span className="font-semibold">Business Information:</span> Information about your business, including its name, industry, target audience, and branding preferences.</li>
                <li><span className="font-semibold">Usage Data:</span> Information about how you use our Services, including your browsing actions, search queries, and other engagement metrics.</li>
                <li><span className="font-semibold">Device Information:</span> Information about the device you use to access our Services, including IP address, browser type, operating system, and device identifiers.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                3. How We Collect Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We collect information in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><span className="font-semibold">Direct Collection:</span> Information you provide when you register for an account, fill out forms, or communicate with us.</li>
                <li><span className="font-semibold">Automated Collection:</span> Information collected automatically through cookies, web beacons, and other tracking technologies as you navigate through our Services.</li>
                <li><span className="font-semibold">Third-Party Sources:</span> Information we may receive from business partners, analytics providers, and other third parties.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                4. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Providing, maintaining, and improving our Services</li>
                <li>Processing transactions and sending related information</li>
                <li>Personalizing your experience with our Services</li>
                <li>Communicating with you about our Services, updates, and promotions</li>
                <li>Analyzing usage patterns to enhance our Services</li>
                <li>Protecting our Services and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                5. How We Share Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><span className="font-semibold">Service Providers:</span> Third-party vendors who perform services on our behalf, such as payment processing, data analysis, and customer service.</li>
                <li><span className="font-semibold">Business Partners:</span> Companies with whom we partner to offer certain products, services, or promotions.</li>
                <li><span className="font-semibold">Legal Authorities:</span> When required by law or to protect our rights, property, or safety, or the rights, property, or safety of others.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                6. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                7. Your Privacy Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate or incomplete information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict or object to processing of your personal information</li>
                <li>The right to data portability</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                8. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                9. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center border-b pb-2 mb-4 mt-8">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                10. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at <a href="mailto:privacy@brandit.com" className="text-primary hover:underline font-medium">privacy@brandit.com</a>.
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
