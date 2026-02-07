import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { recipeId, forecastDays = 7 } = await request.json();

    // Get recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, name, daily_sales")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Calculate forecast
    const dailySales = recipe.daily_sales || [0, 0, 0, 0, 0, 0, 0];
    const avgSales = dailySales.reduce((a: number, b: number) => a + b, 0) / dailySales.length;

    const forecasts = [];
    const today = new Date();

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

    // Save to database
    const { error: insertError } = await supabase
      .from("forecasts")
      .upsert(forecasts, { onConflict: "id" });

    if (insertError) {
      console.error("Error saving forecasts:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to save forecasts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      forecast: forecasts,
    });
  } catch (error) {
    console.error("Forecast error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}