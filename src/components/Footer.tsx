import { motion } from "framer-motion";
import qnLogo from "@/assets/qn-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api-config";
import { checkHoneypot, checkRateLimit, validateEmail } from "@/lib/form-utils";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (!checkHoneypot(honeypot)) {
      return; // Silent fail for bots
    }

    // Rate limiting
    const rateCheck = checkRateLimit('newsletter');
    if (!rateCheck.allowed) {
      toast.error(`Please wait ${rateCheck.waitTime} seconds before submitting again.`);
      return;
    }

    // Validation
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { subscribeNewsletter } = await import("@/lib/backend-client");
      const response = await subscribeNewsletter({ email, honeypot });

      if (response.success) {
        toast.success(response.message || "Thanks for subscribing to QuantNumeric updates.");
        setEmail("");
      } else {
        toast.error(response.error || "Failed to subscribe. Please try again later.");
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again later.");
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="text-white border-t-2 border-[#8d0000]">
      {/* Main Footer Content */}
      <div className="bg-gradient-to-r from-[#ea4b4b] to-[#ad0000] w-full py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-start">
            {/* Company Info - Left */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <img src={qnLogo} alt="QuantNumeric Logo" className="w-10 h-10" />
                <span className="text-xl font-bold">QuantNumeric</span>
              </div>
              <div className="text-white/90 text-sm space-y-2">
                <p className="font-bold">Disclaimer</p>
                <p className="text-white/70">
                  QuantNumeric provides market data and analytics for informational purposes only and does not constitute financial, investment, or trading advice. All content is © QuantNumeric. All rights reserved.
                </p>
              </div>
            </div>

          {/* Services */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("markets")}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Live Price Action
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("news")}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Real Time News
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("markets")}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Live Market Sentiment
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("markets")}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Our Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-white/70 text-sm mb-4">
              Stay updated with our latest market insights, dashboards, and tools.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 relative">
              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 pointer-events-none"
                aria-hidden="true"
              />
              
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                disabled={isSubmitting}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-sm"
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#ea4b4b] to-[#d21212] hover:from-[#d21212] hover:to-[#c90404] text-white font-medium whitespace-nowrap disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar - Separate Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="w-full bg-[#0e121a] py-6"
      >
        <div className="container mx-auto px-6">
          <div className="border-t border-white/20 pt-3 mx-8">
            <p className="text-center text-sm text-white/80">
              © {new Date().getFullYear()} QuantNumeric. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
