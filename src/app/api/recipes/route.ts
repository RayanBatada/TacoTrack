import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Helper to transform snake_case database fields to camelCase
function transformRecipe(recipe: any) {
  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients,
    yieldPercent: recipe.yield_percent,
    sellPrice: recipe.sell_price,
    dailySales: recipe.daily_sales,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json((data || []).map(transformRecipe));
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