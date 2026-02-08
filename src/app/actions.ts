"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getIngredients, getRecipes } from "@/lib/data-db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ---------------------------------------------------------
// 1. HARDCODED CONTEXT (The "Brain" of the operation)
// ---------------------------------------------------------
// In a real app, you might fetch this from an API, but hardcoding
// the season is a quick way to make the AI "smart" about traffic.
const UGA_HOME_GAMES_2025 = [
    "2025-08-30", // vs Marshall
    "2025-09-06", // vs Austin Peay
    "2025-09-27", // vs Alabama (Huge game)
    "2025-10-04", // vs Kentucky
    "2025-10-18", // vs Ole Miss
    "2025-11-15", // vs Texas
    "2025-11-22", // vs Charlotte
];

export async function chatWithGemini(userMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        // --- A. CONTEXT PREPARATION ---
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if today is a Game Day OR a Friday before a Game Day
        const isGameDay = UGA_HOME_GAMES_2025.includes(dateString);
        const isGameWeekend = isGameDay || UGA_HOME_GAMES_2025.some(gameDate => {
            const game = new Date(gameDate);
            const diffTime = game.getTime() - today.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            return diffDays > 0 && diffDays < 2; // It's Friday/Saturday before game
        });

        // --- B. DATABASE PULL ---
        const [ingredients, recipes] = await Promise.all([
            getIngredients(),
            getRecipes()
        ]);

        // --- C. DATA FORMATTING ---
        const inventoryDB = ingredients.map(i => {
            const avgUsage = i.dailyUsage.reduce((a, b) => a + b, 0) / i.dailyUsage.length || 1;
            const daysStock = (i.onHand / avgUsage).toFixed(1);
            // Add a visual flag for the AI if stock is critical
            const status = Number(daysStock) < 2 ? "🔴 CRITICAL LOW" : "🟢 OK";

            return `[${status}] ITEM: ${i.name}
      - Stock: ${i.onHand} ${i.unit}
      - Cost: $${i.costPerUnit}/${i.unit}
      - Vendor: ${i.vendor}
      - Avg Usage: ${avgUsage.toFixed(1)}/day
      - Runway: ${daysStock} days`;
        }).join("\n");

        const recipeDB = recipes.map(r => {
            const ingredientList = r.ingredients.map(ing => {
                const detail = ingredients.find(i => i.id === ing.ingredientId);
                return `${ing.qty} ${detail?.unit || 'units'} ${detail?.name || 'Unknown Ingredient'}`;
            }).join(", ");

            return `DISH: ${r.name} ($${r.sellPrice})
      - Ingredients: ${ingredientList}`;
        }).join("\n");

        // --- D. THE ENHANCED PROMPT ---
        const systemPrompt = `
      You are "Taco Talk", the AI Operations Director for a busy restaurant in Athens, GA.
      
      === CURRENT CONTEXT (DO NOT ASK USER FOR THIS) ===
      - Today is: ${dayOfWeek}, ${dateString}
      - UGA Home Game Alert: ${isGameWeekend ? "YES! EXPECT DOUBLE VOLUME." : "No game this weekend (Standard Volume)."}
      - Weather Rule: If Raining -> Push delivery combos. If Sunny -> Push Patio drinks.

      === LIVE INVENTORY ===
      ${inventoryDB}

      === RECIPE SPECS ===
      ${recipeDB}

      === INSTRUCTIONS ===
      1. **Bottleneck Logic:** When asked "How many Burritos can I make?", do not just check the main meat. Check ALL ingredients (Tortillas, Cheese, Meat). The one with the *lowest* possible yield is the answer.
      2. **Formatting:** - Use **Bold** for key numbers (e.g., "**45 lbs** left").
         - Use Bullet points for lists.
         - Keep answers short and punchy. Managers are busy.
      3. **Purchase Orders:** If asked what to buy, group items by VENDOR (e.g., "From Sherwood Meats: ...").
      4. **Critical Alerts:** If an item is marked "🔴 CRITICAL LOW", mention it immediately if it relates to the user's question.

      User Question: ${userMessage}
    `;

        const result = await model.generateContent(systemPrompt);
        return result.response.text();

    } catch (error) {
        console.error("Gemini Error:", error);
        return "I'm having trouble connecting to the inventory system. Please check the logs.";
    }
}