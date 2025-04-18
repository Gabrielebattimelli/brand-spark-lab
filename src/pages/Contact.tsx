import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
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
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <div className="mt-6 w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>

                <form className="space-y-6 p-6 border rounded-lg shadow-sm bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-1 h-4 bg-primary/60 rounded-full mr-2"></span>
                        First Name
                      </label>
                      <Input id="firstName" placeholder="John" className="border-gray-300 focus:border-primary focus:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-1 h-4 bg-primary/60 rounded-full mr-2"></span>
                        Last Name
                      </label>
                      <Input id="lastName" placeholder="Doe" className="border-gray-300 focus:border-primary focus:ring-primary/20" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="w-1 h-4 bg-primary/60 rounded-full mr-2"></span>
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="john@example.com" className="border-gray-300 focus:border-primary focus:ring-primary/20" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="w-1 h-4 bg-primary/60 rounded-full mr-2"></span>
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" className="border-gray-300 focus:border-primary focus:ring-primary/20" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="w-1 h-4 bg-primary/60 rounded-full mr-2"></span>
                      Message
                    </label>
                    <Textarea id="message" placeholder="Your message here..." className="min-h-[150px] border-gray-300 focus:border-primary focus:ring-primary/20" />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </form>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  You can also reach out to us directly using the information below.
                </p>

                <div className="space-y-6">
                  <ContactInfo 
                    icon={<Mail className="text-primary" />}
                    title="Email Us"
                    content="support@brandit.com"
                    link="mailto:support@brandit.com"
                  />

                  <ContactInfo 
                    icon={<Phone className="text-primary" />}
                    title="Call Us"
                    content="+1 (555) 123-4567"
                    link="tel:+15551234567"
                  />

                  <ContactInfo 
                    icon={<MapPin className="text-primary" />}
                    title="Visit Us"
                    content="123 Innovation Way, San Francisco, CA 94107"
                    link="https://maps.google.com"
                  />
                </div>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Business Hours</h3>
                  <p className="text-gray-600 mb-2">Monday - Friday: 9:00 AM - 6:00 PM (PST)</p>
                  <p className="text-gray-600">Saturday - Sunday: Closed</p>
                </div>

                <div className="mt-8 rounded-lg overflow-hidden shadow-md border">
                  <img 
                    src="https://maps.googleapis.com/maps/api/staticmap?center=San+Francisco,CA&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7CSan+Francisco,CA&key=AIzaSyBQZKTit2Ice6EG17HQoXfPwBp8QwZx5WE" 
                    alt="Office Location Map"
                    className="w-full h-auto"
                  />
                </div>
              </div>
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

// Contact Info Component
function ContactInfo({ 
  icon, 
  title, 
  content, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  link: string;
}) {
  return (
    <div className="flex items-start">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <a href={link} className="text-gray-600 hover:text-primary transition-colors">
          {content}
        </a>
      </div>
    </div>
  );
}
