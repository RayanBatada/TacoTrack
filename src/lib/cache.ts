// Data Cache Layer - Stores fetched data to avoid refetching on page transitions
// Automatically invalidates after 5 minutes (300000ms)

import {
  getRecipes as fetchRecipes,
  getIngredients as fetchIngredients,
  getWasteEntries as fetchWasteEntries,
  type Recipe,
  type Ingredient,
  type WasteEntry,
} from "./data";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface ForecastResult {
  date: string;
  predicted_quantity: number;
  confidence: 'high' | 'medium' | 'low';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface Cache {
  recipes: CacheEntry<Recipe[]> | null;
  ingredients: CacheEntry<Ingredient[]> | null;
  wasteEntries: CacheEntry<WasteEntry[]> | null;
  forecasts: Map<string, CacheEntry<ForecastResult[]>>;
}

// Module-level cache that persists across page navigations
const dataCache: Cache = {
  recipes: null,
  ingredients: null,
  wasteEntries: null,
  forecasts: new Map(),
};

const isCacheValid = (entry: CacheEntry<any> | null): boolean => {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
};

/**
 * Get recipes with caching
 * Returns cached data if available and fresh, otherwise fetches from API
 */
export const getRecipes = async (): Promise<Recipe[]> => {
  if (isCacheValid(dataCache.recipes)) {
    console.log("📦 Using cached recipes");
    return dataCache.recipes!.data;
  }

  console.log("📡 Fetching fresh recipes from API");
  const recipes = await fetchRecipes();
  dataCache.recipes = {
    data: recipes,
    timestamp: Date.now(),
  };
  return recipes;
};

/**
 * Get ingredients with caching
 * Returns cached data if available and fresh, otherwise fetches from API
 */
export const getIngredients = async (): Promise<Ingredient[]> => {
  if (isCacheValid(dataCache.ingredients)) {
    console.log("📦 Using cached ingredients");
    return dataCache.ingredients!.data;
  }

  console.log("📡 Fetching fresh ingredients from API");
  const ingredients = await fetchIngredients();
  dataCache.ingredients = {
    data: ingredients,
    timestamp: Date.now(),
  };
  return ingredients;
};

/**
 * Get waste entries with caching
 * Returns cached data if available and fresh, otherwise fetches from API
 */
export const getWasteEntries = async (): Promise<WasteEntry[]> => {
  if (isCacheValid(dataCache.wasteEntries)) {
    console.log("📦 Using cached waste entries");
    return dataCache.wasteEntries!.data;
  }

  console.log("📡 Fetching fresh waste entries from API");
  const wasteEntries = await fetchWasteEntries();
  dataCache.wasteEntries = {
    data: wasteEntries,
    timestamp: Date.now(),
  };
  return wasteEntries;
};

/**
 * Get or fetch forecast with caching
 * Returns cached forecast if available and fresh, otherwise fetches from API
 */
export const getForecast = async (
  recipeId: string,
  days: number = 7
): Promise<ForecastResult[]> => {
  const cacheKey = `${recipeId}:${days}`;

  // Check if forecast is cached and valid
  const cached = dataCache.forecasts.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log(`📦 Using cached forecast for ${recipeId}`);
    return cached.data;
  }

  console.log(`📡 Fetching fresh forecast for ${recipeId}`);
  try {
    // Add 15 second timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("/api/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, forecastDays: days }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.success && data.forecast) {
      dataCache.forecasts.set(cacheKey, {
        data: data.forecast,
        timestamp: Date.now(),
      });
      return data.forecast;
    }

    return [];
  } catch (err) {
    console.error("Error fetching forecast:", err);
    return [];
  }
};

/**
 * Invalidate all cache entries
 * Useful for manual refresh or after data mutations
 */
export const invalidateCache = (): void => {
  dataCache.recipes = null;
  dataCache.ingredients = null;
  dataCache.wasteEntries = null;
  dataCache.forecasts.clear();
  console.log("🔄 Cache invalidated");
};

/**
 * Get cache status for debugging
 */
export const getCacheStatus = () => {
  return {
    recipes: dataCache.recipes ? "cached" : "empty",
    ingredients: dataCache.ingredients ? "cached" : "empty",
    wasteEntries: dataCache.wasteEntries ? "cached" : "empty",
    ttl: CACHE_TTL / 1000 + " seconds",
  };
};
