import { NextResponse } from "next/server";
import { getRecipes, getIngredients, getWasteEntries } from "@/lib/data-db";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [recipes, ingredients, wasteEntries, forecastsResult] = await Promise.all([
      getRecipes(),
      getIngredients(),
      getWasteEntries(),
      supabase
        .from("forecasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return NextResponse.json({
      recipes: recipes || [],
      ingredients: ingredients || [],
      wasteEntries: wasteEntries || [],
      forecasts: forecastsResult.data || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching insights data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch insights data",
        recipes: [],
        ingredients: [],
        wasteEntries: [],
        forecasts: [],
        success: false,
      },
      { status: 500 }
    );
  }
}