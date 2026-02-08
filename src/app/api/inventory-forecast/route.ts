import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { daysOfStock, avgDailyUsage, suggestedOrderQty } from "@/lib/data";
import { getIngredients } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log("📊 Generating inventory forecasts...");

    const ingredients = await getIngredients();
    const today = new Date();
    const forecastDate = today.toISOString().split("T")[0];

    const inventoryForecasts = ingredients.map((ingredient) => {
      const daysLeft = daysOfStock(ingredient);
      const dailyUsageAvg = avgDailyUsage(ingredient.dailyUsage || []);
      const suggestedQty = suggestedOrderQty(ingredient);
      
      // Calculate order by date
      const orderByDate = new Date(today);
      orderByDate.setDate(today.getDate() + Math.floor(daysLeft));

      // Determine urgency
      let urgencyLevel: 'critical' | 'warning' | 'ok';
      if (daysLeft <= 2) {
        urgencyLevel = 'critical';
      } else if (daysLeft <= 4) {
        urgencyLevel = 'warning';
      } else {
        urgencyLevel = 'ok';
      }

      return {
        id: `${ingredient.id}-${forecastDate}`,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        current_stock: ingredient.onHand,
        daily_usage: dailyUsageAvg,
        days_until_stockout: daysLeft,
        suggested_order_qty: suggestedQty,
        order_by_date: orderByDate.toISOString().split("T")[0],
        urgency_level: urgencyLevel,
        unit: ingredient.unit,
        forecast_date: forecastDate,
        created_at: new Date().toISOString(),
      };
    });

    console.log(`💾 Saving ${inventoryForecasts.length} inventory forecasts...`);

    // Save to database
    const { error: insertError } = await supabase
      .from("inventory_forecasts")
      .upsert(inventoryForecasts, { onConflict: "id" });

    if (insertError) {
      console.error("❌ Error saving inventory forecasts:", insertError);
      throw insertError;
    }

    console.log(`✅ Successfully saved ${inventoryForecasts.length} inventory forecasts!`);

    return NextResponse.json({
      success: true,
      totalForecasts: inventoryForecasts.length,
      critical: inventoryForecasts.filter(f => f.urgency_level === 'critical').length,
      warning: inventoryForecasts.filter(f => f.urgency_level === 'warning').length,
    });
  } catch (error: any) {
    console.error("💥 Inventory forecast error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get inventory forecasts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urgency = searchParams.get("urgency");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    let query = supabase
      .from("inventory_forecasts")
      .select("*")
      .eq("forecast_date", date)
      .order("days_until_stockout", { ascending: true });

    if (urgency) {
      query = query.eq("urgency_level", urgency);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching inventory forecasts:", error);
    return NextResponse.json({ error: "Failed to fetch forecasts" }, { status: 500 });
  }
}