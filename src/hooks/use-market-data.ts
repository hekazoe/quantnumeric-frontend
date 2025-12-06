import { useEffect, useState } from "react";
import type { MarketIndex, AssetQuote, FearGreedIndex } from "@/types/market";
import { API_ENDPOINTS } from "@/lib/api-config";

type MarketSummaryResponse = {
  indices: MarketIndex[];
  crypto: AssetQuote[];
  stocks: AssetQuote[];
  fearGreed: FearGreedIndex | null;
};

type AssetRanking = {
  rank: number;
  name: string;
  symbol: string;
  marketCap: number;
  price: string;
  change24h: string;
  type: 'stock' | 'crypto' | 'commodity';
  logoUrl: string;
};

const POLL_MS = 3000; // 3 seconds - satisfy Crypto refresh rate (Stocks cached by backend)
const RANKINGS_POLL_MS = 60000; // 1 minute (rankings update hourly on backend)

export function useMarketData() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<AssetQuote[]>([]);
  const [stockAssets, setStockAssets] = useState<AssetQuote[]>([]);
  const [fearGreed, setFearGreed] = useState<FearGreedIndex | null>(null);
  const [rankings, setRankings] = useState<AssetRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      // Only set loading to true on first fetch (when we have no data)
      if (indices.length === 0 && cryptoAssets.length === 0 && stockAssets.length === 0) {
        setLoading(true);
      }

      // Add cache-busting query parameter to prevent browser caching
      const url = `${API_ENDPOINTS.marketData}?t=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store', // Prevent browser caching
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: MarketSummaryResponse = await res.json();

      // Directly use the arrays returned by the backend
      // Backend returns AssetQuote[] for indices, but MarketIndex is compatible (just without id)
      setIndices((data.indices ?? []) as MarketIndex[]);
      setCryptoAssets(data.crypto ?? []);
      setStockAssets(data.stocks ?? []);
      setFearGreed(data.fearGreed ?? null);

      // Debug logging
      console.log('📊 Market data received:', {
        indices: data.indices?.length || 0,
        crypto: data.crypto?.length || 0,
        stocks: data.stocks?.length || 0,
        cryptoData: data.crypto,
      });

      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch market data";
      setError(message);
      console.error("Market data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      const url = `${API_ENDPOINTS.rankings}?t=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!res.ok) {
        throw new Error(`Rankings API error! status: ${res.status}`);
      }
      const data: AssetRanking[] = await res.json();
      setRankings(data);
      console.log('🏆 Rankings received:', data.length, 'assets');
    } catch (err) {
      console.error("Rankings fetch error:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const loop = async () => {
      if (cancelled) return;
      await fetchMarketData();
      if (cancelled) return;
      timer = window.setTimeout(loop, POLL_MS);
    };

    loop();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  // Separate useEffect for rankings polling
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const loop = async () => {
      if (cancelled) return;
      await fetchRankings();
      if (cancelled) return;
      timer = window.setTimeout(loop, RANKINGS_POLL_MS);
    };

    loop();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return {
    indices,
    cryptoAssets,
    stockAssets,
    fearGreed,
    rankings,
    loading,
    error,
    refetch: fetchMarketData,
    refetchRankings: fetchRankings,
  };
}
