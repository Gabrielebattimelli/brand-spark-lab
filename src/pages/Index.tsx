
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, Check, Sparkles, Palette, Shield, Zap } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                  Create Your Brand Identity with <span className="text-primary">AI</span>
                </h1>
                <p className="text-xl text-gray-600">
                  BrandIt guides you through the entire branding process, from discovery to a complete brand kit — all in minutes, not months.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/register")}
                    className="gap-2"
                  >
                    Start for Free
                    <ArrowRight size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
                  <span className="flex items-center">
                    <Check size={16} className="text-green-500 mr-1" />
                    No credit card
                  </span>
                  <span className="flex items-center">
                    <Check size={16} className="text-green-500 mr-1" />
                    5-minute setup
                  </span>
                </div>
              </div>
              <div className="lg:ml-auto">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border">
                  <img 
                    src="https://placehold.co/600x400/f38e63/ffffff?text=BrandIt+Platform"
                    alt="BrandIt Platform" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The Complete Branding Solution</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get everything you need to build a professional brand, all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Sparkles className="text-primary" size={24} />}
                title="AI-Powered Branding"
                description="Our AI analyzes your responses to create a brand identity perfectly tailored to your business needs."
              />
              <FeatureCard
                icon={<Palette className="text-primary" size={24} />}
                title="Complete Brand Kit"
                description="Get a complete brand guideline document, logo designs, color palettes, and font recommendations."
              />
              <FeatureCard
                icon={<Zap className="text-primary" size={24} />}
                title="Fast & Efficient Process"
                description="What takes agencies weeks or months, BrandIt completes in minutes through our guided wizard."
              />
              <FeatureCard
                icon={<Check className="text-primary" size={24} />}
                title="Professional Results"
                description="Achieve agency-quality branding at a fraction of the cost, with professional-grade outputs."
              />
              <FeatureCard
                icon={<Shield className="text-primary" size={24} />}
                title="Strategic Foundation"
                description="Not just visuals — build a brand with a solid strategic foundation that aligns with your business goals."
              />
              <FeatureCard
                icon={<ArrowRight className="text-primary" size={24} />}
                title="Ready-to-Use Files"
                description="Download production-ready files in industry-standard formats for immediate use across all channels."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How BrandIt Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our guided process makes creating your brand simple and straightforward.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Answer Questions</h3>
                <p className="text-gray-600">
                  Tell us about your business, audience, and preferences through our interactive questionnaire.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Review & Refine</h3>
                <p className="text-gray-600">
                  Our AI generates brand elements — review, provide feedback, and refine until perfect.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Download Brand Kit</h3>
                <p className="text-gray-600">
                  Get your complete brand kit with logo, guidelines, colors, and typography ready to use.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
              >
                Start Building Your Brand
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
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="text-xl font-bold">BrandIt</span>
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
