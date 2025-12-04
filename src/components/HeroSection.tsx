import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { WavyBackground } from "@/components/ui/wavy-background";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative bg-[#f0f0f1]">
      <WavyBackground
        className="pt-20"
        containerClassName="h-screen"
        colors={["#cc0202", "#a6021d", "#eb6077", "#ff637d", "#332222", "#ff0000"]}
        backgroundFill="#f0f0f1"
        waveOpacity={0.5}
        speed="fast"
        blur={10}
      >
        <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="max-w-4xl mx-auto text-center flex flex-col gap-4 md:gap-8"
          >
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight order-1" style={{ color: '#090b0f' }}>
              Gathering Market Intelligence Across All Assets & Sectors
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center order-2">
              <Button
                size="lg"
                onClick={() => scrollToSection("markets")}
                className="gap-2 group bg-primary hover:bg-primary-dark w-full sm:w-auto max-w-[280px] mx-auto sm:max-w-none sm:mx-0"
              >
                View Markets
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                onClick={() => scrollToSection("about")}
                style={{ backgroundColor: '#090b0f', color: 'white' }}
                className="hover:opacity-90 hidden sm:block"
              >
                Learn More
              </Button>
            </div>

            <p className="text-base md:text-xl text-black dark:text-neutral-200 max-w-2xl mx-auto order-3 mt-4 md:mt-0">
              QuantNumeric aggregates quantitative data, sentiment indicators, economic news, and macro-economic events
              into one interface.
            </p>
          </motion.div>
        </div>
      </WavyBackground>
    </section>
  );
};

export default HeroSection;
