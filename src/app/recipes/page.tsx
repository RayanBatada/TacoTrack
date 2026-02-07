"use client";

import { useState, useEffect } from "react";
import { getRecipes, type Recipe } from "@/lib/data";
import { UtensilsCrossed, Search, Plus } from "lucide-react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "alphabetical" | "quick">(
    "popular",
  );

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Error loading recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRecipes();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    );
  }

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "popular") {
      const aTotal = a.dailySales.reduce((sum, val) => sum + val, 0);
      const bTotal = b.dailySales.reduce((sum, val) => sum + val, 0);
      return bTotal - aTotal;
    } else if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else {
      return a.sellPrice - b.sellPrice;
    }
  });

  const totalSales = recipes.reduce(
    (sum, r) => sum + r.dailySales.reduce((s, v) => s + v, 0),
    0,
  );
  const avgSalesPerRecipe =
    recipes.length > 0 ? Math.round(totalSales / recipes.length) : 0;
  const categories = [...new Set(recipes.map((r) => r.category))];
  const mostPopular = [...recipes].sort(
    (a, b) =>
      b.dailySales.reduce((s, v) => s + v, 0) -
      a.dailySales.reduce((s, v) => s + v, 0),
  )[0];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Recipes</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {recipes.length} recipes in your collection
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Add Recipe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Most Popular
            </div>
          </div>
          <p className="text-xl font-bold text-primary">
            {mostPopular?.name || "N/A"}
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Sales/Recipe
            </div>
          </div>
          <p className="text-xl font-bold text-success">
            {avgSalesPerRecipe}/week
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </div>
          </div>
          <p className="text-xl font-bold text-warning">{categories.length}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSortBy("popular")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortBy === "popular"
              ? "bg-primary text-white"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setSortBy("alphabetical")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortBy === "alphabetical"
              ? "bg-primary text-white"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          A–Z
        </button>
        <button
          onClick={() => setSortBy("quick")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortBy === "quick"
              ? "bg-primary text-white"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Quick
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecipes.map((recipe) => {
          const weeklySales = recipe.dailySales.reduce(
            (sum, val) => sum + val,
            0,
          );
          return (
            <div
              key={recipe.id}
              className="glass-card p-5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {recipe.category}
                  </p>
                </div>
                <span className="text-lg font-bold text-success">
                  ${recipe.sellPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div>
                  <p className="text-xs text-muted-foreground">Weekly Sales</p>
                  <p className="text-sm font-semibold text-primary">
                    {weeklySales} sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ingredients</p>
                  <p className="text-sm font-semibold text-foreground">
                    {recipe.ingredients.length}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No recipes found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
