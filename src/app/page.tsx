"use client";
import { useState } from "react";
import {
  Package,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  DollarSign,
  Activity,
  ChevronDown
} from "lucide-react";
import {
  ingredients,
  recipes,
  daysOfStock,
  avgDailyUsage,
  foodCostPercent,
  salesTrendData,
  topSellingItems,
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
  padding: "8px 12px"
};

export default function HomePage() {
  // State for Chat
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hola! I'm Taco Bot. 🌮 What should we order today?",
    },
  ]);

  // State for Trend Toggle (Ingredients vs Dishes)
  const [trendView, setTrendView] = useState<"ingredients" | "dishes">("ingredients");
  
  // State for selected ingredient/dish
  const [selectedIngredient, setSelectedIngredient] = useState<string>(ingredients[0]?.id || "");
  const [selectedDish, setSelectedDish] = useState<string>(recipes[0]?.id || "");
  
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- DATA CALCULATIONS ---

  // 1. Stock / Action Items
  const stockItems = ingredients
    .map((i) => ({
      ...i,
      days: daysOfStock(i),
      avgUsage: avgDailyUsage(i.dailyUsage),
      value: i.onHand * i.costPerUnit
    }))
    .sort((a, b) => a.days - b.days);

  const criticalItems = stockItems.filter(i => i.days <= 2);
  const watchItems = stockItems.filter(i => i.days > 2 && i.days <= 4);
  
  // System Status Logic
  const systemStatus = criticalItems.length > 0 ? "Critical" : watchItems.length > 0 ? "Watch" : "Healthy";
  const statusColor = systemStatus === "Critical" ? "text-destructive" : systemStatus === "Watch" ? "text-warning" : "text-success";
  const StatusIcon = systemStatus === "Critical" ? AlertOctagon : systemStatus === "Watch" ? AlertTriangle : CheckCircle2;

  // KPI Calculations
  const totalInventoryValue = stockItems.reduce((acc, item) => acc + item.value, 0);
  const avgFoodCost = Math.round(recipes.reduce((s, r) => s + foodCostPercent(r), 0) / recipes.length);

  // 2. Trend Data Preparation
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Ingredient Trends
  const getIngredientTrendData = (ingredientId: string) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    return Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      value: ingredient?.dailyUsage[i] || 0,
      type: "Usage"
    }));
  };

  // Dish Trends
  const getDishTrendData = (dishId: string) => {
    const dish = recipes.find(r => r.id === dishId);
    const topSellers = topSellingItems();
    const dishData = topSellers.find(t => t.name === dish?.name);
    
    // Generate trend data for individual dish (7 days)
    return Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      value: dishData ? Math.round(dishData.avgSales * (0.8 + Math.random() * 0.4)) : 0,
      type: "Sales"
    }));
  };

  const activeTrendData = trendView === "ingredients" 
    ? getIngredientTrendData(selectedIngredient)
    : getDishTrendData(selectedDish);

  // Get current selection label
  const getCurrentSelectionLabel = () => {
    if (trendView === "ingredients") {
      const ing = ingredients.find(i => i.id === selectedIngredient);
      return ing?.name || "Select Ingredient";
    } else {
      const dish = recipes.find(r => r.id === selectedDish);
      return dish?.name || "Select Dish";
    }
  };

  // 3. Top/Bottom Performers (for Food for Thought)
  const topSellers = topSellingItems();
  const bottomThree = topSellers.slice(-3).reverse(); // "Waste Risk" items

  // --- HANDLERS ---

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    setTimeout(() => {
      let response = "Let me check the kitchen...";
      const q = userMsg.toLowerCase();
      if (q.includes("order")) {
         response = criticalItems.length 
          ? `Priority: ${criticalItems[0].name} is at ${criticalItems[0].days.toFixed(1)} days stock.` 
          : "Stock looks healthy today.";
      } else {
         response = "I can track usage, waste, and suggest orders.";
      }
      setChatMessages((prev) => [...prev, { role: "bot", text: response }]);
    }, 600);
  };

  const handleTrendViewChange = (view: "ingredients" | "dishes") => {
    setTrendView(view);
    if (view === "ingredients") {
      setSelectedIngredient(ingredients[0]?.id || "");
    } else {
      setSelectedDish(recipes[0]?.id || "");
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
             <span className="text-muted-foreground">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-6 text-sm">
           <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Stockout Risk</span>
              <span className={`font-bold ${criticalItems.length > 0 ? 'text-destructive' : 'text-success'}`}>
                {criticalItems.length} items
              </span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Avg Food Cost</span>
              <span className={`font-bold ${avgFoodCost > 30 ? 'text-warning' : 'text-success'}`}>
                {avgFoodCost}%
              </span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Inv. Value</span>
              <span className="font-bold text-primary">
                ${totalInventoryValue.toLocaleString()}
              </span>
           </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION (Action & Trends) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[340px]">
        
        {/* LEFT: ACTION REQUIRED */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-bold tracking-wide">ACTION REQUIRED</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
            Sorted by Urgency
          </p>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stockItems.slice(0, 5).map((item, index) => {
              const isCritical = item.days <= 2;
              return (
                <div key={item.id} className={`p-3 rounded-lg border ${isCritical ? 'bg-destructive/10 border-destructive/20' : 'bg-secondary/50 border-white/5'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <span className={`font-mono text-lg font-bold ${isCritical ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {index + 1}.
                      </span>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {item.name} 
                          {isCritical && <span className="bg-destructive text-white text-[9px] px-1.5 py-0.5 rounded uppercase">Order Now</span>}
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          <li className="text-xs text-muted-foreground flex items-center gap-1">
                            • Stockout in <span className={isCritical ? "text-destructive font-bold" : "text-foreground"}>{item.days.toFixed(1)} days</span>
                          </li>
                          <li className="text-xs text-muted-foreground">
                            • Suggest: {Math.ceil(item.parLevel - item.onHand)} units
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
             {stockItems.length === 0 && <div className="text-sm text-muted-foreground">No actions required.</div>}
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
              <span className="text-foreground">{getCurrentSelectionLabel()}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-primary/20 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {trendView === "ingredients" 
                  ? ingredients.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => handleSelectionChange(ing.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                          selectedIngredient === ing.id ? "bg-primary/20 text-primary font-semibold" : "text-foreground"
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
                          selectedDish === recipe.id ? "bg-primary/20 text-primary font-semibold" : "text-foreground"
                        }`}
                      >
                        {recipe.name}
                      </button>
                    ))
                }
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-h-0">
             <div className="h-full w-full bg-secondary/20 rounded-lg border border-white/5 p-4 pb-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={activeTrendData}
                    margin={{ top: 10, right: 15, left: 35, bottom: 25 }}
                  >
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
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
                      cursor={{ stroke: '#d946ef', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#d946ef"
                      strokeWidth={3}
                      fill="url(#trendGrad)"
                      animationDuration={1000}
                      dot={false}
                      activeDot={{ r: 5, fill: '#d946ef' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION (Copilot & Waste) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[280px]">
        
        {/* LEFT: TACO TALK */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative">
          <div className="flex items-center gap-2 mb-2 text-warning">
             <MessageSquare className="h-4 w-4" />
             <h2 className="font-bold text-sm tracking-wide">TacoTalk (AI Copilot)</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-sm">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.role === "user" ? "bg-primary/20 text-primary-foreground border border-primary/20" : "bg-secondary text-muted-foreground"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
             <p className="text-[10px] text-muted-foreground mb-2 italic">
               &ldquo;Bell animates while text streams&rdquo;
             </p>
             <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask about orders, waste, trends..."
                  className="flex-1 rounded-md border border-primary/20 bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
                <button onClick={handleChat} className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/20 text-primary hover:bg-primary/30">
                  <Send className="h-3 w-3" />
                </button>
             </div>
          </div>
        </div>

        {/* RIGHT: FOOD FOR THOUGHT (WASTE INDICATOR) */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
           <div className="flex items-center gap-2 mb-4 text-white">
             <UtensilsCrossed className="h-4 w-4" />
             <h2 className="font-bold text-sm tracking-wide">Food for Thought (Waste Indicator)</h2>
          </div>

          <div className="space-y-4">
             {/* Waste Metric 1 */}
             <div className="flex items-start gap-4">
                <div className="h-20 w-1 bg-destructive/50 rounded-full" />
                <div className="flex-1">
                   <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Potential Waste</p>
                   <p className="text-lg font-bold text-destructive">{bottomThree[0]?.name || "N/A"}</p>
                   <p className="text-xs text-muted-foreground">
                     {bottomThree[0] && `Only ${bottomThree[0].avgSales} sold/day with High Margin (${bottomThree[0].margin}%)`}
                   </p>
                </div>
             </div>

             {/* Waste Metric 2 */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-3 rounded-lg border border-white/5">
                   <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] uppercase text-muted-foreground">Cost of Waste</span>
                   </div>
                   <p className="text-xl font-bold text-foreground">$142<span className="text-xs font-normal text-muted-foreground">/wk</span></p>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg border border-white/5">
                   <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] uppercase text-muted-foreground">Trend</span>
                   </div>
                   <p className="text-xl font-bold text-success">-5%<span className="text-xs font-normal text-muted-foreground"> vs last wk</span></p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}