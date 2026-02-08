// Re-export types and functions from data-db
export type { Ingredient, Recipe, Order, WasteEntry, Alert } from "@/lib/data-db";
export { getRecipes, getIngredients, getOrders, getWasteEntries } from "@/lib/data-db";

import type { Ingredient, Recipe } from "@/lib/data-db";

// Export empty arrays for backward compatibility
export const ingredients: Ingredient[] = [];
export const recipes: Recipe[] = [];

// ==========================================
// Helper Functions (work with passed-in data)
// ==========================================

export function avgDailyUsage(usage: number[]): number {
  if (!usage.length) return 0;
  const weights = usage.map((_, i) => 1 + i * 0.15);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return usage.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
}

export function daysOfStock(ingredient: Ingredient): number {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  if (avg <= 0) return 999;
  return Math.round((ingredient.onHand / avg) * 10) / 10;
}

export function stockoutDate(ingredient: Ingredient): string {
  const days = daysOfStock(ingredient);
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(days));
  return date.toISOString().split("T")[0];
}

export function suggestedOrderQty(ingredient: Ingredient): number {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  const safetyDays = 2;
  const orderCoverDays = 7;
  const needed = avg * (orderCoverDays + safetyDays + ingredient.leadTimeDays);
  const toOrder = Math.max(0, Math.ceil(needed - ingredient.onHand));
  return toOrder;
}

export function urgencyLevel(ingredient: Ingredient): "critical" | "warning" | "good" {
  const days = daysOfStock(ingredient);
  if (days <= 1.5) return "critical";
  if (days <= 3) return "warning";
  return "good";
}

export function daysUntilExpiry(ingredient: Ingredient): number {
  const now = new Date();
  const exp = new Date(ingredient.expiryDate);
  return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function foodCostPercent(recipe: Recipe, ingredients: Ingredient[]): number {
  const cost = recipe.ingredients.reduce((sum: number, ri: { ingredientId: string; qty: number }) => {
    const ing = ingredients.find((i) => i.id === ri.ingredientId);
    if (!ing) return sum;
    return sum + ri.qty * ing.costPerUnit;
  }, 0);
  return Math.round((cost / recipe.sellPrice) * 100);
}

export function topSellingItems(recipes: Recipe[], ingredients: Ingredient[]): { name: string; avgSales: number; margin: number }[] {
  return recipes
    .map((r) => ({
      name: r.name,
      avgSales: Math.round(r.dailySales.reduce((a: number, b: number) => a + b, 0) / r.dailySales.length),
      margin: 100 - foodCostPercent(r, ingredients),
    }))
    .sort((a, b) => b.avgSales - a.avgSales);
}

// Chart helpers
export function salesTrendData(recipes: Recipe[]): { day: string; sales: number; revenue: number; lastWeek: number }[] {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const remappedDailySales = recipes.map(r => {
    const original = r.dailySales;
    return [
      original[1] || 0, // Mon
      original[2] || 0, // Tue
      original[3] || 0, // Wed
      original[4] || 0, // Thu
      original[5] || 0, // Fri
      original[6] || 0, // Sat
      original[0] || 0, // Sun
    ];
  });

  return dayLabels.flatMap((label, dayOfWeek) => {
    return [0, 1].map(() => {
      return {
        day: label,
        sales: remappedDailySales.reduce((sum, weekData) => sum + weekData[dayOfWeek], 0),
        revenue: remappedDailySales.reduce(
          (sum, weekData, recipeIdx) => sum + weekData[dayOfWeek] * recipes[recipeIdx].sellPrice,
          0
        ),
        lastWeek: remappedDailySales.reduce((sum, weekData) => sum + weekData[dayOfWeek], 0),
      };
    });
  });
}

export function wasteByCategory(wasteEntries: any[], ingredients: Ingredient[]): { category: string; cost: number }[] {
  const cats: Record<string, number> = {};
  for (const w of wasteEntries) {
    const ing = ingredients.find((i) => i.id === w.ingredientId);
    const cat = ing?.category || "other";
    cats[cat] = (cats[cat] || 0) + w.costLost;
  }
  return Object.entries(cats).map(([category, cost]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    cost: Math.round(cost * 100) / 100,
  }));
}

export function totalWasteToday(wasteEntries: any[]): number {
  const today = new Date().toISOString().split("T")[0];
  return wasteEntries
    .filter((w) => w.date === today)
    .reduce((sum, w) => sum + w.costLost, 0);
}