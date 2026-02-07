// Re-export types and functions from data-db
export type { Ingredient, Recipe, Order, WasteEntry, Alert } from "@/lib/data-db";
export { getRecipes, getIngredients, getOrders, getWasteEntries } from "@/lib/data-db";

// Export empty arrays for backward compatibility
// Components should fetch actual data in useEffect
export const ingredients: any[] = [];
export const recipes: any[] = [];
export const orders: any[] = [];
export const wasteEntries: any[] = [];

// ==========================================
// Helper Functions (work with passed-in data)
// ==========================================

export function avgDailyUsage(usage: number[]): number {
  if (!usage.length) return 0;
  const weights = usage.map((_, i) => 1 + i * 0.15);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return usage.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
}

export function daysOfStock(ingredient: any): number {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  if (avg <= 0) return 999;
  return Math.round((ingredient.onHand / avg) * 10) / 10;
}

export function stockoutDate(ingredient: any): string {
  const days = daysOfStock(ingredient);
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(days));
  return date.toISOString().split("T")[0];
}

export function suggestedOrderQty(ingredient: any): number {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  const safetyDays = 2;
  const orderCoverDays = 7;
  const needed = avg * (orderCoverDays + safetyDays + ingredient.leadTimeDays);
  const toOrder = Math.max(0, Math.ceil(needed - ingredient.onHand));
  return toOrder;
}

export function urgencyLevel(ingredient: any): "critical" | "warning" | "good" {
  const days = daysOfStock(ingredient);
  if (days <= 1.5) return "critical";
  if (days <= 3) return "warning";
  return "good";
}

export function daysUntilExpiry(ingredient: any): number {
  const now = new Date();
  const exp = new Date(ingredient.expiryDate);
  return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function foodCostPercent(recipe: any, ingredients: any[]): number {
  const cost = recipe.ingredients.reduce((sum: number, ri: any) => {
    const ing = ingredients.find((i) => i.id === ri.ingredientId);
    if (!ing) return sum;
    return sum + ri.qty * ing.costPerUnit;
  }, 0);
  return Math.round((cost / recipe.sellPrice) * 100);
}

export function totalWasteToday(wasteEntries: any[]): number {
  const today = new Date().toISOString().split("T")[0];
  return wasteEntries
    .filter((w) => w.date === today)
    .reduce((sum, w) => sum + w.costLost, 0);
}

export function generateAlerts(ingredients: any[]): any[] {
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

export function generateSuggestedOrders(ingredients: any[]): any[] {
  const vendorGroups: Record<string, any[]> = {};

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
export function burndownData(ingredient: any): { day: string; stock: number }[] {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  const days = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  let stock = ingredient.onHand;
  return days.map((day) => {
    const point = { day, stock: Math.max(0, Math.round(stock * 10) / 10) };
    stock -= avg;
    return point;
  });
}

export function weeklyUsageData(ingredient: any): { day: string; usage: number }[] {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return ingredient.dailyUsage.slice(-7).map((usage: number, i: number) => ({
    day: dayNames[i],
    usage,
  }));
}

export function salesTrendData(recipes: any[]): { day: string; sales: number; revenue: number; lastWeek: number }[] {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon2", "Tue2", "Wed2", "Thu2", "Fri2", "Sat2", "Sun2"];
  return dayLabels.map((label, i) => ({
    day: label.replace("2", ""),
    sales: recipes.reduce((sum, r) => sum + (r.dailySales[i] || 0), 0),
    revenue: recipes.reduce((sum, r) => sum + (r.dailySales[i] || 0) * r.sellPrice, 0),
    lastWeek:
      i < 7
        ? recipes.reduce((sum, r) => sum + (r.dailySales[i] || 0), 0)
        : recipes.reduce((sum, r) => sum + (r.dailySales[i - 7] || 0), 0),
  }));
}

export function wasteByCategory(wasteEntries: any[], ingredients: any[]): { category: string; cost: number }[] {
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

export function topSellingItems(recipes: any[], ingredients: any[]): { name: string; avgSales: number; margin: number }[] {
  return recipes
    .map((r) => ({
      name: r.name,
      avgSales: Math.round(r.dailySales.reduce((a: number, b: number) => a + b, 0) / r.dailySales.length),
      margin: 100 - foodCostPercent(r, ingredients),
    }))
    .sort((a, b) => b.avgSales - a.avgSales);
}
