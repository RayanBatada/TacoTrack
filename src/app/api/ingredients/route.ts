import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Helper to transform snake_case database fields to camelCase
function transformIngredient(ing: any) {
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
    expiryDate: ing.expiry_date,
    lastDelivery: ing.last_delivery,
    leadTimeDays: ing.lead_time_days,
    dailyUsage: ing.daily_usage,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json((data || []).map(transformIngredient));
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
