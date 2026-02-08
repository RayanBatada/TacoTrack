import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { getIngredients } from "@/lib/data-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use the centralized function that calculates daily usage
    const ingredients = await getIngredients();
    return NextResponse.json(ingredients);
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
      .insert([{
        id: body.id,
        name: body.name,
        category: body.category,
        unit: body.unit,
        on_hand: body.onHand,
        par_level: body.parLevel,
        reorder_point: body.reorderPoint || body.parLevel * 0.5,
        cost_per_unit: body.costPerUnit,
        vendor: body.vendor,
        storage_location: body.storageLocation || null,
        lead_time_days: body.leadTimeDays || 2,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0] || {}, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Convert camelCase to snake_case
    const dbUpdates: any = {};
    if (updates.onHand !== undefined) dbUpdates.on_hand = updates.onHand;
    if (updates.parLevel !== undefined) dbUpdates.par_level = updates.parLevel;
    if (updates.costPerUnit !== undefined) dbUpdates.cost_per_unit = updates.costPerUnit;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.vendor !== undefined) dbUpdates.vendor = updates.vendor;

    const { data, error } = await supabase
      .from("ingredients")
      .update(dbUpdates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0] || {});
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 });
  }
}