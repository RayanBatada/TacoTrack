// app/api/forecast/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { recipeId, forecastDays = 7 } = await request.json();

    // Fetch sales history from database
    const { data: salesHistory, error } = await supabase
      .from('sales_events')
      .select('sale_timestamp, quantity, day_of_week')
      .eq('recipe_id', recipeId)
      .gte('sale_timestamp', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .order('sale_timestamp', { ascending: true });

    if (error) throw error;

    // Aggregate sales by day
    const dailySales: Record<string, number> = {};
    salesHistory?.forEach(sale => {
      const date = new Date(sale.sale_timestamp).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + sale.quantity;
    });

    const salesArray = Object.entries(dailySales).map(([date, qty]) => ({
      date,
      quantity: qty,
      dayOfWeek: new Date(date).getDay()
    }));

    // Calculate weekday patterns
    const weekdayAvg: Record<number, number[]> = {};
    salesArray.forEach(({ dayOfWeek, quantity }) => {
      if (!weekdayAvg[dayOfWeek]) weekdayAvg[dayOfWeek] = [];
      weekdayAvg[dayOfWeek].push(quantity);
    });

    const weekdayPatterns = Object.entries(weekdayAvg).map(([day, quantities]) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
      avgSales: (quantities.reduce((a, b) => a + b, 0) / quantities.length).toFixed(1)
    }));

    // Prepare AI prompt
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prompt = `You are a restaurant sales forecasting expert.

HISTORICAL DATA (Last 60 days):
${JSON.stringify(salesArray.slice(-30), null, 2)}

WEEKDAY PATTERNS:
${JSON.stringify(weekdayPatterns, null, 2)}

TASK:
Forecast sales for the next ${forecastDays} days starting from ${tomorrow}.

Consider:
- Weekday patterns (weekends vs weekdays)
- Recent trends (increasing/decreasing)

Return ONLY a JSON array with this exact format:
[
  { "date": "2026-02-08", "predicted_quantity": 85, "confidence": "high" },
  { "date": "2026-02-09", "predicted_quantity": 92, "confidence": "high" }
]

Important:
- predicted_quantity must be an integer
- confidence can be "high", "medium", or "low"
- Return ONLY the JSON array, no explanation`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse AI response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const forecast = JSON.parse(cleanText);

    return NextResponse.json({
      success: true,
      recipeId,
      forecast,
      metadata: {
        historicalDataPoints: salesArray.length,
        weekdayPatterns,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}