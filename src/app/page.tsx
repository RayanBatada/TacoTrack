// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatWithGemini } from "./actions";
import {
  Package,
  UtensilsCrossed,
  TrendingDown,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  DollarSign,
  Activity,
  ChevronDown,
} from "lucide-react";
import {
  getRecipes,
  getIngredients,
  getWasteEntries,
  daysOfStock,
  avgDailyUsage,
  foodCostPercent,
  topSellingItems,
  suggestedOrderQty,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const tooltipStyle = {
  background: "#2e1065",
  border: "1px solid rgba(217, 70, 239, 0.2)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#ffffff",
  padding: "8px 12px",
};

export default function HomePage() {
  // State for data
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // State for Chat
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    {
      role: "user" | "bot";
      text: string;
    }[]
  >([
    {
      role: "bot",
      text: "Hola! I'm Taco Talk. 🌮 specialized in spicy inventory management. How can I help?",
    },
  ]);

  // State for Trend Toggle
  const [trendView, setTrendView] = useState<"ingredients" | "dishes">(
    "ingredients",
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch data from Supabase on mount
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

        // Set default selections once data is loaded
        if (ing.length > 0) setSelectedIngredient(ing[0].id);
        if (rec.length > 0) setSelectedDish(rec[0].id);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // ✅ FIXED: Removed unnecessary dependencies

  // --- DATA CALCULATIONS ---

  // Stock items with calculated fields
  const stockItems = ingredients
    .map((i) => ({
      ...i,
      days: daysOfStock(i),
      avgUsage: avgDailyUsage(i.dailyUsage || []),
      value: i.onHand * i.costPerUnit,
      suggestedQty: suggestedOrderQty(i),
    }))
    .sort((a, b) => a.days - b.days);

  const criticalItems = stockItems.filter((i) => i.days <= 2);
  const watchItems = stockItems.filter((i) => i.days > 2 && i.days <= 4);

  // System Status Logic
  const systemStatus =
    criticalItems.length > 0
      ? "Critical"
      : watchItems.length > 0
        ? "Watch"
        : "Healthy";
  const statusColor =
    systemStatus === "Critical"
      ? "text-destructive"
      : systemStatus === "Watch"
        ? "text-warning"
        : "text-success";
  const StatusIcon =
    systemStatus === "Critical"
      ? AlertOctagon
      : systemStatus === "Watch"
        ? AlertTriangle
        : CheckCircle2;

  // KPI Calculations
  const totalInventoryValue = stockItems.reduce(
    (acc, item) => acc + item.value,
    0,
  );
  const avgFoodCost =
    recipes.length > 0
      ? Math.round(
          recipes.reduce((s, r) => s + foodCostPercent(r, ingredients), 0) /
            recipes.length,
        )
      : 0;

  // Trend Data Preparation
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getIngredientTrendData = (ingredientId: string) => {
    const ingredient = ingredients.find((ing) => ing.id === ingredientId);
    return Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      value: ingredient?.dailyUsage?.[i] || 0,
      type: "Usage",
    }));
  };

  const getDishTrendData = (dishId: string) => {
    const dish = recipes.find((r) => r.id === dishId);
    if (!dish || !dish.dailySales) return [];

    return Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      value: dish.dailySales[i] || 0,
      type: "Sales",
    }));
  };

  const activeTrendData =
    trendView === "ingredients"
      ? getIngredientTrendData(selectedIngredient)
      : getDishTrendData(selectedDish);

  // Get current selection label
  const getCurrentSelectionLabel = () => {
    if (trendView === "ingredients") {
      const ing = ingredients.find((i) => i.id === selectedIngredient);
      return ing?.name || "Select Ingredient";
    } else {
      const dish = recipes.find((r) => r.id === selectedDish);
      return dish?.name || "Select Dish";
    }
  };

  // Top/Bottom Performers
  const topSellers = topSellingItems(recipes, ingredients);
  const bottomThree = topSellers.slice(-3).reverse();

  // Waste by category for pie chart
  const wasteByCategory = wasteEntries.reduce(
    (acc: Record<string, number>, w) => {
      const ing = ingredients.find((i) => i.id === w.ingredientId);
      const cat = ing?.category || "Other";
      acc[cat] = (acc[cat] || 0) + w.costLost;
      return acc;
    },
    {},
  );

  const wasteChartData = Object.entries(wasteByCategory).map(
    ([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }),
  );

  const WASTE_COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
  ];

  // --- HANDLERS ---

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();

    // Clear input and show user message
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Show loading message
    setChatMessages((prev) => [
      ...prev,
      { role: "bot", text: "Consulting the inventory..." },
    ]);

    // Call AI
    try {
      const response = await chatWithGemini(userMsg);
      setChatMessages((prev) => {
        const history = [...prev];
        history.pop(); // Remove loading message
        return [...history, { role: "bot", text: response }];
      });
    } catch (e) {
      setChatMessages((prev) => {
        const history = [...prev];
        history.pop();
        return [
          ...history,
          { role: "bot", text: "Error: Could not reach the AI." },
        ];
      });
    }
  };

  const handleTrendViewChange = (view: "ingredients" | "dishes") => {
    setTrendView(view);
    if (view === "ingredients" && ingredients.length > 0) {
      setSelectedIngredient(ingredients[0].id);
    } else if (view === "dishes" && recipes.length > 0) {
      setSelectedDish(recipes[0].id);
    }
    setIsDropdownOpen(false);
  };

  const handleSelectionChange = (id: string) => {
    if (trendView === "ingredients") {
      setSelectedIngredient(id);
    } else {
      setSelectedDish(id);
    }
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* 1. HEADER SECTION */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-primary">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            TacoTrack Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="text-muted-foreground">Status:</span>
            <div className={`flex items-center gap-1 font-bold ${statusColor}`}>
              <StatusIcon className="h-4 w-4" />
              {systemStatus}
            </div>
            <span className="text-muted-foreground mx-2">|</span>
            <span className="text-muted-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Stockout Risk
            </span>
            <span
              className={`font-bold ${criticalItems.length > 0 ? "text-destructive" : "text-success"}`}
            >
              {criticalItems.length} items
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Avg Food Cost
            </span>
            <span
              className={`font-bold ${avgFoodCost > 30 ? "text-warning" : "text-success"}`}
            >
              {avgFoodCost}%
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Inv. Value
            </span>
            <span className="font-bold text-primary">
              ${totalInventoryValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION (Action & Trends) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[420px]">
        {/* LEFT: ACTION REQUIRED */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-white">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-bold tracking-wide">ACTION REQUIRED</h2>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-3 gap-4 mb-3 px-2">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Product Name
            </div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Quantity Needed
            </div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider text-right">
              Needed By
            </div>
          </div>

          <div className="border-t border-white/10 mb-3" />

          {/* Table Rows */}
          <div className="space-y-3 pb-1">
            {stockItems.slice(0, 5).map((item) => {
              const isCritical = item.days <= 2;
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-3 gap-4 px-3 py-3.5 rounded-lg border transition-colors ${
                    isCritical
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-secondary/30 border-white/5 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </p>
                      {isCritical && (
                        <span className="inline-block mt-2 bg-destructive text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                          Order Now
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-white">
                      {item.suggestedQty} {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          isCritical ? "text-destructive" : "text-white"
                        }`}
                      >
                        {item.days.toFixed(1)}d
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {stockItems.length === 0 && (
              <div className="text-sm text-white/60 text-center py-4">
                No actions required.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: TRENDS */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-bold tracking-wide">TRENDS</h2>
            </div>

            {/* TOGGLE */}
            <div className="flex bg-secondary rounded-lg p-1 border border-primary/20">
              <button
                onClick={() => handleTrendViewChange("ingredients")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${trendView === "ingredients" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Ingredients
              </button>
              <button
                onClick={() => handleTrendViewChange("dishes")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${trendView === "dishes" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Dishes
              </button>
            </div>
          </div>

          {/* DROPDOWN SELECTOR */}
          <div className="mb-3 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
            >
              <span className="text-foreground">
                {getCurrentSelectionLabel()}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-primary/20 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {trendView === "ingredients"
                  ? ingredients.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => handleSelectionChange(ing.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                          selectedIngredient === ing.id
                            ? "bg-primary/20 text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {ing.name}
                      </button>
                    ))
                  : recipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => handleSelectionChange(recipe.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                          selectedDish === recipe.id
                            ? "bg-primary/20 text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {recipe.name}
                      </button>
                    ))}
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-h-0">
            <div className="h-full w-full bg-secondary/20 rounded-lg border border-white/5 p-0 relative">
              {activeTrendData && activeTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeTrendData}
                    margin={{ top: 5, right: 10, left: 30, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="trendGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#d946ef"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#d946ef"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={45}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: "#d946ef", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#d946ef"
                      strokeWidth={3}
                      fill="url(#trendGrad)"
                      animationDuration={1000}
                      dot={false}
                      activeDot={{ r: 5, fill: "#d946ef" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No trend data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION (Copilot & Waste) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[280px]">
        {/* LEFT: TACO TALK */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative h-full min-h-0">
          <div className="flex items-center gap-2 mb-2 text-warning shrink-0">
            <MessageSquare className="h-4 w-4" />
            <h2 className="font-bold text-sm tracking-wide">
              TacoTalk (AI Copilot)
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-sm min-h-0">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === "user"
                      ? "bg-primary/20 text-primary-foreground border border-primary/20"
                      : "bg-secondary text-muted-foreground"
                  } prose prose-sm prose-invert max-w-none break-words`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ask Taco Talk..."
                className="flex-1 rounded-md border border-primary/20 bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              <button
                onClick={handleChat}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/20 text-primary hover:bg-primary/30"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: FOOD FOR THOUGHT */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3 text-white">
            <UtensilsCrossed className="h-4 w-4" />
            <h2 className="font-bold text-sm tracking-wide">
              Food for Thought (Waste Indicator)
            </h2>
          </div>

          <div className="flex gap-3 flex-1 min-h-0">
            {/* Left Half: Top Waste & Cost */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Top Waste
                </p>
                <p className="text-sm font-bold text-destructive truncate">
                  {bottomThree.length > 0 && bottomThree[0]?.name
                    ? bottomThree[0].name
                    : "N/A"}
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-secondary/30 p-2.5 rounded-lg border border-white/5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Total/wk
                  </p>
                  <p className="text-base font-bold text-foreground">
                    $
                    {wasteEntries
                      .reduce((s, w) => s + w.costLost, 0)
                      .toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Half: Pie Chart */}
            {wasteChartData.length > 0 && (
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteChartData}
                        cx="50%"
                        cy="40%"
                        innerRadius={18}
                        outerRadius={42}
                        paddingAngle={1.5}
                        dataKey="value"
                      >
                        {wasteChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={WASTE_COLORS[index % WASTE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Horizontal Legend Below Pie Chart */}
                <div className="flex flex-wrap gap-1.5 justify-center text-[9px] px-1">
                  {wasteChartData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-1.5 px-2 py-0.5"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            WASTE_COLORS[idx % WASTE_COLORS.length],
                        }}
                      />
                      <span className="text-muted-foreground">
                        {item.name}{" "}
                        <span className="font-semibold text-foreground">
                          {(
                            (item.value /
                              wasteChartData.reduce((s, d) => s + d.value, 0)) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
