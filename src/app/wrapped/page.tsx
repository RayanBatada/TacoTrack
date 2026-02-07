"use client";

import {
  getRecipes,
  getIngredients,
  getWasteEntries,
  type Recipe,
  type Ingredient,
  type WasteEntry,
} from "@/lib/data-db";
import { useState, useEffect } from "react";
import { ArrowRight, Download, Share2, ChevronDown } from "lucide-react";

interface WrappedStats {
  totalDishesServed: number;
  topDish: Recipe;
  topDishSales: number;
  totalRevenue: number;
  totalWaste: number;
  bestDay: string;
  bestDayRevenue: number;
  mostUsedIngredient: Ingredient;
  trendingUp: Recipe[];
  topThreeDishes: Array<Recipe & { sales: number }>;
  wasteReduction: number;
  avgFoodCost: number;
}

function calculateStats(
  recipes: Recipe[],
  ingredients: Ingredient[],
  wasteEntries: WasteEntry[],
): WrappedStats {
  const totalDishesServed = recipes.reduce((sum, recipe) => sum + (recipe.dailySales || []).reduce((a, b) => a + b, 0), 0);

  // Calculate top dish
  const dishSalesMap = recipes.map((recipe) => ({
    recipe,
    totalSales: recipe.dailySales.reduce((a, b) => a + b, 0),
  }));

  const topDishData = dishSalesMap.reduce((max, curr) =>
    curr.totalSales > max.totalSales ? curr : max,
  );

  // Top 3 dishes
  const topThreeDishes = dishSalesMap
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 3)
    .map((d) => ({ ...d.recipe, sales: d.totalSales }));

  const totalRevenue = topThreeDishes.reduce((sum, dish) => sum + dish.sales * dish.sellPrice, 0);
  const totalWaste = wasteEntries.reduce((sum, w) => sum + (w.costLost || 0), 0);

  // Best day (sum of all sales by day index)
  const salesByDay = Array(14)
    .fill(0)
    .map((_, dayIndex) =>
      recipes.reduce((sum, recipe) => sum + recipe.dailySales[dayIndex], 0),
    );
  const bestDayIndex = salesByDay.indexOf(Math.max(...salesByDay));
  const bestDayRevenue = salesByDay[bestDayIndex];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const bestDay = daysOfWeek[bestDayIndex % 7];

  const ingredientUsageMap: { [key: string]: number } = {};
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ri) => {
      ingredientUsageMap[ri.ingredientId] =
        (ingredientUsageMap[ri.ingredientId] || 0) +
        recipe.dailySales.reduce((a, b) => a + b, 0);
    });
  });

  const mostUsedId = Object.entries(ingredientUsageMap).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
  const mostUsedIngredient =
    ingredients.find((i) => i.id === mostUsedId) || ingredients[0];

  // Trending up (recipes with rising sales)
  // Trending up (recipes with rising sales)
  const trendingUp = recipes
    .filter((r) => {
      const firstWeekAvg =
        r.dailySales.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
      const secondWeekAvg =
        r.dailySales.slice(7).reduce((a, b) => a + b, 0) / 7;
      return secondWeekAvg > firstWeekAvg * 1.15;
    })
    .sort((a, b) => {
      const aFirstWeek = a.dailySales.slice(0, 7).reduce((a, c) => a + c, 0);
      const aSecondWeek = a.dailySales.slice(7).reduce((a, c) => a + c, 0);
      const bFirstWeek = b.dailySales.slice(0, 7).reduce((a, c) => a + c, 0);
      const bSecondWeek = b.dailySales.slice(7).reduce((a, c) => a + c, 0);

      const aGrowth = aFirstWeek > 0 ? aSecondWeek / aFirstWeek : 0;
      const bGrowth = bFirstWeek > 0 ? bSecondWeek / bFirstWeek : 0;

      return bGrowth - aGrowth;
    })
    .slice(0, 3);

  // Waste reduction potential
  const wasteReduction = Math.round((totalWaste / (totalRevenue || 1)) * 100);

  // Average food cost
  const avgFoodCost = Math.round(
    topThreeDishes.reduce((sum, dish) => {
      const foodCost = dish.ingredients.reduce((s, ri) => {
        const ing = ingredients.find((i) => i.id === ri.ingredientId);
        return s + (ing ? ri.qty * ing.costPerUnit : 0);
      }, 0);
      return sum + (foodCost / dish.sellPrice) * 100;
    }, 0) / topThreeDishes.length,
  );

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

