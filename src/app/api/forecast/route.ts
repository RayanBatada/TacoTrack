import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { calculateDailySalesForRecipe } from "@/lib/data-db";

export const dynamic = "force-dynamic";

// Generate and SAVE forecast to database
export async function POST(request: Request) {
  try {
    const { recipeId, forecastDays = 7 } = await request.json();

    console.log(`📊 Generating forecast for recipe: ${recipeId}`);

    // 1. Get recipe basic info
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, name")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      console.error("Recipe not found:", recipeError);
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    // 2. Calculate forecasts using Gemini
    const dailySales = await calculateDailySalesForRecipe(recipeId);
    const avgSales = dailySales.reduce((a: number, b: number) => a + b, 0) / dailySales.length;

    // Hardcoded context (same as actions.ts for now)
    const UGA_HOME_GAMES_2025 = [
      "2025-08-30", "2025-09-06", "2025-09-27",
      "2025-10-04", "2025-10-18", "2025-11-15", "2025-11-22"
    ];

    const today = new Date();
    // Prepare dates for the next 7 days
    const datesToForecast = [];
    for (let i = 1; i <= forecastDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      datesToForecast.push(d.toISOString().split('T')[0]);
    }

    const prompt = `
        You are an expert restaurant inventory planner. 
        Predict sales for "${recipe.name}" for the next ${forecastDays} days.
        
        CONTEXT:
        - Average Daily Sales: ${Math.round(avgSales)} units
        - Sales Pattern (Sun-Sat): ${JSON.stringify(dailySales)}
        - Today: ${today.toISOString().split('T')[0]}
        - Upcoming Games: ${JSON.stringify(UGA_HOME_GAMES_2025)}
        - Weather: Assume seasonal norms (Sunny/Warm).
        
        INSTRUCTIONS:
        1. Analyze the day of the week and any game days.
        2. Game days = +50-100% volume. Fridays before games = +30% volume.
        3. Return a raw JSON array (NO MARKDOWN) with objects:
           { "date": "YYYY-MM-DD", "predicted_quantity": number, "confidence": "high"|"medium"|"low" }
        4. Dates to cover: ${JSON.stringify(datesToForecast)}
    `;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();

    let aiForecasts = [];
    try {
      aiForecasts = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", responseText);
      throw new Error("AI returned invalid JSON");
    }

    const forecasts = aiForecasts.map((f: any) => ({
      id: `${recipeId}-${f.date}`,
      recipe_id: recipeId,
      dish_name: recipe.name,
      predicted_quantity: f.predicted_quantity,
      date: f.date,
      confidence: f.confidence,
      created_at: new Date().toISOString(),
    }));

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