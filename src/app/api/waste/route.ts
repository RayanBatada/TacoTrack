import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Helper to transform snake_case database fields to camelCase
function transformWaste(waste: any) {
  return {
    id: waste.id,
    ingredientId: waste.ingredient_id,
    qty: waste.qty,
    reason: waste.reason,
    date: waste.date,
    costLost: waste.cost_lost,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("waste_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json((data || []).map(transformWaste));
  } catch (error) {
    console.error("Error fetching waste entries:", error);
    return NextResponse.json({ error: "Failed to fetch waste entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("waste_entries")
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0] || {}, { status: 201 });
  } catch (error) {
    console.error("Error creating waste entry:", error);
    return NextResponse.json({ error: "Failed to create waste entry" }, { status: 500 });
  }
}
