import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Phone, Linkedin } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api-config";
import { checkHoneypot, checkRateLimit, validateEmail, validateMessageLength } from "@/lib/form-utils";

const FooterContact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    website: "" // honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (!checkHoneypot(formData.website)) {
      return; // Silent fail for bots
    }

    // Rate limiting
    const rateCheck = checkRateLimit('contact-form');
    if (!rateCheck.allowed) {
      toast.error(`Please wait ${rateCheck.waitTime} seconds before submitting again.`);
      return;
    }

    // Validation
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!validateMessageLength(formData.message, 2000)) {
      toast.error("Message must be between 1 and 2000 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { submitContactForm } = await import("@/lib/backend-client");
      const response = await submitContactForm({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: formData.message,
        honeypot: formData.website,
      });

      if (response.success) {
        toast.success(response.message || "Thanks for your message! We will reply within 24 hours.");
        setFormData({ firstName: "", lastName: "", email: "", message: "", website: "" });
      } else {
        toast.error(response.error || "Failed to send message. Please try again later.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again later.");
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="py-20" style={{ backgroundColor: '#e5e5e7' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12"
          >
            {/* Get in Touch - Left Side (No Card) */}
            <div className="text-white space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#c11111]">Get in Touch</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d41819' }}>
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-[#111111]">Email</h3>
                      <a href="mailto:hekazodenver@gmail.com" className="text-[#111111] hover:text-[#ad0000] transition-colors">
                        hekazodenver@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d41819' }}>
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-[#111111]">Phone</h3>
                      <a 
                        href="https://wa.me/62816332333" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#111111] hover:text-[#ad0000] transition-colors"
                      >
                        +62-816-332-333
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d41819' }}>
                      <Linkedin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-[#111111]">LinkedIn</h3>
                      <a 
                        href="https://www.linkedin.com/in/lanadio" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#111111] hover:text-[#ad0000] transition-colors"
                      >
                        www.linkedin.com/in/lanadio
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Want to Partner Card */}
              <Card className="bg-gradient-to-br from-[#ea4b4b] to-[#d21212] border-none p-6 text-white">
                <h3 className="text-2xl font-bold mb-3">Want to Partner?</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Reach out to discuss collaboration opportunities and how we can work together to deliver exceptional market intelligence solutions.
                </p>
              </Card>
            </div>

            {/* Send us a message - Right Side (In Card) */}
            <Card className="p-8 bg-gradient-to-br from-[#ea4b4b] to-[#d21212] border-none">
              <h3 className="text-2xl font-bold mb-2 text-white">Send us a message</h3>
              <p className="text-white/90 mb-6 text-sm">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute opacity-0 pointer-events-none"
                  aria-hidden="true"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-white">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      maxLength={100}
                      disabled={isSubmitting}
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-white">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      maxLength={100}
                      disabled={isSubmitting}
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    maxLength={255}
                    disabled={isSubmitting}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-white">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    maxLength={2000}
                    disabled={isSubmitting}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-white text-[#d21212] hover:bg-white/90 font-medium py-6 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default FooterContact;
