// lib/useForecast.ts
import { useState } from 'react';
import { getForecast as getCachedForecast } from './cache';

interface ForecastResult {
  date: string;
  predicted_quantity: number;
  confidence: 'high' | 'medium' | 'low';
}

export function useForecast() {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateForecast = async (recipeId: string, days: number = 7) => {
    setLoading(true);
    setError(null);

    try {
      // Use cached forecast if available, otherwise fetch fresh
      const result = await getCachedForecast(recipeId, days);
      setForecast(result);
    } catch (err: any) {
      console.error("Forecast error:", err);
      setError(err.message);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  return { forecast, loading, error, generateForecast };
}