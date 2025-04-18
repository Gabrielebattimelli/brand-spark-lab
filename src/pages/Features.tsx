import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Palette, FileText, Type, MessageSquare, Download } from "lucide-react";

export default function Features() {
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
                  Powerful <span className="text-primary">Features</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0">
                  Discover all the powerful features that BrandIt offers to help you create a professional brand identity.
                </p>
              </div>
              <div className="lg:ml-auto hidden lg:block">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border">
                  <img 
                    src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="BrandIt Features" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FeatureCard
                icon={<Sparkles className="text-primary" size={24} />}
                title="AI-Powered Brand Strategy"
                description="Our advanced AI analyzes your business information to create a comprehensive brand strategy tailored to your specific needs and goals."
              />
              <FeatureCard
                icon={<Palette className="text-primary" size={24} />}
                title="Logo Generation"
                description="Get multiple logo concepts generated based on your brand's personality, industry, and preferences."
              />
              <FeatureCard
                icon={<Palette className="text-primary" size={24} />}
                title="Color Palette Selection"
                description="Receive a professionally curated color palette that reflects your brand's values and appeals to your target audience."
              />
              <FeatureCard
                icon={<Type className="text-primary" size={24} />}
                title="Typography Recommendations"
                description="Get font pairings that complement your brand's style and ensure readability across all platforms."
              />
              <FeatureCard
                icon={<MessageSquare className="text-primary" size={24} />}
                title="Brand Voice Development"
                description="Define your brand's tone and messaging style with AI-generated guidelines for consistent communication."
              />
              <FeatureCard
                icon={<FileText className="text-primary" size={24} />}
                title="Brand Guidelines Document"
                description="Download a complete brand guidelines document that includes all your brand elements and usage instructions."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Build Your Brand?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Start creating your professional brand identity today with BrandIt.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
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

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 group">
      <div className="mb-5">
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
