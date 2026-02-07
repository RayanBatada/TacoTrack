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
  Trash2,
} from "lucide-react";
import { Recipe, recipes as initialRecipes, ingredients } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type SortMode = "popularity" | "name" | "time";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("popularity");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [newRecipeDesc, setNewRecipeDesc] = useState("");
  const [newRecipePrep, setNewRecipePrep] = useState("");
  const [newRecipeServings, setNewRecipeServings] = useState("");
  const [newRecipeDifficulty, setNewRecipeDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [newRecipeCategory, setNewRecipeCategory] = useState("Specialties");
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<
    { id: string; qty: string }[]
  >([]);

  const filteredRecipes = recipes
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "popularity")
        return (b.popularity || 0) - (a.popularity || 0);
      if (sort === "time") return (a.prepTime || 0) - (b.prepTime || 0);
      return a.name.localeCompare(b.name);
    });

  const difficultyColors = {
    easy: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    hard: "text-destructive bg-destructive/10",
  };

  const handleAddIngredient = () => {
    setNewRecipeIngredients([...newRecipeIngredients, { id: "", qty: "" }]);
  };

  const updateIngredient = (
    index: number,
    field: "id" | "qty",
    value: string,
  ) => {
    const updated = [...newRecipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setNewRecipeIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setNewRecipeIngredients(newRecipeIngredients.filter((_, i) => i !== index));
  };

  const handleCreateRecipe = () => {
    if (!newRecipeName) return;

    const newRecipe: Recipe = {
      id: `new-${Date.now()}`,
      name: newRecipeName,
      description: newRecipeDesc || "A delicious new creation.",
      category: newRecipeCategory,
      prepTime: parseInt(newRecipePrep) || 15,
      servings: parseInt(newRecipeServings) || 2,
      difficulty: newRecipeDifficulty,
      popularity: 0,
      sellPrice: 0, // Would allow setting this too, but skipping for brevity
      yieldPercent: 100,
      dailySales: [], // No history yet
      ingredients: newRecipeIngredients
        .filter((i) => i.id && i.qty)
        .map((i) => ({
          ingredientId: i.id,
          qty: parseFloat(i.qty) || 0,
          unit: ingredients.find((ing) => ing.id === i.id)?.unit || "units",
        })),
    };

    setRecipes([newRecipe, ...recipes]);
    setIsDialogOpen(false);

    // Reset form
    setNewRecipeName("");
    setNewRecipeDesc("");
    setNewRecipePrep("");
    setNewRecipeServings("");
    setNewRecipeIngredients([]);
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-secondary/95 backdrop-blur-xl border-primary/20">
            <DialogHeader>
              <DialogTitle>Create New Recipe</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipe Name</Label>
                  <Input
                    placeholder="e.g. Mystic Tacos"
                    value={newRecipeName}
                    onChange={(e) => setNewRecipeName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newRecipeCategory}
                    onValueChange={setNewRecipeCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tacos">Tacos</SelectItem>
                      <SelectItem value="Burritos">Burritos</SelectItem>
                      <SelectItem value="Specialties">Specialties</SelectItem>
                      <SelectItem value="Sides">Sides</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Short description of the dish"
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prep Time (min)</Label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={newRecipePrep}
                    onChange={(e) => setNewRecipePrep(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Servings</Label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={newRecipeServings}
                    onChange={(e) => setNewRecipeServings(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={newRecipeDifficulty}
                    onValueChange={(v: any) => setNewRecipeDifficulty(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-2 bg-primary/10" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Ingredients</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddIngredient}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Ingredient
                  </Button>
                </div>
                <ScrollArea className="h-[200px] rounded-md border border-primary/10 bg-black/20 p-2">
                  <div className="space-y-2">
                    {newRecipeIngredients.map((item, i) => (
                      <div key={i} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          {i === 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              Ingredient
                            </span>
                          )}
                          <Select
                            value={item.id}
                            onValueChange={(val) =>
                              updateIngredient(i, "id", val)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ingredients.map((ing) => (
                                <SelectItem key={ing.id} value={ing.id}>
                                  {ing.name} ({ing.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20 space-y-1">
                          {i === 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              Qty
                            </span>
                          )}
                          <Input
                            className="h-8 text-xs"
                            type="number"
                            placeholder="1"
                            value={item.qty}
                            onChange={(e) =>
                              updateIngredient(i, "qty", e.target.value)
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeIngredient(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {newRecipeIngredients.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-8">
                        No ingredients added yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRecipe}>Create Recipe</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              (max, r) => ((r.popularity || 0) > max ? r.popularity || 0 : max),
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
              recipes.reduce((sum, r) => sum + (r.prepTime || 0), 0) /
                recipes.length,
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
                {recipe.description || "No description available"}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTime || 15}m
                </div>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {recipe.servings || 2}
                </div>
                {recipe.difficulty && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        difficultyColors[recipe.difficulty]
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <TrendingUp className="h-3 w-3" />
                {recipe.popularity || 0}
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