export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [recipesData, ingredientsData, wasteData] = await Promise.all([
          getRecipes(),
          getIngredients(),
          getWasteEntries(),
        ]);
        setStats(calculateStats(recipesData, ingredientsData, wasteData));
      } catch (error) {
        console.error("Error loading wrapped stats:", error);
      }
    };

    loadStats();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(8, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black flex items-center justify-center">
        <p className="text-white text-xl">Loading your Wrapped...</p>
      </div>
    );
  }

  const Slide = ({ slide }: { slide: number }) => {
    switch (slide) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-4 text-lg">You served</p>
            <h2 className="text-8xl font-black mb-4 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              {stats.totalDishesServed.toLocaleString()}
            </h2>
            <p className="text-2xl text-gray-200">magical dishes</p>
            <p className="text-sm text-gray-400 mt-6">
              That's a lot of happy customers! 🎉
            </p>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-6 text-lg">Your most popular dish</p>
            <div className="mb-6 text-7xl">🌮</div>
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
              {stats.topDish.name}
            </h2>
            <p className="text-3xl text-orange-200 font-bold">
              {stats.topDishSales} sold
            </p>
            <p className="text-sm text-gray-400 mt-6">
              $
              {(stats.topDishSales * stats.topDish.sellPrice).toLocaleString(
                "en-US",
                { maximumFractionDigits: 0 },
              )}{" "}
              in revenue
            </p>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-4 text-lg">Total revenue</p>
            <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
              $
              {stats.totalRevenue.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </h2>
            <p className="text-gray-300 mt-6 text-lg">
              💰 That's some serious taco business
            </p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-6 text-lg">Your best day was</p>
            <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
              {stats.bestDay}
            </h2>
            <p className="text-3xl text-yellow-200 font-bold">
              {stats.bestDayRevenue} dishes
            </p>
            <p className="text-sm text-gray-400 mt-6">
              📈 People love Tacos on {stats.bestDay}s
            </p>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-8 text-lg">Your top 3 bestsellers</p>
            <div className="space-y-4 w-full">
              {stats.topThreeDishes.map((dish, idx) => (
                <div
                  key={dish.id}
                  className="bg-black/50 rounded-xl p-4 border border-indigo-500/30 flex flex-col items-center text-center"
                >
                  <div className="text-3xl font-black text-indigo-300 mb-2">
                    {idx + 1}
                  </div>
                  <p className="font-bold text-lg text-indigo-200">
                    {dish.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {dish.sales} sold • $
                    {(dish.sales * dish.sellPrice).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-8 text-lg">On the rise 📈</p>
            <div className="space-y-4 w-full">
              {stats.trendingUp.length > 0 ? (
                stats.trendingUp.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-black/50 rounded-xl p-4 border border-pink-500/30 text-center"
                  >
                    <p className="font-bold text-lg text-pink-200">
                      {dish.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Growing in popularity
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">
                  Keep experimenting with new items!
                </p>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-6 text-lg">
              Most essential ingredient
            </p>
            <div className="mb-6 text-6xl">🥩</div>
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-lime-300 to-green-300 bg-clip-text text-transparent">
              {stats.mostUsedIngredient.name}
            </h2>
            <p className="text-gray-300 text-sm">
              Powers your kitchen magic ✨
            </p>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <p className="text-gray-300 mb-4 text-lg">Waste this month</p>
            <h2 className="text-6xl font-black mb-4 bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">
              $
              {stats.totalWaste.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </h2>
            <p className="text-gray-300 text-sm">
              Opportunity to reduce by {stats.wasteReduction}%
            </p>
          </div>
        );
      case 8:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-6">
            <div className="mb-8 text-6xl">🎉</div>
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Great job!
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              You're crushing it in the restaurant game.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-bold text-white flex items-center gap-2 transition-all">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-bold text-white flex items-center gap-2 transition-all">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getBgColor = () => {
    const colors = [
      "bg-gradient-to-br from-cyan-900 via-black to-blue-950",
      "bg-gradient-to-br from-orange-900 via-black to-red-950",
      "bg-gradient-to-br from-emerald-900 via-black to-green-950",
      "bg-gradient-to-br from-yellow-900 via-black to-amber-950",
      "bg-gradient-to-br from-indigo-900 via-black to-purple-950",
      "bg-gradient-to-br from-pink-900 via-black to-rose-950",
      "bg-gradient-to-br from-lime-900 via-black to-green-950",
      "bg-gradient-to-br from-red-900 via-black to-orange-950",
      "bg-gradient-to-br from-purple-900 via-black to-pink-950",
    ];
    return colors[currentSlide];
  };

  return (
    <div className="fixed inset-0 left-56 bg-black overflow-hidden">
      {/* Current slide */}
      <div
        className={`w-full h-screen ${getBgColor()} transition-all duration-500 flex`}
      >
        <Slide slide={currentSlide} />
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-[calc(50%_+_7rem)] transform -translate-x-1/2 z-50 flex items-center gap-4">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-semibold text-white transition-all disabled:opacity-50"
          disabled={currentSlide === 0}
        >
          ← Back
        </button>
        <div className="flex gap-2">
          {Array.from({ length: 9 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/30 w-2 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentSlide(Math.min(8, currentSlide + 1))}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-50"
          disabled={currentSlide === 8}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Slide counter */}
      <div className="fixed top-8 right-8 z-50 text-white/60 font-semibold">
        {currentSlide + 1} / 9
      </div>

      {/* Keyboard navigation hint */}
      <div className="fixed top-8 left-[calc(50%_+_7rem)] transform -translate-x-1/2 z-50 text-white/40 text-sm">
        Use buttons or arrow keys to navigate
      </div>
    </div>
  );
}
