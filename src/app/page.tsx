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
import ReactMarkdown from "react-markdown"; // For rendering AI chat messages with formatting
import remarkGfm from "remark-gfm"; // Adds support for tables, strikethrough, etc. in markdown
import { chatWithGemini } from "./actions"; // Our AI chat function

// Icons from lucide-react library
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
  background: "#2e1065", // Deep purple background
  border: "1px solid rgba(217, 70, 239, 0.2)", // Subtle pink border
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // All ingredients
  const [recipes, setRecipes] = useState<Recipe[]>([]); // All recipes/dishes
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]); // Waste records
  const [loading, setLoading] = useState(true); // Are we still loading data?

  // AI CHATBOT STATE
  const [chatInput, setChatInput] = useState(""); // What user is typing
  const [chatMessages, setChatMessages] = useState<
    {
      role: "user" | "bot"; // Who sent the message
      text: string; // Message content
    }[]
  >([
    {
      role: "bot",
      text: "Hola! I'm Taco Talk. 🌮 specialized in spicy inventory management. How can I help?",
    },
  ]);

  // TRENDS GRAPH STATE
  const [trendView, setTrendView] = useState<"ingredients" | "dishes">(
    "ingredients", // Are we showing ingredient trends or dish trends?
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string>(""); // Which ingredient is selected
  const [selectedDish, setSelectedDish] = useState<string>(""); // Which dish is selected
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Is the dropdown menu open?
  
  // REFERENCE FOR AUTO-SCROLLING CHAT
  const messagesEndRef = useRef<HTMLDivElement>(null); // Points to bottom of chat

  // ===========================================================================
  // AUTO-SCROLL FUNCTION - Keeps chat scrolled to bottom
  // ===========================================================================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // ===========================================================================
  // FETCH DATA ON PAGE LOAD - Get all data from database
  // ===========================================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all three types of data at once
        const [ing, rec, waste] = await Promise.all([
          getIngredients(),
          getRecipes(),
          getWasteEntries(),
        ]);
        
        // Save data to state
        setIngredients(ing);
        setRecipes(rec);
        setWasteEntries(waste);

        // Set default selections for dropdowns
        if (ing.length > 0) setSelectedIngredient(ing[0].id);
        if (rec.length > 0) setSelectedDish(rec[0].id);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false); // Done loading
      }
    };
    loadData();
  }, []); // Empty array means run once when page loads

  // ===========================================================================
  // DATA CALCULATIONS - Process raw data for display
  // ===========================================================================

  // STOCK ITEMS - Add calculated fields to each ingredient
  const stockItems = ingredients
    .map((i) => ({
      ...i, // Keep all original fields
      days: daysOfStock(i), // How many days until we run out
      avgUsage: avgDailyUsage(i.dailyUsage || []), // Average daily usage
      value: i.onHand * i.costPerUnit, // Total value of stock
      suggestedQty: suggestedOrderQty(i), // How much to order
    }))
    .sort((a, b) => a.days - b.days); // Sort by urgency (lowest days first)

  // CRITICAL & WATCH ITEMS - Filter by urgency
  const criticalItems = stockItems.filter((i) => i.days <= 2); // Need to order NOW
  const watchItems = stockItems.filter((i) => i.days > 2 && i.days <= 4); // Need to order soon

  // SYSTEM STATUS - Overall health of inventory
  const systemStatus =
    criticalItems.length > 0
      ? "Critical" // Red alert
      : watchItems.length > 0
        ? "Watch" // Yellow warning
        : "Healthy"; // Green, all good
        
  // Status color for UI
  const statusColor =
    systemStatus === "Critical"
      ? "text-destructive" // Red
      : systemStatus === "Watch"
        ? "text-warning" // Yellow
        : "text-success"; // Green
        
  // Status icon
  const StatusIcon =
    systemStatus === "Critical"
      ? AlertOctagon
      : systemStatus === "Watch"
        ? AlertTriangle
        : CheckCircle2;

  // KPI CALCULATIONS - Key performance indicators
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

  // Get trend data for a specific ingredient
  const getIngredientTrendData = (ingredientId: string) => {
    const ingredient = ingredients.find((ing) => ing.id === ingredientId);
    return Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      value: ingredient?.dailyUsage?.[i] || 0, // Usage for each day
      type: "Usage",
    }));
  };

  // Get trend data for a specific dish
  const getDishTrendData = (dishId: string) => {
    const dish = recipes.find((r) => r.id === dishId);
    if (!dish || !dish.dailySales) return [];

    return Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      value: dish.dailySales[i] || 0, // Sales for each day
      type: "Sales",
    }));
  };

  // Data to display in the graph (based on what user selected)
  const activeTrendData =
    trendView === "ingredients"
      ? getIngredientTrendData(selectedIngredient)
      : getDishTrendData(selectedDish);

  // Get the name of currently selected item for dropdown display
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
  
  // Top/Bottom selling items
  const topSellers = topSellingItems(recipes, ingredients);
  const bottomThree = topSellers.slice(-3).reverse(); // Items with lowest sales

  // Group waste by category (produce, protein, dairy, etc.)
  const wasteByCategory = wasteEntries.reduce(
    (acc: Record<string, number>, w) => {
      const ing = ingredients.find((i) => i.id === w.ingredientId);
      const cat = ing?.category || "Other";
      acc[cat] = (acc[cat] || 0) + w.costLost; // Add up costs by category
      return acc;
    },
    {},
  );

  // Convert to array for pie chart
  const wasteChartData = Object.entries(wasteByCategory).map(
    ([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100, // Round to 2 decimals
    }),
  );

  // Colors for pie chart slices
  const WASTE_COLORS = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#84cc16", // Lime
    "#22c55e", // Green
    "#06b6d4", // Cyan
  ];

  // ===========================================================================
  // EVENT HANDLERS - What happens when user interacts
  // ===========================================================================

  // CHAT HANDLER - When user sends a message
  const handleChat = async () => {
    if (!chatInput.trim()) return; // Don't send empty messages
    const userMsg = chatInput.trim();

    // Clear input and show user's message
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Show "thinking" message
    setChatMessages((prev) => [
      ...prev,
      { role: "bot", text: "Consulting the inventory..." },
    ]);

    // Call AI and get response
    try {
      const response = await chatWithGemini(userMsg);
      setChatMessages((prev) => {
        const history = [...prev];
        history.pop(); // Remove "thinking" message
        return [...history, { role: "bot", text: response }]; // Add real response
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

  // TREND VIEW TOGGLE - Switch between ingredients and dishes
  const handleTrendViewChange = (view: "ingredients" | "dishes") => {
    setTrendView(view);
    // Reset selection to first item
    if (view === "ingredients" && ingredients.length > 0) {
      setSelectedIngredient(ingredients[0].id);
    } else if (view === "dishes" && recipes.length > 0) {
      setSelectedDish(recipes[0].id);
    }
    setIsDropdownOpen(false);
  };

  // DROPDOWN SELECTION - When user picks an item from dropdown
  const handleSelectionChange = (id: string) => {
    if (trendView === "ingredients") {
      setSelectedIngredient(id);
    } else {
      setSelectedDish(id);
    }
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
      
      {/* =====================================================================
          TOP SECTION - Action Required & Trends
          Two columns side by side, 460px tall
      ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[460px]">
        
        {/* ===================================================================
            LEFT COLUMN - ACTION REQUIRED TABLE
            Shows ingredients that need to be ordered, sorted by urgency
        =================================================================== */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative overflow-hidden">
          
          {/* Header with warning icon */}
          <div className="flex items-center gap-2 mb-4 text-white">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-bold tracking-wide">ACTION REQUIRED</h2>
          </div>

          {/* Table column headers */}
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

          {/* Divider line */}
          <div className="border-t border-white/10 mb-3" />

          {/* Scrollable table rows - shows top 5 items */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-2">
            {stockItems.slice(0, 5).map((item) => {
              const isCritical = item.days <= 2; // Less than 2 days = critical
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-3 gap-4 px-3 py-3.5 rounded-lg border transition-colors ${
                    isCritical
                      ? "bg-destructive/10 border-destructive/20" // Red background if critical
                      : "bg-secondary/30 border-white/5 hover:bg-secondary/50" // Normal background
                  }`}
                >
                  {/* Column 1: Product name */}
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </p>
                      {/* "Order Now" badge if critical */}
                      {isCritical && (
                        <span className="inline-block mt-2 bg-destructive text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                          Order Now
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Quantity needed */}
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-white">
                      {item.suggestedQty} {item.unit}
                    </span>
                  </div>

                  {/* Column 3: Days until stockout */}
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
            
            {/* Show message if no items need ordering */}
            {stockItems.length === 0 && (
              <div className="text-sm text-white/60 text-center py-4">
                No actions required.
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN - TRENDS GRAPH
            Line graph showing usage or sales over 7 days
        =================================================================== */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          
          {/* Header with toggle buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-bold tracking-wide">TRENDS</h2>
            </div>

            {/* Toggle between Ingredients and Dishes */}
            <div className="flex bg-secondary rounded-lg p-1 border border-primary/20">
              <button
                onClick={() => handleTrendViewChange("ingredients")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  trendView === "ingredients" 
                    ? "bg-primary text-white shadow-sm" // Active state
                    : "text-muted-foreground hover:text-foreground" // Inactive state
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

          {/* Dropdown to select specific ingredient or dish */}
          <div className="mb-3 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
            >
              <span className="text-foreground">
                {getCurrentSelectionLabel()}
              </span>
              {/* Arrow icon that rotates when open */}
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu (only visible when open) */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-primary/20 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {trendView === "ingredients"
                  ? // Show all ingredients
                    ingredients.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => handleSelectionChange(ing.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                          selectedIngredient === ing.id
                            ? "bg-primary/20 text-primary font-semibold" // Highlight selected
                            : "text-foreground"
                        }`}
                      >
                        {ing.name}
                      </button>
                    ))
                  : // Show all dishes
                    recipes.map((recipe) => (
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

          {/* The actual line graph */}
          <div className="flex-1 w-full min-h-0">
            <div className="h-full w-full bg-secondary/20 rounded-lg border border-white/5 p-0 relative">
              {activeTrendData && activeTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeTrendData}
                    margin={{ top: 5, right: 10, left: 30, bottom: 20 }}
                  >
                    {/* Gradient fill for area under line */}
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
                          stopColor="#d946ef" // Magenta at top
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#d946ef"
                          stopOpacity={0} // Fade to transparent at bottom
                        />
                      </linearGradient>
                    </defs>
                    
                    {/* X-axis (days of week) */}
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0} // Show all days
                      height={45}
                      padding={{ left: 10, right: 10 }}
                    />
                    
                    {/* Y-axis (values) */}
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    
                    {/* Tooltip on hover */}
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: "#d946ef", strokeWidth: 1 }}
                    />
                    
                    {/* The line and area */}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#d946ef" // Magenta line
                      strokeWidth={3}
                      fill="url(#trendGrad)" // Gradient fill
                      animationDuration={1000}
                      dot={false} // No dots on line
                      activeDot={{ r: 5, fill: "#d946ef" }} // Dot appears on hover
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                // Show message if no data
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No trend data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM SECTION - TacoTalk AI Chat & Waste Indicator
          Two columns side by side, 280px tall
      ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[280px]">
        
        {/* ===================================================================
            LEFT COLUMN - TACOTALK AI CHATBOT
            Chat interface for asking questions about inventory
        =================================================================== */}
        <div className="glass-card rounded-xl p-5 flex flex-col relative h-full min-h-0">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 text-warning shrink-0">
            <MessageSquare className="h-4 w-4" />
            <h2 className="font-bold text-sm tracking-wide text-[15px]">
              TacoTalk AI
            </h2>
          </div>

          {/* Chat messages - scrollable area */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-sm min-h-0">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" 
                    ? "justify-end" // User messages on right
                    : "justify-start" // Bot messages on left
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === "user"
                      ? "bg-primary/20 text-primary-foreground border border-primary/20" // User bubble
                      : "bg-secondary text-muted-foreground" // Bot bubble
                  } prose prose-sm prose-invert max-w-none break-words`}
                >
                  {/* Render message with markdown support */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {/* Invisible div at bottom for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area at bottom */}
          <div className="mt-auto">
            <div className="flex gap-2">
              {/* Text input */}
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()} // Send on Enter key
                placeholder="Ask Taco Talk..."
                className="flex-1 rounded-md border border-primary/20 bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              {/* Send button */}
              <button
                onClick={handleChat}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/20 text-primary hover:bg-primary/30"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN - FOOD FOR THOUGHT (Waste Indicator)
            Shows top waste item, total waste cost, and pie chart breakdown
        =================================================================== */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 text-white">
            <UtensilsCrossed className="h-4 w-4" />
            <h2 className="font-bold text-sm tracking-wide text-[15px]">
              FOOD FOR THOUGHT
            </h2>
          </div>

          {/* Two-column layout: Info boxes on left, pie chart on right */}
          <div className="flex gap-3 flex-1 min-h-0">
            
            {/* LEFT SIDE - Top waste item and total cost */}
            <div className="w-[45%] flex flex-col gap-3">
              
              {/* Top waste item box */}
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

              {/* Total waste cost box */}
              <div className="bg-secondary/30 p-3 rounded-lg border border-white/5 flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Total/wk
                </p>
                <p className="text-2xl font-bold text-foreground">
                  $
                  {wasteEntries
                    .reduce((s, w) => s + w.costLost, 0)
                    .toFixed(0)}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE - Pie chart with legend on the right */}
            {wasteChartData.length > 0 && (
              <div className="flex-1 flex items-center justify-center gap-3">
                
                {/* Pie chart */}
                <div className="w-[55%] h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteChartData}
                        cx="50%" // Center horizontally
                        cy="50%" // Center vertically
                        innerRadius={32} // Size of donut hole
                        outerRadius={62} // Outer edge of donut
                        paddingAngle={2} // Space between slices
                        dataKey="value"
                        isAnimationActive={false} // No animation for cleaner look
                        stroke="#ffffff" // Color of stroke
                        strokeWidth={1.5} // Width of stroke
                      >
                        {/* Color each slice */}
                        {wasteChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={WASTE_COLORS[index % WASTE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      {/* Tooltip shows dollar amount when clicked */}
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend on the right side */}
                <div className="flex flex-col gap-2 justify-center text-[15px]">
                  {wasteChartData.map((item, idx) => (
                    <div
                      key={item.name.toUpperCase()}
                      className="flex items-center gap-2"
                    >
                      {/* Color dot */}
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            WASTE_COLORS[idx % WASTE_COLORS.length],
                        }}
                      />
                      {/* Category name and percentage */}
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