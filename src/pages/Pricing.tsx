import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Rocket, Building2, Building, CreditCard, HelpCircle, Calendar, X } from "lucide-react";

export default function Pricing() {
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
                Simple, <span className="text-primary">Transparent</span> Pricing
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that's right for your business needs.
              </p>
              <div className="mt-6 w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard
                icon={<Rocket size={28} />}
                title="Starter"
                price="$9.99"
                description="Perfect for individuals and small businesses just getting started."
                features={[
                  "1 Brand Identity",
                  "Basic Brand Guidelines",
                  "Logo Generation",
                  "Color Palette",
                  "Typography Recommendations",
                  "Email Support"
                ]}
                buttonText="Get Started"
                buttonVariant="outline"
              />
              <PricingCard
                icon={<Building size={28} />}
                title="Professional"
                price="$19.99"
                description="Ideal for growing businesses that need more comprehensive branding."
                features={[
                  "3 Brand Identities",
                  "Comprehensive Brand Guidelines",
                  "Multiple Logo Variations",
                  "Extended Color Palette",
                  "Typography System",
                  "Brand Voice Guidelines",
                  "Priority Email Support"
                ]}
                buttonText="Get Started"
                buttonVariant="default"
                highlighted={true}
              />
              <PricingCard
                icon={<Building2 size={28} />}
                title="Enterprise"
                price="$49.99"
                description="For established businesses with complex branding needs."
                features={[
                  "Unlimited Brand Identities",
                  "Premium Brand Guidelines",
                  "Custom Logo Design Process",
                  "Complete Color System",
                  "Custom Typography",
                  "Brand Voice & Messaging",
                  "Social Media Templates",
                  "Dedicated Support"
                ]}
                buttonText="Contact Sales"
                buttonVariant="outline"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find answers to common questions about our pricing and plans.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <FAQItem
                icon={<Calendar className="text-primary" size={20} />}
                question="Can I switch plans later?"
                answer="Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              />
              <FAQItem
                icon={<Rocket className="text-primary" size={20} />}
                question="Is there a free trial?"
                answer="We offer a 7-day free trial for all plans so you can test our platform before committing."
              />
              <FAQItem
                icon={<CreditCard className="text-primary" size={20} />}
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
              />
              <FAQItem
                icon={<X className="text-primary" size={20} />}
                question="Can I cancel anytime?"
                answer="Yes, you can cancel your subscription at any time with no cancellation fees."
              />
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

// Pricing Card Component
function PricingCard({ 
  icon,
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  buttonVariant = "default",
  highlighted = false 
}: { 
  icon: React.ReactNode;
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  buttonText: string; 
  buttonVariant?: "default" | "outline"; 
  highlighted?: boolean;
}) {
  return (
    <div className={`p-8 border rounded-lg ${highlighted ? 'border-primary shadow-xl ring-1 ring-primary/20' : 'shadow-sm hover:shadow-md hover:border-gray-300'} transition-all duration-300 relative overflow-hidden`}>
      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${highlighted ? 'bg-primary/10' : 'bg-gray-100'} -translate-x-12 translate-y-12 rotate-45 transform`}></div>

      {/* Icon */}
      <div className="mb-6 relative">
        <div className={`w-16 h-16 rounded-full ${highlighted ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-600'} flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-gray-500"> / month</span>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button variant={buttonVariant} className="w-full" asChild>
        <Link to="/register">{buttonText}</Link>
      </Button>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ icon, question, answer }: { icon: React.ReactNode; question: string; answer: string }) {
  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300 group">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-all duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">{question}</h3>
          <p className="text-gray-600">{answer}</p>
        </div>
      </div>
    </div>
  );
}
