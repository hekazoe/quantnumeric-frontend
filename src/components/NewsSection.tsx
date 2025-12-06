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
      source: "Bloomberg",
      title: "Fed Signals Potential Rate Cuts in Early 2026 Amid Inflation Progress",
      summary: "Federal Reserve hints at monetary easing after three years of elevated rates. Markets rally on dovish December 2025 FOMC minutes.",
      publishedAt: new Date(2025, 11, 5, 10, 30).toISOString(), // Dec 5, 2025 - 4 hours ago
      url: "https://www.bloomberg.com/markets"
    },
    {
      id: "2",
      source: "CNBC",
      title: "AI Chip Demand Drives NVIDIA to $5 Trillion Market Cap Milestone",
      summary: "NVIDIA becomes second company after Apple to surpass $5T valuation. Next-gen AI accelerators fuel unprecedented growth in Q4 2025.",
      publishedAt: new Date(2025, 11, 4, 14, 15).toISOString(), // Dec 4, 2025 - 1 day ago
      url: "https://www.cnbc.com/technology/"
    },
    {
      id: "3",
      source: "Financial Times",
      title: "Bitcoin Approaches $150K as Institutional Adoption Accelerates",
      summary: "BTC hits all-time high following major sovereign wealth fund allocations. Analysts predict $200K target for 2026.",
      publishedAt: new Date(2025, 11, 3, 9, 45).toISOString(), // Dec 3, 2025 - 2 days ago
      url: "https://www.ft.com/cryptocurrencies"
    },
    {
      id: "4",
      source: "Investing.com",
      title: "2026 Economic Outlook: Global Growth Expected at 3.2%",
      summary: "IMF projects stronger global recovery as inflation normalizes. Emerging markets poised for outperformance in coming year.",
      publishedAt: new Date(2025, 11, 2, 16, 20).toISOString(), // Dec 2, 2025 - 3 days ago
      url: "https://www.investing.com/news/economy"
    },
    {
      id: "5",
      source: "MarketWatch",
      title: "Green Energy Stocks Soar on Record 2026 Government Subsidies",
      summary: "Renewable sector rallies 32% in Q4 2025 as new climate legislation promises $500B in clean energy investments.",
      publishedAt: new Date(2025, 11, 1, 11, 10).toISOString(), // Dec 1, 2025 - 4 days ago
      url: "https://www.marketwatch.com/investing"
    },
    {
      id: "6",
      source: "CNN Business",
      title: "US-China Trade Relations Thaw: Tariff Reductions Announced for 2026",
      summary: "Bilateral agreement signals improved economic cooperation. Tech and manufacturing sectors expected to benefit significantly.",
      publishedAt: new Date(2025, 10, 30, 8, 30).toISOString(), // Nov 30, 2025 - 5 days ago
      url: "https://www.cnn.com/business"
    },
    {
      id: "7",
      source: "Reuters",
      title: "Quantum Computing Breakthrough: Commercial Applications Expected in Q2 2026",
      summary: "Major tech firms announce quantum supremacy milestones. Financial modeling and cryptography sectors prepare for paradigm shift.",
      publishedAt: new Date(2025, 10, 29, 13, 45).toISOString(), // Nov 29, 2025 - 6 days ago
      url: "https://www.reuters.com/technology/"
    },
    {
      id: "8",
      source: "Bloomberg",
      title: "2026 IPO Pipeline Reaches $200B as Market Sentiment Improves",
      summary: "Strong Q4 2025 performance encourages tech unicorns to go public. Analysts predict busiest IPO year since 2021.",
      publishedAt: new Date(2025, 10, 28, 10, 20).toISOString(), // Nov 28, 2025 - 7 days ago
      url: "https://www.bloomberg.com/markets"
    }
  ];

  const getRelativeTime = (isoString: string) => {
    const hours = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60));

    // Convert to days if hours >= 24
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  };

  // Sort news by most recent first
  const sortedNewsItems = [...newsItems].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const totalPages = Math.ceil(sortedNewsItems.length / itemsPerPage);
  const currentNews = sortedNewsItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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
          className="mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-foreground">Market News & Events</h2>
          <p className="text-sm md:text-base text-muted-foreground">Recently Published</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6"
        >
          {currentNews.map((news) => (
            <Card key={news.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow bg-white border-2 border-border h-full flex flex-col">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <span className="text-xs font-bold text-[#c90404] bg-[#c90404]/10 px-3 py-1 rounded-full">
                    {news.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(news.publishedAt)}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-1 text-foreground" title={news.title}>{news.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 flex-grow line-clamp-2" title={news.summary}>{news.summary}</p>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-end md:self-start mt-auto"
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
          className="relative mt-6"
        >
          <p className="text-sm text-muted-foreground text-center">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="absolute right-6 top-0 flex gap-2">
            <Button variant="outline" size="icon" onClick={prevPage}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextPage}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
