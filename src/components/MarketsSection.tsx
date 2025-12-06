import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useMarketData } from "@/hooks/use-market-data";
import { EntityAvatar } from "@/components/EntityAvatar";

// Helper function for sentiment labels
function getSentimentLabel(value: number) {
  if (value < 20) return "Extreme Fear";
  if (value < 45) return "Fear";
  if (value <= 70) return "Average";
  if (value <= 80) return "Greed";
  return "Extreme Greed";
}

// Helper function to calculate needle angle from value (0–100 => 180° (left, red) to 360° (right, green))
function getNeedleAngle(value: number): number {
  return 180 + (value / 100) * 180;
}

// Helper function to calculate needle endpoint
function getNeedleEndpoint(value: number, centerX: number, centerY: number, length: number) {
  const angle = getNeedleAngle(value);
  const radians = (angle * Math.PI) / 180;
  const x = centerX + length * Math.cos(radians);
  const y = centerY + length * Math.sin(radians);
  return { x, y };
}

const MarketsSection = () => {
  const { indices, cryptoAssets, stockAssets, rankings, fearGreed } = useMarketData();

  // Use live Fear & Greed data from API, or fallback to defaults if not available
  const fearGreedData = {
    crypto: {
      value: fearGreed?.crypto?.value ?? 50,
      label: fearGreed?.crypto?.label ?? "Neutral",
      updatedAt: new Date().toISOString(),
    },
    stock: {
      value: fearGreed?.stock?.value ?? 50,
      label: fearGreed?.stock?.label ?? "Neutral",
      updatedAt: new Date().toISOString(),
    },
  };

  const cryptoNeedle = getNeedleEndpoint(fearGreedData.crypto.value, 100, 100, 55);
  const stockNeedle = getNeedleEndpoint(fearGreedData.stock.value, 100, 100, 55);

  // Format market cap rankings for display
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(3)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    return `$${marketCap.toLocaleString()}`;
  };

  const marketCapRankings = rankings.map(r => ({
    rank: r.rank,
    name: r.name,
    symbol: r.symbol,
    marketCap: formatMarketCap(r.marketCap),
    price: r.price,
    bgColor: r.type === 'commodity' ? 'bg-yellow-50' : r.type === 'crypto' ? 'bg-pink-50' : 'bg-white',
    logoUrl: r.logoUrl,
  }));

  const getRelativeTime = (isoString: string, type: 'stock' | 'crypto') => {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);

    // If stock data is older than 10 minutes, show "US MARKET CLOSED" (Stocks only)
    if (type === 'stock' && minutes >= 10) {
      return "US MARKET CLOSED";
    }

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    return `${Math.floor(minutes / 60)} hours ago`;
  };

  // Check if US stock market is open (9:30 AM - 4:00 PM ET, Monday-Friday)
  const isUSMarketOpen = () => {
    const now = new Date();
    const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = etTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = etTime.getHours();
    const minutes = etTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    // Market is closed on weekends
    if (day === 0 || day === 6) return false;

    // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes) ET
    return timeInMinutes >= 570 && timeInMinutes < 960;
  };

  const marketStatus = isUSMarketOpen() ? "OPEN" : "CLOSED";
  const marketStatusColor = isUSMarketOpen() ? "text-success" : "text-muted-foreground";

  return (
    <section id="markets" className="py-12 md:py-20 bg-gradient-to-b from-light-gray to-background">
      <div className="container mx-auto px-6">
        {/* Market Overview Title with Underline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Market Overview</h2>
          <div className="w-78 h-1 bg-primary mx-auto rounded-full mb-2"></div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">US Market:</span>
            <span className={`text-sm font-semibold ${marketStatusColor}`}>
              {marketStatus}
            </span>
            {!isUSMarketOpen() && (
              <span className="text-xs text-muted-foreground">
                (Prices shown are from last close)
              </span>
            )}
          </div>
        </motion.div>

        {/* Fear & Greed Gauges with Middle Index Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 mb-8 md:mb-12 items-start"
        >
          {/* Crypto Fear & Greed Gauge */}
          <Card className="p-3 md:p-8 bg-card hover:shadow-lg transition-shadow order-1 lg:order-1">
            <h3 className="text-xs md:text-lg font-semibold text-center mb-3 md:mb-6">Crypto Market Fear & Greed Index</h3>
            <div className="relative w-full max-w-[250px] mx-auto mb-2 md:mb-4">
              <svg viewBox="0 0 200 120" className="w-full">
                <defs>
                  <linearGradient id="cryptoGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#cryptoGauge)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <line
                  x1="100"
                  y1="100"
                  x2={cryptoNeedle.x}
                  y2={cryptoNeedle.y}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-5xl font-bold">{fearGreedData.crypto.value}</p>
              <p className="text-xs md:text-lg text-destructive font-semibold">{fearGreedData.crypto.label}</p>
            </div>
          </Card>

          {/* Stock Fear & Greed Gauge */}
          <Card className="p-3 md:p-8 bg-card hover:shadow-lg transition-shadow order-2 lg:order-3">
            <h3 className="text-xs md:text-lg font-semibold text-center mb-3 md:mb-6">Stock Market Fear & Greed Index</h3>
            <div className="relative w-full max-w-[250px] mx-auto mb-2 md:mb-4">
              <svg viewBox="0 0 200 120" className="w-full">
                <defs>
                  <linearGradient id="stockGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#stockGauge)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <line
                  x1="100"
                  y1="100"
                  x2={stockNeedle.x}
                  y2={stockNeedle.y}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-5xl font-bold">{fearGreedData.stock.value}</p>
              <p className="text-xs md:text-lg text-destructive font-semibold">{fearGreedData.stock.label}</p>
            </div>
          </Card>

          {/* Middle Index Cards - stacked from hook data */}
          <div className="col-span-2 lg:col-span-1 space-y-3 md:space-y-4 order-3 lg:order-2">
            {indices.map((index) => (
              <Card
                key={index.symbol}
                className="p-3 md:p-4 bg-card hover:shadow-lg transition-shadow border-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-muted-foreground">
                      {index.name}
                    </h4>
                    <p className="text-lg md:text-2xl font-bold">
                      {index.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">24h change</p>
                    <div className={`flex items-center justify-end gap-1 ${(index.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(index.change24h ?? 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm md:text-base font-semibold">{index.changeText}</span>
                    </div>
                    <p className={`text-sm md:text-base font-semibold ${(index.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(index.change24h ?? 0) >= 0 ? '+' : '-'}${Math.abs(index.change24h ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Live Price Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-12"
        >
          {/* Crypto Live Prices */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-base md:text-xl font-semibold mb-3 md:mb-4">Crypto Live Prices</h3>

            {cryptoAssets.length === 0 ? (
              <Card className="p-4 bg-[#fff8f5] border-2 border-[#bdbdbd]">
                <p className="text-sm text-muted-foreground text-center">Loading crypto data...</p>
              </Card>
            ) : (
              cryptoAssets.filter(Boolean).map((asset) => (
                <Card key={asset.id} className="p-2 md:p-4 bg-[#fff8f5] hover:shadow-lg transition-shadow border-2 border-[#bdbdbd] min-h-[100px] md:min-h-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 h-full">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <EntityAvatar
                        name={asset.name}
                        symbol={asset.symbol}
                        logoUrl={asset.logoUrl}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-semibold truncate">{asset.symbol}</p>
                        <p className="text-sm md:text-2xl font-bold truncate">${(asset.price ?? 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right space-y-0.5 flex-shrink-0">
                      <p className={`text-xs md:text-sm font-medium ${(asset.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(asset.change24h ?? 0) >= 0 ? '+' : '-'}${Math.abs(asset.change24h ?? 0).toFixed(2)}
                      </p>
                      <div className={`flex items-center md:justify-end gap-1 ${(asset.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(asset.change24h ?? 0) >= 0 ? <TrendingUp className="w-3 md:w-4 h-3 md:h-4" /> : <TrendingDown className="w-3 md:w-4 h-3 md:h-4" />}
                        <span className="text-xs md:text-sm font-semibold">{asset.changeText}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{getRelativeTime(asset.lastUpdated, 'crypto')}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Stock Live Prices */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-base md:text-xl font-semibold mb-3 md:mb-4">Stock Live Prices</h3>

            {stockAssets.filter(Boolean).map((asset) => {
              // Override logo URLs for specific symbols (frontend-only)
              let logoUrl = asset.logoUrl;
              if (asset.symbol === 'AAPL') {
                logoUrl = '/assets/logos/apple-logo.png';
              } else if (asset.symbol === 'NVDA') {
                logoUrl = '/assets/logos/nvidia-logo.png';
              } else if (asset.symbol === 'MSFT') {
                logoUrl = '/assets/logos/microsoft-logo.png';
              }

              return (
                <Card key={asset.id} className="p-2 md:p-4 bg-[#fff8f5] hover:shadow-lg transition-shadow border-2 border-[#bdbdbd] min-h-[100px] md:min-h-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 h-full">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <EntityAvatar
                        name={asset.name}
                        symbol={asset.symbol}
                        logoUrl={logoUrl}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-semibold truncate">{asset.name}</p>
                        <p className="text-sm md:text-2xl font-bold truncate">${(asset.price ?? 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right space-y-0.5 flex-shrink-0">
                      <p className={`text-xs md:text-sm font-medium ${(asset.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(asset.change24h ?? 0) >= 0 ? '+' : '-'}${Math.abs(asset.change24h ?? 0).toFixed(2)}
                      </p>
                      <div className={`flex items-center md:justify-end gap-1 ${(asset.change24h ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(asset.change24h ?? 0) >= 0 ? <TrendingUp className="w-3 md:w-4 h-3 md:h-4" /> : <TrendingDown className="w-3 md:w-4 h-3 md:h-4" />}
                        <span className="text-xs md:text-sm font-semibold">{asset.changeText}</span>
                      </div>
                      <p className={`text-[10px] md:text-xs ${getRelativeTime(asset.lastUpdated, 'stock') === 'US MARKET CLOSED' ? 'font-bold text-muted-foreground' : 'text-muted-foreground'}`}>
                        {getRelativeTime(asset.lastUpdated, 'stock')}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Market Cap Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-1">Ranking Asset by Market Cap</h3>
          <p className="text-sm text-gray-500 font-semibold mb-4 md:mb-6">Updated Hourly</p>
          <div className="space-y-2">
            {marketCapRankings.map((item) => (
              <Card key={item.rank} className={`p-3 md:p-6 ${item.bgColor} hover:shadow-lg transition-shadow border-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-lg md:text-2xl font-bold text-muted-foreground">{item.rank}</span>
                    <EntityAvatar
                      name={item.name}
                      symbol={item.symbol}
                      logoUrl={item.logoUrl}
                      size="md"
                    />
                    <div>
                      <p className="text-sm md:text-xl font-bold">{item.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm md:text-2xl font-bold">{item.marketCap}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketsSection;
