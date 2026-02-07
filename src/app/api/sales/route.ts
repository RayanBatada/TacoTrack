import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");
    const days = parseInt(searchParams.get("days") || "28");

    // Get total count of sales_events
    const { count: totalCount } = await supabase
      .from("sales_events")
      .select("*", { count: "exact", head: true });

    // Get recent sales for a specific recipe if provided
    let recentSales = [];
    if (recipeId) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data } = await supabase
        .from("sales_events")
        .select("id, recipe_id, quantity, sale_timestamp")
        .eq("recipe_id", recipeId)
        .gte("sale_timestamp", fromDate.toISOString())
        .order("sale_timestamp", { ascending: false })
        .limit(100);

      recentSales = data || [];
    }

    // Get sales by recipe (last 28 days)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const { data: salesByRecipe } = await supabase
      .from("sales_events")
      .select("recipe_id, quantity")
      .gte("sale_timestamp", fourWeeksAgo.toISOString());

    const recipeSummary: Record<string, number> = {};
    (salesByRecipe || []).forEach((sale) => {
      recipeSummary[sale.recipe_id] =
        (recipeSummary[sale.recipe_id] || 0) + sale.quantity;
    });

    return NextResponse.json({
      totalSalesEvents: totalCount || 0,
      salesByRecipe: recipeSummary,
      recentSalesForRecipe: recentSales,
      debug: {
        days,
        recipeId,
        fourWeeksAgoDate: fourWeeksAgo.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}
