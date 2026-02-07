import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Helper to transform snake_case database fields to camelCase and add daily sales
async function transformRecipe(recipe: any) {
  // Fetch sales events for this recipe over the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: salesData } = await supabase
    .from("sales_events")
    .select("quantity, sale_timestamp")
    .eq("recipe_id", recipe.id)
    .gte("sale_timestamp", fourteenDaysAgo.toISOString())
    .order("sale_timestamp", { ascending: true });

  // Build daily sales array for last 14 days
  const dailySales = Array(14).fill(0);
  if (salesData) {
    salesData.forEach((sale: any) => {
      const saleDate = new Date(sale.sale_timestamp);
      const daysAgo = Math.floor(
        (new Date().getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysAgo >= 0 && daysAgo < 14) {
        dailySales[13 - daysAgo] += sale.quantity;
      }
    });
  }

  // Fetch recipe ingredients
  const { data: ingredientData } = await supabase
    .from("recipe_ingredients")
    .select("ingredient_id, quantity")
    .eq("recipe_id", recipe.id);

  const ingredients = ingredientData?.map((ri: any) => ({
    ingredientId: ri.ingredient_id,
    qty: ri.quantity,
    unit: "", // Will be populated if needed
  })) || [];

  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    ingredients,
    yieldPercent: recipe.yield_percent,
    sellPrice: recipe.sell_price,
    dailySales,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const transformed = await Promise.all(
      (data || []).map((recipe) => transformRecipe(recipe))
    );

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("recipes")
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0] || {}, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}