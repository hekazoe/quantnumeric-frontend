import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { NewsItem } from "@/types/market";

const NewsSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Responsive items per page: 3 for mobile, 4 for desktop
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 768 ? 3 : 4);
    };
    
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Mock news data - structure ready for API integration
  const newsItems: NewsItem[] = [
    {
      id: "1",
      source: "CNBC",
      title: "Federal Reserve Signals Rate Cut in Q2 2025",
      summary: "Fed Chair Powell indicates potential monetary policy shift as inflation targets near achievement.",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: "https://www.cnbc.com/federal-reserve/"
    },
    {
      id: "2",
      source: "Bloomberg",
      title: "Tech Stocks Rally on Strong Earnings Reports",
      summary: "Major tech companies exceed earnings expectations, driving market sentiment higher.",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      url: "https://www.bloomberg.com/markets"
    },
    {
      id: "3",
      source: "Investing.com",
      title: "Bitcoin Breaks $100K Resistance Level",
      summary: "Cryptocurrency markets surge as institutional adoption accelerates globally.",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      url: "https://www.investing.com/crypto/"
    },
    {
      id: "4",
      source: "Financial Times",
      title: "Global Energy Markets See Volatility Spike",
      summary: "Oil prices fluctuate amid geopolitical tensions and supply concerns.",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      url: "https://www.ft.com/markets"
    },
    {
      id: "5",
      source: "MarketWatch",
      title: "Consumer Confidence Index Reaches 5-Year High",
      summary: "Economic optimism grows as unemployment remains at historic lows.",
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      url: "https://www.marketwatch.com/"
    },
    {
      id: "6",
      source: "CNN Business",
      title: "Manufacturing Data Shows Expansion Continues",
      summary: "PMI data indicates sustained growth in manufacturing sector across major economies.",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      url: "https://www.cnn.com/business"
    },
    {
      id: "7",
      source: "Reuters",
      title: "Gold Prices Surge on Safe-Haven Demand",
      summary: "Precious metals rally as investors seek stability amid market uncertainty.",
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      url: "https://www.reuters.com/markets/"
    },
    {
      id: "8",
      source: "CNBC",
      title: "Housing Market Shows Signs of Recovery",
      summary: "New home sales data suggests stabilization in real estate markets.",
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      url: "https://www.cnbc.com/real-estate/"
    }
  ];
  
  const getRelativeTime = (isoString: string) => {
    const hours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));
    return `${hours} hours ago`;
  };

  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const currentNews = newsItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section id="news" className="py-20" style={{ backgroundColor: '#f0f0f0' }}>
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div className="flex-1">
            <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-foreground">Market News & Events</h2>
            <p className="text-sm md:text-base text-muted-foreground">Recently Published</p>
          </div>
          <div className="flex gap-2 justify-end md:justify-start">
            <Button variant="outline" size="icon" onClick={prevPage}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextPage}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6"
        >
          {currentNews.map((news) => (
            <Card key={news.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow bg-white border-2 border-border">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <span className="text-xs font-bold text-[#c90404] bg-[#c90404]/10 px-3 py-1 rounded-full">
                    {news.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(news.publishedAt)}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 text-foreground">{news.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 flex-grow line-clamp-2">{news.summary}</p>
                <a 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="self-end md:self-start"
                >
                  <Button className="gap-1 bg-[#c90404] text-white hover:bg-[#c90404]/90 text-xs md:text-base px-3 py-1 md:px-4 md:py-2 h-auto md:h-10">
                    Read more
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
