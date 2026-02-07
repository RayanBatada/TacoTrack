import WrappedClient, { type WrappedStats } from "@/components/wrapped-client";
import { getRecipes, getIngredients, getWasteEntries, type Recipe, type Ingredient, type WasteEntry } from "@/lib/data-db";

function calculateStats(
  recipes: Recipe[],
  ingredients: Ingredient[],
  wasteEntries: WasteEntry[]
): WrappedStats {
  const totalDishesServed = recipes.reduce((sum, recipe) => sum + (recipe.dailySales || []).reduce((a, b) => a + b, 0), 0);

  const dishSalesMap = recipes.map((recipe) => ({ recipe, totalSales: (recipe.dailySales || []).reduce((a, b) => a + b, 0) }));
  const topDishData = dishSalesMap.reduce((max, curr) => (curr.totalSales > max.totalSales ? curr : max), dishSalesMap[0] || { recipe: recipes[0], totalSales: 0 });

  const topThreeDishes = dishSalesMap.slice().sort((a, b) => b.totalSales - a.totalSales).slice(0, 3).map((d) => ({ ...d.recipe, sales: d.totalSales }));

  const totalRevenue = topThreeDishes.reduce((sum, dish) => sum + dish.sales * dish.sellPrice, 0);
  const totalWaste = wasteEntries.reduce((sum, w) => sum + (w.costLost || 0), 0);

  const salesByDay = Array(14).fill(0).map((_, dayIndex) => recipes.reduce((sum, recipe) => sum + (recipe.dailySales?.[dayIndex] || 0), 0));
  const bestDayIndex = salesByDay.indexOf(Math.max(...salesByDay));
  const bestDayRevenue = salesByDay[bestDayIndex] || 0;
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const bestDay = daysOfWeek[bestDayIndex % 7] || "—";

  const ingredientUsageMap: { [key: string]: number } = {};
  recipes.forEach((recipe) => { (recipe.ingredients || []).forEach((ri) => { ingredientUsageMap[ri.ingredientId] = (ingredientUsageMap[ri.ingredientId] || 0) + (recipe.dailySales || []).reduce((a, b) => a + b, 0); }); });
  const mostUsedId = Object.entries(ingredientUsageMap).sort((a, b) => b[1] - a[1])[0]?.[0] || (ingredients[0]?.id ?? "");
  const mostUsedIngredient = ingredients.find((i) => i.id === mostUsedId) || ingredients[0] || ({ id: "", name: "—" } as Ingredient);

  const trendingUp = recipes.filter((r) => {
    const firstWeek = (r.dailySales || []).slice(0, 7);
    const secondWeek = (r.dailySales || []).slice(7, 14);
    const firstAvg = firstWeek.length ? firstWeek.reduce((a, b) => a + b, 0) / firstWeek.length : 0;
    const secondAvg = secondWeek.length ? secondWeek.reduce((a, b) => a + b, 0) / secondWeek.length : 0;
    return secondAvg > firstAvg * 1.15;
  }).slice(0, 3);

  const wasteReduction = Math.round((totalWaste / (totalRevenue || 1)) * 100);

  const avgFoodCost = Math.round((topThreeDishes.reduce((sum, dish) => {
    const foodCost = (dish.ingredients || []).reduce((s, ri) => {
      const ing = ingredients.find((i) => i.id === ri.ingredientId);
      return s + (ing ? ri.qty * ing.costPerUnit : 0);
    }, 0);
    return sum + (dish.sellPrice ? (foodCost / dish.sellPrice) * 100 : 0);
  }, 0) || 0) / Math.max(1, topThreeDishes.length));

  return {
    totalDishesServed,
    topDish: topDishData.recipe || (recipes[0] as Recipe),
    topDishSales: topDishData.totalSales || 0,
    totalRevenue,
    totalWaste,
    bestDay,
    bestDayRevenue,
    mostUsedIngredient,
    trendingUp,
    topThreeDishes,
    wasteReduction,
    avgFoodCost,
  };
}

export default async function Page() {
  const [recipesData, ingredientsData, wasteData] = await Promise.all([getRecipes(), getIngredients(), getWasteEntries()]);
  const stats = calculateStats(recipesData, ingredientsData, wasteData);
  return <WrappedClient initialStats={stats} />;
}
