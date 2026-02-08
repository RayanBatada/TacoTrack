"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Sparkles,
  ChevronRight,
  ChefHat,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import {
  getIngredients,
  getRecipes,
  daysOfStock,
  urgencyLevel,
  daysUntilExpiry,
  dishesWeCanMake,
  type Ingredient,
  type Recipe,
} from "@/lib/data";

type ViewMode = "ingredients" | "dishes";
type SortMode = "urgency" | "expiry" | "quantity";
type SortOrder = "asc" | "desc";

type DishWithMake = Recipe & { canMake: number; limitingIngredient: string };

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("ingredients");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("urgency");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState<DishWithMake | null>(null);
  const [showDishModal, setShowDishModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ing, rec] = await Promise.all([getIngredients(), getRecipes()]);
        setIngredients(ing);
        setRecipes(rec);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading inventory...</p>
      </div>
    );
  }

  const handleSortClick = (sortMode: SortMode) => {
    if (sort === sortMode) {
      // Toggle order if clicking the same sort
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort and default to ascending
      setSort(sortMode);
      setSortOrder("asc");
    }
  };

  const items = ingredients
    .map((i) => ({
      ...i,
      days: daysOfStock(i),
      urgency: urgencyLevel(i),
      expDays: daysUntilExpiry(i),
    }))
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sort === "urgency") comparison = a.days - b.days;
      else if (sort === "expiry") comparison = a.expDays - b.expDays;
      else if (sort === "quantity") comparison = a.onHand - b.onHand;

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const dishes = dishesWeCanMake(recipes, ingredients)
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sort === "urgency") comparison = b.canMake - a.canMake;
      else if (sort === "expiry") comparison = 0;
      else if (sort === "quantity") comparison = a.canMake - b.canMake;
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: "urgency", label: "Urgency" },
    { value: "expiry", label: "Expiration" },
    { value: "quantity", label: "Quantity" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Inventory</h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {ingredients.length} items tracked
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-5 flex gap-2 rounded-xl bg-secondary p-1">
        <button
          onClick={() => setViewMode("ingredients")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            viewMode === "ingredients"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Ingredients
        </button>
        <button
          onClick={() => setViewMode("dishes")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            viewMode === "dishes"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ChefHat className="h-4 w-4" />
          Dishes
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${viewMode}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.06] bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Sort Pills */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          SORT BY
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {sortOptions.map((option) => {
            const isActive = sort === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSortClick(option.value)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {option.label}
                {isActive && (
                  <>
                    {sortOrder === "asc" ? (
                      <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory list */}
      {viewMode === "ingredients" ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <Link
              key={item.id || `item-${i}`}
              href={`/inventory/${item.id}`}
              className="glass-card flex items-center gap-3 rounded-xl p-3.5 transition-all active:scale-[0.98] hover:bg-secondary/50"
              style={{
                opacity: 0,
                animation: `float-up 0.3s ease-out ${i * 0.04}s forwards`,
              }}
            >
              {/* Urgency indicator */}
              <div
                className={`h-10 w-1 rounded-full ${
                  item.urgency === "critical"
                    ? "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                    : item.urgency === "warning"
                      ? "bg-warning shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                      : "bg-success"
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {item.onHand} {item.unit}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.storageLocation}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-bold ${
                    item.urgency === "critical"
                      ? "text-destructive"
                      : item.urgency === "warning"
                        ? "text-warning"
                        : "text-success"
                  }`}
                >
                  {item.days}d
                </span>
                <p className="text-[10px] text-muted-foreground">left</p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {dishes.map((dish, i) => (
            <button
              key={dish.id || `dish-${i}`}
              onClick={() => {
                setSelectedDish(dish);
                setShowDishModal(true);
              }}
              className="glass-card flex w-full items-center gap-3 rounded-xl p-3.5 transition-all active:scale-[0.98] hover:bg-secondary/50 text-left"
              style={{
                opacity: 0,
                animation: `float-up 0.3s ease-out ${i * 0.04}s forwards`,
              }}
            >
              <div
                className="flex h-10 w-1 rounded-full"
                style={{
                  backgroundColor:
                    dish.canMake > 5
                      ? "#22c55e"
                      : dish.canMake > 2
                        ? "#eab308"
                        : "#ef4444",
                  boxShadow:
                    dish.canMake > 5
                      ? "0 0 6px rgba(34, 197, 94, 0.4)"
                      : dish.canMake > 2
                        ? "0 0 6px rgba(234, 179, 8, 0.3)"
                        : "0 0 6px rgba(239, 68, 68, 0.4)",
                }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{dish.name}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Limited by: {dish.limitingIngredient}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-foreground">
                  {dish.canMake}
                </span>
                <p className="text-[10px] text-muted-foreground">can make</p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
          {dishes.length === 0 && (
            <div className="py-12 text-center">
              <ChefHat className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No dishes match your search
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dish Modal */}
      {showDishModal && selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-xl">
            {/* Close button */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedDish.name || "Unknown Dish"}</h2>
                <p className="mt-1 text-sm text-muted-foreground uppercase tracking-wider">
                  {selectedDish.category || "Uncategorized"}
                </p>
              </div>
              <button
                onClick={() => setShowDishModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key metrics */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="mt-1 font-bold text-success">
                  ${(selectedDish.sellPrice || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Can Make</p>
                <p className="mt-1 font-bold text-primary">
                  {selectedDish.canMake}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Yield</p>
                <p className="mt-1 font-bold">
                  {Math.round((selectedDish.yieldPercent || 100))}%
                </p>
              </div>
            </div>

            {/* Limiting ingredient */}
            <div className="mb-5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
              <p className="text-xs font-medium text-yellow-600">
                Limited by: <span className="font-bold">{selectedDish.limitingIngredient || "Unknown"}</span>
              </p>
            </div>

            {/* Ingredients list */}
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
                Ingredients ({(selectedDish.ingredients || []).length})
              </h3>
              <div className="space-y-2">
                {(selectedDish.ingredients || []).map((recipeIng) => {
                  const ing = ingredients.find((i) => i.id === recipeIng.ingredientId);
                  return (
                    <div
                      key={recipeIng.ingredientId}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {ing?.name || "Unknown Ingredient"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ing?.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {recipeIng.qty} {ing?.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          On hand: {ing?.onHand}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 && viewMode === "ingredients" && (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No ingredients match your search
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
