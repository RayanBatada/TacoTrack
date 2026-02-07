import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const seedIngredients = [
  { id: "seasoned-beef", name: "Enchanted Seasoned Beef", category: "protein", unit: "lbs", on_hand: 45, par_level: 120, reorder_point: 70, cost_per_unit: 3.49, vendor: "Sherwood Meats", storage_location: "Walk-in Cooler", lead_time_days: 2 },
  { id: "grilled-chicken", name: "Sherwood Grilled Chicken", category: "protein", unit: "lbs", on_hand: 62, par_level: 80, reorder_point: 50, cost_per_unit: 4.29, vendor: "Sherwood Meats", storage_location: "Walk-in Cooler", lead_time_days: 2 },
  { id: "steak-strips", name: "Nottingham Steak Strips", category: "protein", unit: "lbs", on_hand: 18, par_level: 40, reorder_point: 25, cost_per_unit: 8.99, vendor: "Sherwood Meats", storage_location: "Walk-in Cooler", lead_time_days: 1 },
  { id: "nacho-cheese", name: "Mystic Nacho Cheese", category: "dairy", unit: "lbs", on_hand: 35, par_level: 50, reorder_point: 30, cost_per_unit: 2.99, vendor: "Friar Tuck Dairy", storage_location: "Walk-in Cooler", lead_time_days: 2 },
  { id: "sour-cream", name: "Forest Sour Cream", category: "dairy", unit: "qt", on_hand: 8, par_level: 20, reorder_point: 12, cost_per_unit: 3.99, vendor: "Friar Tuck Dairy", storage_location: "Walk-in Cooler", lead_time_days: 2 },
  { id: "shredded-lettuce", name: "Merry Shredded Lettuce", category: "produce", unit: "lbs", on_hand: 12, par_level: 30, reorder_point: 18, cost_per_unit: 1.99, vendor: "Greenwood Farms", storage_location: "Walk-in Cooler", lead_time_days: 1 },
  { id: "diced-tomatoes", name: "Robin's Diced Tomatoes", category: "produce", unit: "lbs", on_hand: 22, par_level: 40, reorder_point: 25, cost_per_unit: 1.79, vendor: "Greenwood Farms", storage_location: "Walk-in Cooler", lead_time_days: 1 },
  { id: "guacamole", name: "Locksley Guacamole", category: "produce", unit: "lbs", on_hand: 15, par_level: 40, reorder_point: 24, cost_per_unit: 4.49, vendor: "Greenwood Farms", storage_location: "Walk-in Cooler", lead_time_days: 1 },
  { id: "golden-potato-gems", name: "Golden Potato Gems", category: "produce", unit: "lbs", on_hand: 60, par_level: 100, reorder_point: 60, cost_per_unit: 0.89, vendor: "Greenwood Farms", storage_location: "Walk-in Cooler", lead_time_days: 1 },
  { id: "flour-tortillas", name: "Spell-Pressed Flour Tortillas", category: "dry-goods", unit: "dozen", on_hand: 40, par_level: 60, reorder_point: 36, cost_per_unit: 2.49, vendor: "Greenwood Bakery", storage_location: "Dry Storage", lead_time_days: 3 },
];

const seedRecipes = [
  { id: "spell-burrito", name: "Spell-Bound Burrito", category: "Burritos", yield_percent: 92, sell_price: 8.99 },
  { id: "sherwood-crunch", name: "Sherwood Crunchwrap", category: "Specialties", yield_percent: 90, sell_price: 7.49 },
  { id: "outlaw-steak-taco", name: "Outlaw Steak Taco", category: "Tacos", yield_percent: 88, sell_price: 4.99 },
  { id: "forest-quesadilla", name: "Enchanted Forest Quesadilla", category: "Specialties", yield_percent: 95, sell_price: 6.99 },
  { id: "merry-nachos", name: "Merry Men's Nachos", category: "Sides", yield_percent: 90, sell_price: 5.99 },
];

