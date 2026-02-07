"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatWithGemini } from "./actions";
import {
  Package,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Send,
  TreePine,
} from "lucide-react";
import {
  getRecipes,
  getIngredients,
  getWasteEntries,
  daysOfStock,
  avgDailyUsage,
  foodCostPercent,
  salesTrendData,
  topSellingItems,
  type Recipe,
  type Ingredient,
  type WasteEntry,
} from "@/lib/data";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const tooltipStyle = {
  background: "#2e1065", // Deep Purple
  border: "1px solid rgba(217, 70, 239, 0.2)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#ffffff",
};

export default function HomePage() {
  const [chatInput, setChatInput] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hola! I'm Taco Bot. 🌮 specialized in spicy inventory management. How can I help?",
    },
  ]);

  // Fetch data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ing, rec, waste] = await Promise.all([
          getIngredients(),
          getRecipes(),
          getWasteEntries(),
        ]);
        setIngredients(ing);
        setRecipes(rec);
        setWasteEntries(waste);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Ingredient usage trend data (aggregate all ingredients, last 14 days)
  const ingredientTrendData = Array.from({ length: 14 }, (_, i) => {
    const dayNames = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    const totalUsage = ingredients.reduce(
      (sum, ing) => sum + (ing.dailyUsage?.[i] || 0),
      0
    );
    const totalValue = ingredients.reduce(
      (sum, ing) => sum + ((ing.dailyUsage?.[i] || 0) * ing.costPerUnit),
      0
    );
    return {
      day: dayNames[i],
      usage: totalUsage,
      value: Math.round(totalValue),
    };
  });

  // Calculate chart data based on selection
  const activeIngredientData = selectedIngredient
    ? (ingredients.find(i => i.id === selectedIngredient)?.dailyUsage || []).map((usage, i) => {
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return {
        day: dayNames[i],
        usage: usage,
        value: usage * (ingredients.find(ing => ing.id === selectedIngredient)?.costPerUnit || 0)
      };
    }) || ingredientTrendData
    : ingredientTrendData;

  const lastWeekIngUsage = activeIngredientData
    .slice(0, 7)
    .reduce((s, d) => s + d.usage, 0);
  const thisWeekIngUsage = activeIngredientData
    .slice(7, 14)
    .reduce((s, d) => s + d.usage, 0);
  const ingChange =
    lastWeekIngUsage > 0
      ? Math.round(
        ((thisWeekIngUsage - lastWeekIngUsage) / lastWeekIngUsage) * 100
      )
      : 0;

  // Dish sales trend data
  const salesData = salesTrendData(recipes); // Aggregate

  // Custom dish data if selected
  const activeDishData = selectedDish
    ? ((recipes.find(r => r.id === selectedDish)?.dailySales) || []).map((sales, i) => {
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const r = recipes.find(item => item.id === selectedDish);
      return {
        day: dayNames[i],
        sales: sales,
        revenue: Math.round(sales * (r?.sellPrice || 0))
      };
    })
    : salesData.map((d) => ({
      day: d.day,
      sales: d.sales,
      revenue: Math.round(d.revenue),
    }));

  const lastWeekSales = selectedDish
    ? activeDishData.slice(0, 7)
    : salesData.slice(0, 7);
  const thisWeekSales = selectedDish
    ? activeDishData.slice(7, 14)
    : salesData.slice(7, 14);

  const lastWeekTotal = lastWeekSales.reduce((s, d) => s + d.sales, 0);
  const thisWeekTotal = thisWeekSales.reduce((s, d) => s + d.sales, 0);
  const salesChange =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;

  const dishTrendData = activeDishData;

  // Top & bottom performing items
  const topSellers = topSellingItems(recipes, ingredients);
  const topThree = topSellers.slice(0, 3);
  const bottomThree = topSellers.slice(-3).reverse();

  // Stock-sorted ingredients for visual display
  const stockItems = ingredients
    .map((i) => ({
      ...i,
      days: daysOfStock(i),
      avgUsage: avgDailyUsage(i.dailyUsage || []),
    }))
    .sort((a, b) => a.days - b.days);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();

    // Clear input and show user message immediately
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Show a temporary "Thinking..." bubble
    setChatMessages((prev) => [...prev, { role: "bot", text: "Consulting the inventory..." }]);

    // Call the server action
    try {
      const response = await chatWithGemini(userMsg);

      // Replace "Thinking..." with the real answer
      setChatMessages((prev) => {
        const history = [...prev];
        history.pop(); // Remove the loading message
        return [...history, { role: "bot", text: response }];
      });
    } catch (e) {
      // Handle errors gracefully
      setChatMessages((prev) => {
        const history = [...prev];
        history.pop();
        return [...history, { role: "bot", text: "Error: Could not reach the AI." }];
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Saturday, Feb 7 — Overview
          </p>
        </div>
        {/* Quick stats */}
        <div className="flex gap-4">
          <QuickPill label="Low Stock" value={`${stockItems.filter((i) => i.days <= 3).length} items`} color="text-warning" />
          <QuickPill label="This Week Sales" value={`${thisWeekTotal}`} color="text-success" />
          <QuickPill
            label="Avg Food Cost"
            value={`${Math.round(recipes.reduce((s, r) => s + foodCostPercent(r, ingredients), 0) / recipes.length)}%`}
            color="text-primary"
          />
        </div>
      </div>

      {/* 2x2 Dashboard Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* TOP LEFT: Ingredient Usage Trend */}
        <div className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Ingredient Usage</h2>
              <select
                className="ml-2 bg-secondary/50 border border-primary/20 rounded text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                value={selectedIngredient || ""}
                onChange={(e) => setSelectedIngredient(e.target.value || null)}
              >
                <option value="">All Ingredients</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>
            <TrendBadge value={ingChange} />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeIngredientData}>
                <defs>
                  <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#d8b4fe" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#d8b4fe" }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    name === "value" ? `$${value}` : `${value} units`,
                    name === "value" ? "Cost" : "Usage",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#d946ef"
                  strokeWidth={2}
                  fill="url(#ingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Mini stock bars */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Stock Levels
            </p>
            {stockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-28 truncate text-xs text-muted-foreground">
                  {item.name.split(" ").slice(-2).join(" ")}
                </span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (item.onHand / item.parLevel) * 100)}%`,
                      background:
                        item.days <= 1.5
                          ? "#ef4444"
                          : item.days <= 3
                            ? "#f59e0b"
                            : "#4ade80",
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-semibold w-8 text-right ${item.days <= 1.5
                    ? "text-critical"
                    : item.days <= 3
                      ? "text-warning"
                      : "text-success"
                    }`}
                >
                  {item.days}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP RIGHT: Dish Sales Trend */}
        <div className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Dish Sales</h2>
              <select
                className="ml-2 bg-secondary/50 border border-primary/20 rounded text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                value={selectedDish || ""}
                onChange={(e) => setSelectedDish(e.target.value || null)}
              >
                <option value="">All Dishes</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <TrendBadge value={salesChange} />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dishTrendData}>
                <defs>
                  <linearGradient id="dishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#d8b4fe" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#d8b4fe" }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    name === "revenue" ? `$${value}` : `${value} sold`,
                    name === "revenue" ? "Revenue" : "Sales",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#d946ef"
                  strokeWidth={2}
                  fill="url(#dishGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Per-dish breakdown */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Today&apos;s Dish Performance
            </p>
            {recipes.map((r) => {
              const todaySales = r.dailySales[r.dailySales.length - 1] || 0;
              const yesterdaySales = r.dailySales[r.dailySales.length - 2] || 0;
              const change =
                yesterdaySales > 0
                  ? Math.round(
                    ((todaySales - yesterdaySales) / yesterdaySales) * 100
                  )
                  : 0;
              return (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="w-32 truncate text-xs text-muted-foreground">
                    {r.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, (todaySales / 120) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">
                    {todaySales}
                  </span>
                  <span
                    className={`text-[10px] w-10 text-right ${change >= 0 ? "text-success" : "text-destructive"
                      }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM LEFT: Top & Bottom Performers */}
        <div className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <TreePine className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Food for Thought</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Top 3 */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-success">
                Top Sellers
              </p>
              <div className="space-y-3">
                {topThree.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-lg bg-success/5 p-3 border border-success/10"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-bold text-success">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {item.avgSales}/day
                        </span>
                        <span className="text-[10px] text-success">
                          {item.margin}% margin
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 3 */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-destructive">
                Needs Attention
              </p>
              <div className="space-y-3">
                {bottomThree.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-lg bg-destructive/5 p-3 border border-destructive/10"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-xs font-bold text-destructive">
                      {topSellers.length - i}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {item.avgSales}/day
                        </span>
                        <span className="text-[10px] text-destructive">
                          {item.margin}% margin
                        </span>
                      </div>
                    </div>
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All stock visual overview */}
          <div className="mt-5 pt-4 border-t border-primary/20">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Full Inventory Status
            </p>
            <div className="grid grid-cols-4 gap-2">
              {stockItems.map((item) => {
                const pct = Math.min(
                  100,
                  (item.onHand / item.parLevel) * 100
                );
                const color =
                  item.days <= 1.5
                    ? "#ef4444"
                    : item.days <= 3
                      ? "#f59e0b"
                      : "#4ade80";
                return (
                  <div
                    key={item.id}
                    className="rounded-lg bg-secondary p-2 text-center border border-primary/20"
                  >
                    {/* Mini circle gauge */}
                    <div className="relative mx-auto mb-1 h-10 w-10">
                      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#2e1065"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={color}
                          strokeWidth="3"
                          strokeDasharray={`${pct * 0.88} 88`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
                        style={{ color }}
                      >
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate">
                      {item.name.split(" ").pop()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM RIGHT: AI Chatbot */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Taco Bot</h2>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[300px] max-h-[400px] pr-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === "user"
                    ? "bg-primary/20 text-white"
                    : "bg-secondary text-secondary-foreground"
                    } prose prose-sm prose-invert max-w-none break-words`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat()}
              placeholder="Ask Taco Bot..."
              className="flex-1 rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
            <button
              onClick={handleChat}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary transition-colors hover:bg-primary/30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isUp
        ? "bg-success/10 text-success"
        : "bg-destructive/10 text-destructive"
        }`}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isUp ? "+" : ""}
      {value}% WoW
    </span>
  );
}

function QuickPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-lg px-4 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
