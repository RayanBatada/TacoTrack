// lib/data-db.ts
import { supabase } from './supabase';

// =============================================================================
// TYPES
// =============================================================================
export type Recipe = {
  id: string;
  name: string;
  category: string;
  yieldPercent: number;
  sellPrice: number;
  active: boolean;
  ingredients: { ingredientId: string; qty: number }[];
  dailySales: number[];
};

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  onHand: number;
  parLevel: number;
  reorderPoint: number;
  costPerUnit: number;
  vendor: string;
  storageLocation: string | null;
  leadTimeDays: number;
  expiryDate: string;
  dailyUsage: number[];
};

export type Order = {
  id: string;
  vendor: string;
  items: any[];
  status: string;
  deliveryDate: string | null;
  totalCost: number;
};

export type WasteEntry = {
  id: string;
  ingredientId: string;
  qty: number;
  reason: string;
  date: string;
  costLost: number;
};

export type Alert = {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
  ingredientId?: string;
};

// =============================================================================
// FETCH RECIPES WITH DAILY SALES FROM sales_events
// =============================================================================
export async function getRecipes(): Promise<Recipe[]> {
  const { data: recipesData, error: recError } = await supabase
    .from('recipes')
    .select('*')
    .eq('active', true);

  if (recError) {
    console.error('Error fetching recipes:', recError);
    return [];
  }

  const recipesWithSales = await Promise.all(
    (recipesData || []).map(async (recipe) => {
      const dailySales = await calculateDailySalesForRecipe(recipe.id);

      return {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        yieldPercent: recipe.yield_percent,
        sellPrice: recipe.sell_price,
        active: recipe.active,
        ingredients: recipe.ingredients || [],
        dailySales,
      };
    })
  );

  return recipesWithSales;
}

export async function calculateDailySalesForRecipe(recipeId: string): Promise<number[]> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: salesData, error } = await supabase
    .from('sales_events')
    .select('quantity, sold_at')
    .eq('recipe_id', recipeId)
    .gte('sold_at', ninetyDaysAgo.toISOString());

  if (error) {
    console.error(`Error fetching sales for recipe ${recipeId}:`, error);
  }

  const salesByDate: Record<string, number> = {};

  (salesData || []).forEach(sale => {
    const dateKey = sale.sold_at.split('T')[0];
    salesByDate[dateKey] = (salesByDate[dateKey] || 0) + sale.quantity;
  });

  const dailyTotalsByDow: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  Object.entries(salesByDate).forEach(([dateStr, total]) => {
    const date = new Date(dateStr);
    const dow = date.getDay();
    dailyTotalsByDow[dow].push(total);
  });

  return [0, 1, 2, 3, 4, 5, 6].map(day => {
    const dailyTotals = dailyTotalsByDow[day];
    if (dailyTotals.length === 0) return 0;
    const sum = dailyTotals.reduce((a, b) => a + b, 0);
    return Math.round(sum / dailyTotals.length);
  });
}

// =============================================================================
// FETCH INGREDIENTS WITH DAILY USAGE FROM sales_events
// =============================================================================
export async function getIngredients(): Promise<Ingredient[]> {
  const { data: ingredientsData, error } = await supabase
    .from('ingredients')
    .select('*');

  if (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }

  const ingredientsWithUsage = await Promise.all(
    (ingredientsData || []).map(async (ing) => {
      const dailyUsage = await calculateDailyUsageForIngredient(ing.id);

      return {
        id: ing.id,
        name: ing.name,
        category: ing.category,
        unit: ing.unit,
        onHand: ing.on_hand,
        parLevel: ing.par_level,
        reorderPoint: ing.reorder_point,
        costPerUnit: ing.cost_per_unit,
        vendor: ing.vendor,
        storageLocation: ing.storage_location,
        leadTimeDays: ing.lead_time_days,
        expiryDate: getExpiryDate(ing),
        dailyUsage,
      };
    })
  );

  return ingredientsWithUsage;
}

async function calculateDailyUsageForIngredient(ingredientId: string): Promise<number[]> {
  const { data: allRecipes } = await supabase
    .from('recipes')
    .select('id, ingredients')
    .eq('active', true);

  if (!allRecipes || allRecipes.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  const recipesWithIngredient = allRecipes
    .filter(r => {
      const ingredients = r.ingredients || [];
      return ingredients.some((ing: any) => ing.ingredientId === ingredientId);
    })
    .map(r => {
      const ingredient = (r.ingredients || []).find((ing: any) => ing.ingredientId === ingredientId);
      return {
        recipe_id: r.id,
        quantity: ingredient?.qty || 0
      };
    });

  if (recipesWithIngredient.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0]