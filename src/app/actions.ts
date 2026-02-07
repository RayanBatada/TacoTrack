"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ingredients, recipes } from "@/lib/data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatWithGemini(userMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 1. Prepare Inventory Data
        const inventoryContext = ingredients.map(i =>
            `- ${i.name} (${i.id}): ${i.onHand} ${i.unit} in stock. Cost: $${i.costPerUnit}/${i.unit}. Vendor: ${i.vendor}.`
        ).join("\n");

        // 2. Prepare Recipe Data
        const recipeContext = recipes.map(r => {
            // Calculate average sales if available, else default to 0
            const avgSales = r.dailySales ? Math.round(r.dailySales.reduce((a, b) => a + b, 0) / r.dailySales.length) : 0;
            return `- ${r.name} ($${r.sellPrice}): Avg Sales ${avgSales}/day. Ingredients: ${r.ingredients.map(i => `${i.qty} ${i.unit} ${i.ingredientId}`).join(", ")}`;
        }).join("\n");

        // 3. The System Prompt
        const systemPrompt = `
      You are "Taco Talk", the inventory management assistant for a restaurant.
      
      [CURRENT INVENTORY]
      ${inventoryContext}

      [RECIPES & SALES]
      ${recipeContext}

      [LOCAL CONTEXT: ATHENS, GA]
      - University of Georgia (UGA) football games cause huge spikes in traffic.
      - Rainy weather increases delivery orders; sunny weather increases patio dining.

      [YOUR GOAL]
      - Answer questions about costs, stock levels, and recipes.
      - If asked "How many tacos can I make?", check the ingredients for that taco and the current stock levels.
    `;

        const result = await model.generateContent([
            systemPrompt,
            `User Question: ${userMessage}`
        ]);

        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "I'm having trouble reaching the inventory spirits. Please check your API key.";
    }
}