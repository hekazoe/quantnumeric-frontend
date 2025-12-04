import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TrustedSourcesStrip from "@/components/TrustedSourcesStrip";
import MarketsSection from "@/components/MarketsSection";
import NewsSection from "@/components/NewsSection";
import AboutSection from "@/components/AboutSection";
import FooterContact from "@/components/FooterContact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <TrustedSourcesStrip />
      <NewsSection />
      <MarketsSection />
      <AboutSection />
      <FooterContact />
      <Footer />
    </main>
  );
};

export default Index;
