// Re-export types and functions from data-db
export type { Ingredient, Recipe, Order, WasteEntry, Alert } from "@/lib/data-db";
export { getRecipes, getIngredients, getOrders, getWasteEntries } from "@/lib/data-db";

import type { Ingredient, Recipe, Order, WasteEntry, Alert } from "@/lib/data-db";

// Export empty arrays for backward compatibility
// Components should fetch actual data in useEffect
export const ingredients: Ingredient[] = [];
export const recipes: Recipe[] = [];
export const orders: Order[] = [];
export const wasteEntries: WasteEntry[] = [];

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

export function totalWasteToday(wasteEntries: WasteEntry[]): number {
  const today = new Date().toISOString().split("T")[0];
  return wasteEntries
    .filter((w) => w.date === today)
    .reduce((sum, w) => sum + w.costLost, 0);
}

export function generateAlerts(ingredients: Ingredient[]): Alert[] {
  const alerts: any[] = [];

  for (const ing of ingredients) {
    const days = daysOfStock(ing);
    if (days <= 1.5) {
      alerts.push({
        id: `low-${ing.id}`,
        type: "low-stock",
        severity: "critical",
        title: `${ing.name} critically low`,
        description: `Only ${ing.onHand} ${ing.unit} left — about ${days} days of stock`,
        action: `Order ${suggestedOrderQty(ing)} ${ing.unit} now`,
        ingredientId: ing.id,
      });
    } else if (days <= 3) {
      alerts.push({
        id: `low-${ing.id}`,
        type: "low-stock",
        severity: "warning",
        title: `${ing.name} running low`,
        description: `${ing.onHand} ${ing.unit} left — ~${days} days of stock`,
        action: `Order ${suggestedOrderQty(ing)} ${ing.unit} by tomorrow`,
        ingredientId: ing.id,
      });
    }

    const expDays = daysUntilExpiry(ing);
    if (expDays <= 2) {
      alerts.push({
        id: `exp-${ing.id}`,
        type: "expiring",
        severity: expDays <= 1 ? "critical" : "warning",
        title: `${ing.name} expiring ${expDays === 0 ? "today" : `in ${expDays} day${expDays > 1 ? "s" : ""}`}`,
        description: `${ing.onHand} ${ing.unit} at risk — use first or discount`,
        action: "Prioritize in today's prep",
        ingredientId: ing.id,
      });
    }
  }

  return alerts;
}

export function generateSuggestedOrders(ingredients: Ingredient[]): { id: string; vendor: string; items: { ingredientId: string; qty: number; unitCost: number }[]; status: "suggested"; deliveryDate: string; totalCost: number }[] {
  const vendorGroups: Record<string, { ingredientId: string; qty: number; unitCost: number }[]> = {};

  for (const ing of ingredients) {
    const qty = suggestedOrderQty(ing);
    if (qty <= 0) continue;
    if (!vendorGroups[ing.vendor]) vendorGroups[ing.vendor] = [];
    vendorGroups[ing.vendor].push({
      ingredientId: ing.id,
      qty,
      unitCost: ing.costPerUnit,
    });
  }

  return Object.entries(vendorGroups).map(([vendor, items], i) => ({
    id: `order-${i}`,
    vendor,
    items,
    status: "suggested" as const,
    deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    totalCost: items.reduce((s, item) => s + item.qty * item.unitCost, 0),
  }));
}

// Chart data helpers
export function burndownData(ingredient: Ingredient): { day: string; stock: number }[] {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  const days = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  let stock = ingredient.onHand;
  return days.map((day) => {
    const point = { day, stock: Math.max(0, Math.round(stock * 10) / 10) };
    stock -= avg;
    return point;
  });
}

export function weeklyUsageData(ingredient: Ingredient): { day: string; usage: number }[] {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return ingredient.dailyUsage.slice(-7).map((usage: number, i: number) => ({
    day: dayNames[i],
    usage,
  }));
}

export function salesTrendData(recipes: Recipe[]): { day: string; sales: number; revenue: number; lastWeek: number }[] {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // dailySales array is [Sun, Mon, Tue, Wed, Thu, Fri, Sat] (indices 0-6)
  // We need to remap to calendar order and duplicate for 2 weeks
  
  const remappedDailySales = recipes.map(r => {
    // Remap from [Sun, Mon, Tue, Wed, Thu, Fri, Sat] to [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
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

  // Generate 14 days (2 weeks) - assume same pattern repeats
  return dayLabels.flatMap((label, dayOfWeek) => {
    // Generate this day for last week and this week
    return [0, 1].map((weekOffset) => {
      return {
        day: label,
        sales: remappedDailySales.reduce((sum, weekData) => sum + weekData[dayOfWeek], 0),
        revenue: remappedDailySales.reduce(
          (sum, weekData, recipeIdx) => sum + weekData[dayOfWeek] * recipes[recipeIdx].sellPrice,
          0
        ),
        lastWeek: weekOffset === 0 
          ? remappedDailySales.reduce((sum, weekData) => sum + weekData[dayOfWeek], 0)
          : remappedDailySales.reduce((sum, weekData) => sum + weekData[dayOfWeek], 0),
      };
    });
  });
}

export function wasteByCategory(wasteEntries: WasteEntry[], ingredients: Ingredient[]): { category: string; cost: number }[] {
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

export function topSellingItems(recipes: Recipe[], ingredients: Ingredient[]): { name: string; avgSales: number; margin: number }[] {
  return recipes
    .map((r) => ({
      name: r.name,
      avgSales: Math.round(r.dailySales.reduce((a: number, b: number) => a + b, 0) / r.dailySales.length),
      margin: 100 - foodCostPercent(r, ingredients),
    }))
    .sort((a, b) => b.avgSales - a.avgSales);
}

export function dishesWeCanMake(recipes: Recipe[], ingredients: Ingredient[]): { recipeId: string; name: string; canMake: number; limitingIngredient: string }[] {
  return recipes.map((recipe) => {
    let minBatches = Infinity;
    let limitingIngredient = "";

    for (const ri of recipe.ingredients) {
      const ing = ingredients.find((i) => i.id === ri.ingredientId);
      if (!ing) continue;

      const batchesPossible = Math.floor(ing.onHand / ri.qty);
      if (batchesPossible < minBatches) {
        minBatches = batchesPossible;
        limitingIngredient = ing.name;
      }
    }

    return {
      recipeId: recipe.id,
      name: recipe.name,
      canMake: minBatches === Infinity ? 0 : minBatches,
      limitingIngredient,
    };
  });
}

export function formatForecastInsights(forecasts: any[]): string {
  if (!forecasts.length) return "No forecast data available yet.";
  
  const sorted = forecasts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const insights = sorted.map(f => `${f.dish_name}: ${f.predicted_quantity} units (${f.confidence})`).join(" | ");
  return insights;
}
