import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Generate and SAVE forecast to database
export async function POST(request: Request) {
  try {
    const { recipeId, forecastDays = 7 } = await request.json();

    console.log(`📊 Generating forecast for recipe: ${recipeId}`);

    // 1. Get recipe with sales data
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, name, daily_sales")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      console.error("Recipe not found:", recipeError);
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    // 2. Calculate forecasts
    const dailySales = recipe.daily_sales || [0, 0, 0, 0, 0, 0, 0];
    const avgSales = dailySales.reduce((a: number, b: number) => a + b, 0) / dailySales.length;

    const forecasts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);

      const dayOfWeek = forecastDate.getDay();
      const historicalSales = dailySales[dayOfWeek] || avgSales;
      const variance = 0.85 + Math.random() * 0.3;
      const predicted = Math.round(historicalSales * variance);

      const stdDev = Math.sqrt(
        dailySales.reduce((sum: number, val: number) => sum + Math.pow(val - avgSales, 2), 0) / dailySales.length
      );
      const confidence = stdDev < avgSales * 0.2 ? "high" : stdDev < avgSales * 0.4 ? "medium" : "low";

      forecasts.push({
        id: `${recipeId}-${forecastDate.toISOString().split("T")[0]}`,
        recipe_id: recipeId,
        dish_name: recipe.name,
        predicted_quantity: predicted,
        date: forecastDate.toISOString().split("T")[0],
        confidence,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`💾 Saving ${forecasts.length} forecasts to database...`);

    // 3. SAVE TO DATABASE (this is the critical part!)
    const { error: insertError } = await supabase
      .from("forecasts")
      .upsert(forecasts, { onConflict: "id" });

    if (insertError) {
      console.error("❌ Error saving forecasts:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to save forecasts" },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully saved ${forecasts.length} forecasts!`);

    // 4. Return forecasts to display
    return NextResponse.json({
      success: true,
      forecast: forecasts,
    });
  } catch (error: any) {
    console.error("💥 Forecast error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get existing forecasts from database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");

    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("forecasts")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });

    if (recipeId) {
      query = query.eq("recipe_id", recipeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching forecasts:", error);
    return NextResponse.json({ error: "Failed to fetch forecasts" }, { status: 500 });
  }
}