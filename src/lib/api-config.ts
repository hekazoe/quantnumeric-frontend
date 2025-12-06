// API base URL - configure via environment variable
// Defaults to localhost:3000 for local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API endpoints
export const API_ENDPOINTS = {
  marketData: `${API_BASE_URL}/api/market/summary`,
  rankings: `${API_BASE_URL}/api/market/rankings`,
  contact: `${API_BASE_URL}/contact`,
  newsletter: `${API_BASE_URL}/newsletter/subscribe`,
  news: `${API_BASE_URL}/news`,
} as const;

