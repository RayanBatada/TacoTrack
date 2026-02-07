"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getIngredients, getRecipes } from "@/lib/data-db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatWithGemini(userMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        // 1. DATA PROCESSING (The "Database Pull")
        // Fetch live data from Supabase
        const ingredients = await getIngredients();
        const recipes = await getRecipes();

        // Convert your raw data objects into a clear text format the AI can read.

        // --- INVENTORY DATABASE ---
        const inventoryDB = ingredients.map(i => {
            // Calculate how many days of stock we have left based on recent usage
            const avgUsage = i.dailyUsage.reduce((a, b) => a + b, 0) / i.dailyUsage.length || 1;
            const daysStock = (i.onHand / avgUsage).toFixed(1);

            return `ITEM: ${i.name} (ID: ${i.id})
      - Stock: ${i.onHand} ${i.unit}
      - Cost: $${i.costPerUnit}/${i.unit}
      - Vendor: ${i.vendor}
      - Expiry: ${i.expiryDate}
      - Usage: ~${avgUsage.toFixed(1)} ${i.unit}/day
      - Days Left: ${daysStock} days`;
        }).join("\n\n");

        // --- RECIPE DATABASE ---
        const recipeDB = recipes.map(r => {
            // Calculate sales velocity
            const avgSales = r.dailySales.reduce((a, b) => a + b, 0) / r.dailySales.length || 0;

            // Format the list of ingredients for this recipe
            const ingredientList = r.ingredients.map(ing =>
                `${ing.qty} ${ing.unit} of ${ing.ingredientId}`
            ).join(", ");

            return `DISH: ${r.name}
      - Price: $${r.sellPrice}
      - Avg Sales: ${avgSales.toFixed(0)}/day
      - Recipe: ${ingredientList}`;
        }).join("\n\n");

        // 2. THE ANALYST PROMPT
        const systemPrompt = `
      You are "Taco Talk", the AI Manager for a restaurant in Athens, GA.
      You have direct access to the live inventory database below.

      === INVENTORY DATABASE ===
      ${inventoryDB}

      === RECIPE DATABASE ===
      ${recipeDB}

      === VENDOR LIST ===
      Sherwood Meats, Friar Tuck Dairy, Greenwood Farms, Sherwood Provisions, Greenwood Bakery.

      === INSTRUCTIONS ===
      1. **Be Precise:** When asked about stock, cite the exact numbers from the database above.
      2. **Do Math:** - If asked "How many Burritos can I make?", find the "Burrito" recipe, check its ingredients (e.g., Beef), and divide the Beef Stock by the Beef per Burrito.
         - If asked "How much to buy X?", multiply quantity by Cost per Unit.
      3. **Local Context:**
         - We are in Athens, GA. UGA Football games (Saturdays) mean double traffic.
         - Rain = Delivery spikes. Sun = Patio spikes.
      4. **Tone:** Professional, data-driven, but friendly.

      User Question: ${userMessage}
    `;

        // 3. GENERATE
        const result = await model.generateContent(systemPrompt);
        return result.response.text();

    } catch (error) {
        console.error("Gemini Error:", error);
        return "I'm having trouble connecting to the database. Please try again.";
    }
}