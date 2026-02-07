"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Sparkles,
  ChevronRight,
  ScanBarcode,
  ChefHat,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  getIngredients,
  daysOfStock,
  urgencyLevel,
  daysUntilExpiry,
  type Ingredient,
} from "@/lib/data";

type ViewMode = "ingredients" | "dishes";
type SortMode = "urgency" | "expiry" | "quantity";
type SortOrder = "asc" | "desc";

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("ingredients");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("urgency");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ing = await getIngredients();
        setIngredients(ing);
      } catch (error) {
        console.error("Error loading ingredients:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-6"><p>Loading inventory...</p></div>;
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
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-secondary transition-colors hover:bg-secondary/80">
          <ScanBarcode className="h-5 w-5 text-primary" />
        </button>
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
              key={item.id}
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
                  <span className="text-muted-foreground">·</span>
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
        <div className="py-12 text-center">
          <ChefHat className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">
            Dishes view coming soon
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Track prepared dishes and their shelf life
          </p>
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
