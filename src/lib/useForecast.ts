// lib/useForecast.ts
import { useState } from 'react';

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
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, forecastDays: days })
      });

      const data = await response.json();

      if (data.success) {
        setForecast(data.forecast);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { forecast, loading, error, generateForecast };
}