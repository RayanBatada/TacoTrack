// app/page.tsx
// =============================================================================
// TACOTRACK DASHBOARD - MAIN PAGE
// This is the main dashboard that shows inventory, trends, AI chat, and waste
// =============================================================================

"use client";

// =============================================================================
// IMPORTS - All the tools and components we need
// =============================================================================
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatWithGemini } from "./actions";
import { useForecast } from "@/lib/useForecast";

// Icons from lucide-react library
import {
  Package,
  UtensilsCrossed,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Activity,
  ChevronDown,
} from "lucide-react";

// Data functions and types from our database
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

// Chart components from recharts library
// @ts-expect-error Cell has deprecation warning but is required for the PieChart
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
} from "recharts";

// =============================================================================
// STYLING - Tooltip style for charts
// =============================================================================
const tooltipStyle = {
  background: "#2e1065",
  border: "1px solid rgba(217, 70, 239, 0.2)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#ffffff",
  padding: "8px 12px",
};

// =============================================================================
// MAIN COMPONENT - The whole dashboard
// =============================================================================
export default function HomePage() {
  // ===========================================================================
  // STATE MANAGEMENT - Variables that track data and user interactions
  // ===========================================================================

  // DATA FROM DATABASE
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // AI CHATBOT STATE
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

  // TRENDS GRAPH STATE
  const [trendView, setTrendView] = useState<"ingredients" | "dishes">(
    "ingredients",
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // FORECAST STATE
  const {
    forecast,
    loading: forecastLoading,
    generateForecast,
  } = useForecast();
  const [showForecast, setShowForecast] = useState(false);

  // REFERENCE FOR AUTO-SCROLLING CHAT
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // AUTO-SCROLL FUNCTION - Keeps chat scrolled to bottom
  // ===========================================================================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // ===========================================================================
  // FETCH DATA ON PAGE LOAD - Get all data from database
  // ===========================================================================
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

        if (ing.length > 0) setSelectedIngredient(ing[0].id);
        if (rec.length > 0) setSelectedDish(rec[0].id);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ===========================================================================
  // DATA CALCULATIONS - Process raw data for display
  // ===========================================================================

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

  // ===========================================================================
  // TREND DATA PREPARATION - Data for the line graph
  // ===========================================================================

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

  const getCurrentSelectionLabel = () => {
    if (trendView === "ingredients") {
      const ing = ingredients.find((i) => i.id === selectedIngredient);
      return ing?.name || "Select Ingredient";
    } else {
      const dish = recipes.find((r) => r.id === selectedDish);
      return dish?.name || "Select Dish";
    }
  };

  // ===========================================================================
  // WASTE DATA PREPARATION - For pie chart
  // ===========================================================================

  const topSellers = topSellingItems(recipes, ingredients);
  const bottomThree = topSellers.slice(-3).reverse();

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

  // ===========================================================================
  // EVENT HANDLERS - What happens when user interacts
  // ===========================================================================

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();

    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    setChatMessages((prev) => [
      ...prev,
      { role: "bot", text: "Consulting the inventory..." },
    ]);

    try {
      const response = await chatWithGemini(userMsg);
      setChatMessages((prev) => {
        const history = [...prev];
        history.pop();
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
    setShowForecast(false);
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
    setShowForecast(false);
    setIsDropdownOpen(false);
  };

  // ===========================================================================
  // LOADING STATE - Show while data is loading
  // ===========================================================================
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

  // ===========================================================================
  // MAIN RENDER - The actual dashboard UI
  // ===========================================================================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* TOP SECTION - Action Required & Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[460px]">
        {/* LEFT COLUMN - ACTION REQUIRED TABLE */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-white">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-bold tracking-wide">ACTION REQUIRED</h2>
          </div>

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

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-2">
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

        {/* RIGHT COLUMN - TRENDS GRAPH */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-bold tracking-wide">TRENDS</h2>

              {/* Forecast button next to title - always visible */}
              <button
                onClick={() => {
                  if (trendView === "dishes" && selectedDish) {
                    generateForecast(selectedDish, 7);
                    setShowForecast(true);
                  }
                }}
                disabled={forecastLoading || trendView === "ingredients"}
                title={
                  trendView === "ingredients"
                    ? "Switch to Dishes view to forecast"
                    : ""
                }
                className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  trendView === "ingredients"
                    ? "bg-secondary/30 text-muted-foreground cursor-not-allowed opacity-50"
                    : forecastLoading
                      ? "bg-primary/50 text-white cursor-wait"
                      : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {forecastLoading ? "🔮 Forecasting..." : "🔮 AI Forecast"}
              </button>
            </div>

            <div className="flex bg-secondary rounded-lg p-1 border border-primary/20">
              <button
                onClick={() => handleTrendViewChange("ingredients")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  trendView === "ingredients"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => handleTrendViewChange("dishes")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  trendView === "dishes"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dishes
              </button>
            </div>
          </div>

          <div className="mb-3 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
            >
              <span className="text-foreground">
                {getCurrentSelectionLabel()}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
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

          {/* The actual line graph OR forecast results */}
          <div className="flex-1 w-full min-h-0">
            {showForecast && forecast.length > 0 ? (
              // SHOW FORECAST RESULTS
              <div className="h-full w-full bg-secondary/20 rounded-lg border border-white/5 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-primary">
                    AI Forecast Results
                  </h3>
                  <button
                    onClick={() => setShowForecast(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Show Graph
                  </button>
                </div>
                <div className="space-y-2">
                  {forecast.map((f) => {
                    const date = new Date(f.date);
                    const dayName = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ][date.getDay()];
                    return (
                      <div
                        key={f.date}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-white/5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {dayName}, {date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary">
                            {f.predicted_quantity} units
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              f.confidence === "high"
                                ? "bg-success/20 text-success"
                                : f.confidence === "medium"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {f.confidence}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // SHOW TREND GRAPH
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
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION - TacoTalk AI Chat & Waste Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[280px]">
        {/* LEFT COLUMN - TACOTALK AI CHATBOT */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative h-full min-h-0">
          <div className="flex items-center gap-2 mb-2 text-warning shrink-0">
            <MessageSquare className="h-4 w-4" />
            <h2 className="font-bold text-sm tracking-wide text-[15px]">
              TacoTalk AI
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-sm min-h-0">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
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

        {/* RIGHT COLUMN - FOOD FOR THOUGHT */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3 text-white">
            <UtensilsCrossed className="h-4 w-4" />
            <h2 className="font-bold text-sm tracking-wide text-[15px]">
              FOOD FOR THOUGHT
            </h2>
          </div>

          <div className="flex gap-3 flex-1 min-h-0">
            <div className="w-[45%] flex flex-col gap-3">
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

              <div className="bg-secondary/30 p-3 rounded-lg border border-white/5 flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Total/wk
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${wasteEntries.reduce((s, w) => s + w.costLost, 0).toFixed(0)}
                </p>
              </div>
            </div>

            {wasteChartData.length > 0 && (
              <div className="flex-1 flex items-center justify-center gap-3">
                <div className="w-[55%] h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={62}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={false}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      >
                        {wasteChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={WASTE_COLORS[index % WASTE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [
                          `$${value.toFixed(2)}`,
                          "Cost",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2 justify-center text-[15px]">
                  {wasteChartData.map((item, idx) => (
                    <div
                      key={item.name.toUpperCase()}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            WASTE_COLORS[idx % WASTE_COLORS.length],
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-muted-foreground leading-tight">
                          {item.name.toUpperCase()}
                        </span>
                        <span className="font-semibold text-foreground leading-tight">
                          {(
                            (item.value /
                              wasteChartData.reduce((s, d) => s + d.value, 0)) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
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
