import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";

const AboutSection = () => {
  return (
    <section id="about" className="relative py-20 overflow-hidden bg-[#f0f0f1]">
      <div className="w-full absolute inset-0 h-full">
        <SparklesCore
          id="aboutsectionsparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#ad0000"
        />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-8 text-foreground">About QuantNumeric</h2>
          
          <div className="mb-12 text-center">
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-4xl mx-auto">
              QuantNumeric is a comprehensive financial intelligence platform that aggregates quantitative market data
              across multiple asset classes including cryptocurrencies, stock indices, commodities, and more.
              By combining real-time pricing data, sentiment indicators, and high-impact economic news, QuantNumeric
              enables traders, investors, and analysts to make informed decisions based on comprehensive market signals
              and access deeper metrics for advanced analytics and historical data visualization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white border-2 border-border">
              <div className="w-12 h-12 bg-[#ad0000]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-[#ad0000]" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Unified Cross-Asset Data View</h3>
              <p className="text-sm text-muted-foreground">
                Monitor crypto, stocks, commodities, and forex markets in one place
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white border-2 border-border">
              <div className="w-12 h-12 bg-[#ad0000]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-[#ad0000]" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Real-Time Sentiment Indicators</h3>
              <p className="text-sm text-muted-foreground">
                Track market psychology with Fear & Greed indices for crypto and stocks
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white border-2 border-border">
              <div className="w-12 h-12 bg-[#ad0000]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-[#ad0000]" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">Macro Event Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Stay informed with high-impact economic calendar events and news
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