const seedRecipeIngredients = [
  { recipe_id: "spell-burrito", ingredient_id: "seasoned-beef", quantity: 0.25 },
  { recipe_id: "spell-burrito", ingredient_id: "flour-tortillas", quantity: 0.083 },
  { recipe_id: "spell-burrito", ingredient_id: "nacho-cheese", quantity: 0.1 },
  { recipe_id: "spell-burrito", ingredient_id: "shredded-lettuce", quantity: 0.05 },
  { recipe_id: "sherwood-crunch", ingredient_id: "seasoned-beef", quantity: 0.2 },
  { recipe_id: "sherwood-crunch", ingredient_id: "flour-tortillas", quantity: 0.083 },
  { recipe_id: "sherwood-crunch", ingredient_id: "nacho-cheese", quantity: 0.08 },
  { recipe_id: "sherwood-crunch", ingredient_id: "diced-tomatoes", quantity: 0.05 },
  { recipe_id: "outlaw-steak-taco", ingredient_id: "steak-strips", quantity: 0.15 },
  { recipe_id: "outlaw-steak-taco", ingredient_id: "shredded-lettuce", quantity: 0.03 },
  { recipe_id: "forest-quesadilla", ingredient_id: "grilled-chicken", quantity: 0.2 },
  { recipe_id: "forest-quesadilla", ingredient_id: "flour-tortillas", quantity: 0.083 },
  { recipe_id: "forest-quesadilla", ingredient_id: "nacho-cheese", quantity: 0.05 },
  { recipe_id: "merry-nachos", ingredient_id: "golden-potato-gems", quantity: 0.5 },
  { recipe_id: "merry-nachos", ingredient_id: "nacho-cheese", quantity: 0.2 },
];

export async function POST() {
  try {
    // Insert ingredients
    const { error: ingError } = await supabase
      .from("ingredients")
      .insert(seedIngredients);

    if (ingError && !ingError.message.includes("duplicate")) throw ingError;

    // Insert recipes
    const { error: recipeError } = await supabase
      .from("recipes")
      .insert(seedRecipes);

    if (recipeError && !recipeError.message.includes("duplicate")) throw recipeError;

    // Insert recipe ingredients
    const { error: riError } = await supabase
      .from("recipe_ingredients")
      .insert(seedRecipeIngredients);

    if (riError && !riError.message.includes("duplicate")) throw riError;

    // Generate sales events for the last 14 days
    const salesEvents = [];
    const now = new Date();
    
    for (let day = 13; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // Each recipe gets 10-30 sales per day
      seedRecipes.forEach(recipe => {
        const dailySales = Math.floor(Math.random() * 20) + 10;
        for (let i = 0; i < dailySales; i++) {
          const hour = Math.floor(Math.random() * 12) + 11; // 11am-11pm
          const minute = Math.floor(Math.random() * 60);
          const saleDate = new Date(date);
          saleDate.setHours(hour, minute);
          
          salesEvents.push({
            id: `sale-${recipe.id}-${day}-${i}`,
            recipe_id: recipe.id,
            quantity: 1,
            sale_timestamp: saleDate.toISOString(),
          });
        }
      });
    }

    if (salesEvents.length > 0) {
      const { error: salesError } = await supabase
        .from("sales_events")
        .insert(salesEvents);

      if (salesError && !salesError.message.includes("duplicate")) throw salesError;
    }

    // Generate inventory usage transactions for ingredients
    const usageTransactions = [];
    
    for (let day = 13; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      seedIngredients.forEach(ingredient => {
        const dailyUsage = Math.random() * 10 + 5; // 5-15 units per day
        usageTransactions.push({
          id: `usage-${ingredient.id}-${day}`,
          ingredient_id: ingredient.id,
          quantity: -dailyUsage,
          transaction_type: "usage",
          transaction_timestamp: date.toISOString(),
        });
      });
    }

    if (usageTransactions.length > 0) {
      const { error: txnError } = await supabase
        .from("inventory_transactions")
        .insert(usageTransactions);

      if (txnError && !txnError.message.includes("duplicate")) throw txnError;
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        ingredients: seedIngredients.length,
        recipes: seedRecipes.length,
        recipeIngredients: seedRecipeIngredients.length,
        salesEvents: salesEvents.length,
        usageTransactions: usageTransactions.length,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
