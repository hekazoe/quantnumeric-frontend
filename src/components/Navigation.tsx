import { useState, useEffect } from "react";
import qnLogo from "@/assets/qn-logo.png";
import { Button } from "@/components/ui/button";
import { ComingSoonModal } from "@/components/ui/coming-soon-modal";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Clickable */}
          <button 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity -ml-2 md:ml-0"
          >
            <img src={qnLogo} alt="QuantNumeric Logo" className="w-7 h-7 md:w-10 md:h-10" />
            <span className={`text-base md:text-xl font-bold tracking-tight ${!isScrolled ? 'text-foreground drop-shadow-sm' : ''}`}>
              QuantNumeric
            </span>
          </button>

          {/* Navigation Links - Centered (Desktop) */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <button 
              onClick={() => scrollToSection('hero')} 
              className={`hover:text-primary transition-colors font-bold text-xl ${!isScrolled ? 'text-foreground drop-shadow-sm' : 'text-foreground'}`}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('markets')} 
              className={`hover:text-primary transition-colors font-bold text-xl ${!isScrolled ? 'text-foreground drop-shadow-sm' : 'text-foreground'}`}
            >
              Markets
            </button>
            <button 
              onClick={() => scrollToSection('news')} 
              className={`hover:text-primary transition-colors font-bold text-xl ${!isScrolled ? 'text-foreground drop-shadow-sm' : 'text-foreground'}`}
            >
              News
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className={`hover:text-primary transition-colors font-bold text-xl ${!isScrolled ? 'text-foreground drop-shadow-sm' : 'text-foreground'}`}
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className={`hover:text-primary transition-colors font-bold text-xl ${!isScrolled ? 'text-foreground drop-shadow-sm' : 'text-foreground'}`}
            >
              Contact
            </button>
          </div>

          {/* Right Side - Matrix Button (Desktop) + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Matrix Button - Desktop Only */}
            <Button 
              onClick={() => setShowComingSoon(true)}
              className="hidden md:block bg-[#d21212] text-white hover:bg-[#b01010] px-8 text-lg"
            >
              Matrix
            </Button>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 hover:bg-accent rounded-md transition-colors">
                  <Menu className={`w-6 h-6 ${!isScrolled ? 'drop-shadow-sm' : ''}`} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] flex flex-col">
                <div className="flex-1 flex flex-col">
                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-6 mt-8">
                    <SheetClose asChild>
                      <button 
                        onClick={() => scrollToSection('hero')}
                        className="text-left text-xl font-bold hover:text-primary transition-colors"
                      >
                        Home
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button 
                        onClick={() => scrollToSection('markets')}
                        className="text-left text-xl font-bold hover:text-primary transition-colors"
                      >
                        Markets
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button 
                        onClick={() => scrollToSection('news')}
                        className="text-left text-xl font-bold hover:text-primary transition-colors"
                      >
                        News
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button 
                        onClick={() => scrollToSection('about')}
                        className="text-left text-xl font-bold hover:text-primary transition-colors"
                      >
                        About
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button 
                        onClick={() => scrollToSection('contact')}
                        className="text-left text-xl font-bold hover:text-primary transition-colors"
                      >
                        Contact
                      </button>
                    </SheetClose>
                    
                    {/* Matrix Button in Mobile Menu */}
                    <SheetClose asChild>
                      <Button 
                        onClick={() => setShowComingSoon(true)}
                        className="bg-[#d21212] text-white hover:bg-[#b01010] w-full text-lg mt-4"
                      >
                        Matrix
                      </Button>
                    </SheetClose>
                  </nav>
                </div>
                
                {/* Copyright at bottom */}
                <div className="mt-auto pt-6 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    © {new Date().getFullYear()} QuantNumeric. All rights reserved.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <ComingSoonModal open={showComingSoon} onOpenChange={setShowComingSoon} />
    </nav>
  );
};

export default Navigation;
