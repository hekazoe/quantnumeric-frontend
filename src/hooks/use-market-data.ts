import { useEffect, useState } from "react";
import type { MarketIndex, AssetQuote, FearGreedIndex } from "@/types/market";
import { API_ENDPOINTS } from "@/lib/api-config";

type MarketSummaryResponse = {
  indices: MarketIndex[];
  crypto: AssetQuote[];
  stocks: AssetQuote[];
  fearGreed: FearGreedIndex | null;
};

const POLL_MS = 8000; // 8 seconds - refresh every 8 seconds

export function useMarketData() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<AssetQuote[]>([]);
  const [stockAssets, setStockAssets] = useState<AssetQuote[]>([]);
  const [fearGreed, setFearGreed] = useState<FearGreedIndex | null>(null);
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

  return {
    indices,
    cryptoAssets,
    stockAssets,
    fearGreed,
    loading,
    error,
    refetch: fetchMarketData,
  };
}
