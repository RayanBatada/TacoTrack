"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChefHat,
  Plus,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type Recipe = {
  id: string;
  name: string;
  description: string;
  prepTime: number; // minutes
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  popularity: number; // sales count
  imageUrl?: string;
};

// Mock data - replace with your actual data
const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Classic Margherita Pizza",
    description: "Fresh mozzarella, basil, and San Marzano tomatoes",
    prepTime: 25,
    servings: 4,
    difficulty: "easy",
    category: "pizza",
    popularity: 156,
  },
  {
    id: "2",
    name: "Truffle Mushroom Risotto",
    description: "Creamy arborio rice with wild mushrooms and truffle oil",
    prepTime: 45,
    servings: 2,
    difficulty: "hard",
    category: "pasta",
    popularity: 89,
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, croutons, house-made dressing",
    prepTime: 15,
    servings: 4,
    difficulty: "easy",
    category: "salad",
    popularity: 134,
  },
  {
    id: "4",
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter and seasonal vegetables",
    prepTime: 30,
    servings: 2,
    difficulty: "medium",
    category: "seafood",
    popularity: 98,
  },
];

type SortMode = "popularity" | "name" | "time";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("popularity");
  const [recipes] = useState<Recipe[]>(mockRecipes);

  const filteredRecipes = recipes
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "popularity") return b.popularity - a.popularity;
      if (sort === "time") return a.prepTime - b.prepTime;
      return a.name.localeCompare(b.name);
    });

  const difficultyColors = {
    easy: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    hard: "text-destructive bg-destructive/10",
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Recipes</h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {recipes.length} recipes in your collection
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Add Recipe
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs">Most Popular</span>
          </div>
          <p className="text-lg font-bold">
            {recipes.reduce(
              (max, r) => (r.popularity > max ? r.popularity : max),
              0,
            )}{" "}
            orders
          </p>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Avg Time</span>
          </div>
          <p className="text-lg font-bold">
            {Math.round(
              recipes.reduce((sum, r) => sum + r.prepTime, 0) / recipes.length,
            )}{" "}
            min
          </p>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs">Categories</span>
          </div>
          <p className="text-lg font-bold">
            {new Set(recipes.map((r) => r.category)).size}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.06] bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Sort tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-0.5">
        {(
          [
            { value: "popularity", label: "Popular" },
            { value: "name", label: "A–Z" },
            { value: "time", label: "Quick" },
          ] as { value: SortMode; label: string }[]
        ).map((s) => (
          <button
            key={s.value}
            onClick={() => setSort(s.value)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
              sort === s.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Recipes list */}
      <div className="space-y-2">
        {filteredRecipes.map((recipe, i) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="glass-card flex items-center gap-3 rounded-xl p-3.5 transition-all active:scale-[0.98] hover:bg-secondary/50"
            style={{
              opacity: 0,
              animation: `float-up 0.3s ease-out ${i * 0.04}s forwards`,
            }}
          >
            {/* Recipe icon/image placeholder */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{recipe.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {recipe.description}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTime}m
                </div>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {recipe.servings}
                </div>
                <span className="text-muted-foreground">·</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    difficultyColors[recipe.difficulty]
                  }`}
                >
                  {recipe.difficulty}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <TrendingUp className="h-3 w-3" />
                {recipe.popularity}
              </div>
              <p className="text-[10px] text-muted-foreground">orders</p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No recipes match your search
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
