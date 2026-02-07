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
  dailySales: number[]; // For backward compatibility with charts
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
  dailyUsage: number[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
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
  // Fetch recipes
  const { data: recipesData, error: recError } = await supabase
    .from('recipes')
    .select('*')
    .eq('active', true);

  if (recError) {
    console.error('Error fetching recipes:', recError);
    return [];
  }

  // Fetch recipe ingredients
  const { data: ingredientsData } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, ingredient_id, quantity');

  // For each recipe, calculate daily sales from sales_events
  const recipesWithSales = await Promise.all(
    (recipesData || []).map(async (recipe) => {
      const dailySales = await calculateDailySalesForRecipe(recipe.id);
      const ingredients = (ingredientsData || [])
        .filter(ri => ri.recipe_id === recipe.id)
        .map(ri => ({ ingredientId: ri.ingredient_id, qty: ri.quantity }));

      return {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        yieldPercent: recipe.yield_percent,
        sellPrice: recipe.sell_price,
        active: recipe.active,
        ingredients,
        dailySales, // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
      };
    })
  );

  return recipesWithSales;
}

// Calculate daily sales for a recipe from sales_events
async function calculateDailySalesForRecipe(recipeId: string): Promise<number[]> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: salesData, error } = await supabase
    .from('sales_events')
    .select('quantity, day_of_week, sale_timestamp')
    .eq('recipe_id', recipeId)
    .gte('sale_timestamp', ninetyDaysAgo.toISOString());

  if (error) {
    console.error(`Error fetching sales for recipe ${recipeId}:`, error);
  }

  // Group by actual DATE first
  const salesByDate: Record<string, number> = {};
  
  (salesData || []).forEach(sale => {
    const dateKey = sale.sale_timestamp.split('T')[0];
    salesByDate[dateKey] = (salesByDate[dateKey] || 0) + sale.quantity;
  });

  // Group daily totals by day of week
  const dailyTotalsByDow: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  Object.entries(salesByDate).forEach(([dateStr, total]) => {
    const date = new Date(dateStr);
    const dow = date.getDay();
    dailyTotalsByDow[dow].push(total);
  });

  // Return average daily total for each day of week
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

  // Calculate daily usage for each ingredient
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
        expiryDate: getExpiryDate(ing), // Calculated based on category
        dailyUsage, // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
      };
    })
  );

  return ingredientsWithUsage;
}

// Calculate daily usage for an ingredient from sales_events
async function calculateDailyUsageForIngredient(ingredientId: string): Promise<number[]> {
  // Get recipes that use this ingredient
  const { data: recipeLinks } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, quantity')
    .eq('ingredient_id', ingredientId);

  if (!recipeLinks || recipeLinks.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  // Get sales for these recipes (last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const { data: salesData } = await supabase
    .from('sales_events')
    .select('recipe_id, quantity, day_of_week, sale_timestamp')
    .in('recipe_id', recipeLinks.map(r => r.recipe_id))
    .gte('sale_timestamp', fourWeeksAgo.toISOString());

  // Group by actual DATE first, then by day of week
  const usageByDate: Record<string, number> = {};
  
  (salesData || []).forEach(sale => {
    const recipeLink = recipeLinks.find(r => r.recipe_id === sale.recipe_id);
    if (recipeLink) {
      const dateKey = sale.sale_timestamp.split('T')[0]; // YYYY-MM-DD
      const ingredientUsed = sale.quantity * recipeLink.quantity;
      usageByDate[dateKey] = (usageByDate[dateKey] || 0) + ingredientUsed;
    }
  });

  // Now group daily totals by day of week and average
  const dailyTotalsByDow: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  Object.entries(usageByDate).forEach(([dateStr, total]) => {
    const date = new Date(dateStr);
    const dow = date.getDay();
    dailyTotalsByDow[dow].push(total);
  });

  // Return average daily total for each day of week
  return [0, 1, 2, 3, 4, 5, 6].map(day => {
    const dailyTotals = dailyTotalsByDow[day];
    if (dailyTotals.length === 0) return 0;
    const sum = dailyTotals.reduce((a, b) => a + b, 0);
    return sum / dailyTotals.length; // Average of daily totals
  });
}

// Helper: Get expiry date (estimate based on category)
function getExpiryDate(ing: any): string {
  const today = new Date();
  const daysToAdd = ing.category === 'produce' ? 7 : 
                    ing.category === 'protein' ? 5 :
                    ing.category === 'dairy' ? 14 : 30;
  
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0];
}

// =============================================================================
// FETCH ORDERS
// =============================================================================
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []).map(o => ({
    id: o.id,
    vendor: o.vendor,
    items: o.items || [],
    status: o.status,
    deliveryDate: o.delivery_date,
    totalCost: o.total_cost || 0,
  }));
}

// =============================================================================
// FETCH WASTE ENTRIES
// =============================================================================
export async function getWasteEntries(): Promise<WasteEntry[]> {
  const { data, error } = await supabase
    .from('waste_entries')
    .select('*')
    .order('date', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching waste:', error);
    return [];
  }

  return (data || []).map(w => ({
    id: w.id,
    ingredientId: w.ingredient_id,
    qty: w.qty,
    reason: w.reason,
    date: w.date,
    costLost: w.cost_lost || 0,
  }));
}