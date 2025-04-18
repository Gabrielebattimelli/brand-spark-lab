import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Award, Lightbulb, Sparkles, Zap, Heart } from "lucide-react";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
                About BrandIt
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're on a mission to democratize professional branding for businesses of all sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    BrandIt was founded in 2023 with a simple but powerful idea: what if creating a professional brand identity could be as easy as answering a few questions?
                  </p>
                  <p>
                    Our founders, experienced designers and AI specialists, recognized that traditional branding agencies were out of reach for most small businesses and startups. The process was too expensive, too time-consuming, and often too complicated.
                  </p>
                  <p>
                    By combining cutting-edge AI technology with branding expertise, we've created a platform that makes professional branding accessible to everyone, regardless of budget or design experience.
                  </p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="BrandIt Team" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueCard
                icon={<Users className="text-primary" size={24} />}
                title="Accessibility"
                description="We believe professional branding should be accessible to everyone, not just those with big budgets."
              />
              <ValueCard
                icon={<Award className="text-primary" size={24} />}
                title="Quality"
                description="We never compromise on quality. Our AI is trained on the best branding practices to deliver professional results."
              />
              <ValueCard
                icon={<Lightbulb className="text-primary" size={24} />}
                title="Innovation"
                description="We're constantly pushing the boundaries of what's possible with AI and design technology."
              />
              <ValueCard
                icon={<Zap className="text-primary" size={24} />}
                title="Simplicity"
                description="We make complex branding processes simple and straightforward for our users."
              />
              <ValueCard
                icon={<Sparkles className="text-primary" size={24} />}
                title="Empowerment"
                description="We empower businesses to take control of their brand identity and stand out in their market."
              />
              <ValueCard
                icon={<Heart className="text-primary" size={24} />}
                title="Integrity"
                description="We're honest, transparent, and committed to doing what's right for our customers."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Be part of the branding revolution and create your professional brand identity today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Contact Us</Link>
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

// Value Card Component
function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 group">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
