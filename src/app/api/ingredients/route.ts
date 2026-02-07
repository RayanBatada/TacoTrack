import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Helper to transform snake_case database fields to camelCase and compute daily usage
async function transformIngredient(ing: any) {
  // Fetch usage events for this ingredient over the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: usageData } = await supabase
    .from("inventory_transactions")
    .select("quantity, transaction_timestamp")
    .eq("ingredient_id", ing.id)
    .eq("transaction_type", "usage")
    .gte("transaction_timestamp", fourteenDaysAgo.toISOString())
    .order("transaction_timestamp", { ascending: true });

  // Build daily usage array for last 14 days
  const dailyUsage = Array(14).fill(0);
  if (usageData) {
    usageData.forEach((usage: any) => {
      const usageDate = new Date(usage.transaction_timestamp);
      const daysAgo = Math.floor(
        (new Date().getTime() - usageDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysAgo >= 0 && daysAgo < 14) {
        dailyUsage[13 - daysAgo] += Math.abs(usage.quantity);
      }
    });
  }

  return {
    id: ing.id,
    name: ing.name,
    category: ing.category,
    unit: ing.unit,
    onHand: ing.on_hand,
    parLevel: ing.par_level,
    costPerUnit: ing.cost_per_unit,
    vendor: ing.vendor,
    storageLocation: ing.storage_location,
    expiryDate: null,
    lastDelivery: null,
    leadTimeDays: ing.lead_time_days,
    dailyUsage,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const transformed = await Promise.all(
      (data || []).map((ing) => transformIngredient(ing))
    );

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("ingredients")
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0] || {}, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 });
  }
}
