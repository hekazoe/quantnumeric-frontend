// src/types/market.ts

// Indices from the backend (same shape as other quotes, using `price`)
export type MarketIndex = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changeText: string;
  lastUpdated: string;
};

// Generic quote type for crypto + stocks
export type AssetQuote = {
  id: string;               // used only for React keys on the frontend
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  changeText: string;
  lastUpdated: string;
  logoUrl?: string;
};

export type NewsItem = {
  id: string;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
  url: string;
};

// Shape of the fear/greed block in /api/market/summary
export type FearGreedIndex = {
  crypto: { value: number; label: string };
  stock: { value: number; label: string };
};
