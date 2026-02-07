"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Sparkles,
  DollarSign,
  Trash2,
  Award,
  BarChart3,
} from "lucide-react";
import {
  getRecipes,
  getIngredients,
  getWasteEntries,
  salesTrendData,
  wasteByCategory,
  topSellingItems,
  foodCostPercent,
  totalWasteToday,
  type Recipe,
  type Ingredient,
  type WasteEntry,
} from "@/lib/data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLORS = ["#d946ef", "#4ade80", "#f59e0b", "#f472b6", "#60a5fa"];

export default function InsightsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rec, ing, waste] = await Promise.all([
          getRecipes(),
          getIngredients(),
          getWasteEntries(),
        ]);
        setRecipes(rec);
        setIngredients(ing);
        setWasteEntries(waste);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading analytics...</p>
      </div>
    );
  }

  const salesData = salesTrendData(recipes);
  // Split into last week vs this week for comparison
  const lastWeekSales = salesData.slice(0, 7);
  const thisWeekSales = salesData.slice(7, 14);

  // Calculate week-over-week change
  const lastWeekTotal = lastWeekSales.reduce((s, d) => s + d.sales, 0);
  const thisWeekTotal = thisWeekSales.reduce((s, d) => s + d.sales, 0);
  const weekChange = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;

  // Build combined chart data with both weeks
  const salesChartData = thisWeekSales.map((d, i) => ({
    day: d.day,
    thisWeek: d.sales,
    lastWeek: lastWeekSales[i]?.sales || 0,
  }));
  const wasteData = wasteByCategory(wasteEntries, ingredients);
  const topSellers = topSellingItems(recipes, ingredients);
  const totalWaste = wasteEntries.reduce((s, w) => s + w.costLost, 0);
  const wasteToday = totalWasteToday(wasteEntries);

  const avgFoodCost = Math.round(
    recipes.reduce((s, r) => s + foodCostPercent(r, ingredients), 0) / recipes.length || 0
  );

  const totalWeeklyRevenue = thisWeekSales.reduce((s, d) => s + d.revenue, 0);
  const totalWeeklySales = thisWeekTotal;

  const marginData = recipes.map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + "..." : r.name,
    margin: 100 - foodCostPercent(r, ingredients),
    cost: foodCostPercent(r, ingredients),
  })).sort((a, b) => b.margin - a.margin);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Insights and trends to improve your bottom line
        </p>
      </div>

      {/* Key metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <MetricCard
          icon={<DollarSign className="h-4 w-4 text-success" />}
          label="Weekly Revenue"
          value={`$${(totalWeeklyRevenue / 1000).toFixed(1)}k`}
          subtext={`${totalWeeklySales} items sold`}
          color="text-success"
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
          label="Avg Food Cost"
          value={`${avgFoodCost}%`}
          subtext={avgFoodCost < 30 ? "Below target" : "Above target"}
          color={avgFoodCost < 30 ? "text-success" : "text-warning"}
        />
        <MetricCard
          icon={<Trash2 className="h-4 w-4 text-destructive" />}
          label="Total Waste"
          value={`$${totalWaste.toFixed(0)}`}
          subtext={`$${wasteToday.toFixed(0)} today`}
          color="text-destructive"
        />
        <MetricCard
          icon={<Award className="h-4 w-4 text-warning" />}
          label="Top Seller"
          value={topSellers[0]?.name.split(" ")[0] || "N/A"}
          subtext={`${topSellers[0]?.avgSales || 0}/day avg`}
          color="text-warning"
        />
      </div>

      {/* Sales trend chart */}
      <InsightCard
        title="Sales Trend"
        insight={`Sales ${weekChange >= 0 ? "up" : "down"} ${Math.abs(weekChange)}% vs last week. ${weekChange > 15 ? "Strong growth — increase prep and stock." : weekChange > 0 ? "Steady climb — keep current ordering pace." : "Demand dropping — review specials and reduce orders."}`}
      >
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lastWeekG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d8b4fe" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#d8b4fe" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#d8b4fe" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v?: number, name?: string) => [
                  `${v || 0} items`,
                  name === "thisWeek" ? "This Week" : "Last Week",
                ]}
              />
              <Area
                type="monotone"
                dataKey="lastWeek"
                stroke="#d8b4fe"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="url(#lastWeekG)"
              />
              <Area
                type="monotone"
                dataKey="thisWeek"
                stroke="#d946ef"
                strokeWidth={2.5}
                fill="url(#salesG)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-primary" /> This week
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded border-t border-dashed border-muted-foreground" /> Last week
          </span>
          <span className={`ml-auto font-semibold ${weekChange >= 0 ? "text-success" : "text-destructive"}`}>
            {weekChange >= 0 ? "+" : ""}{weekChange}% WoW
          </span>
        </div>
      </InsightCard>

      {/* Margin analysis */}
      <InsightCard
        title="Margin Analysis"
        insight={`${marginData[marginData.length - 1]?.name} has the lowest margin — review recipe costs.`}
      >
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marginData} layout="vertical">
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#d8b4fe" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: "#d8b4fe" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v?: number) => [`${(v || 0).toFixed(0)}%`]}
              />
              <Bar
                dataKey="margin"
                fill="#4ade80"
                radius={[0, 4, 4, 0]}
                opacity={0.8}
                name="Margin"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Waste hotspots */}
      <InsightCard
        title="Waste Hotspots"
        insight="Protein waste is your top loss category — tighter inventory and FIFO rotation recommended."
      >
        <div className="flex items-center gap-4">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="cost"
                >
                  {wasteData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v?: number) => [`$${(v || 0).toFixed(2)}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {wasteData.map((item, i) => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.category}
                </span>
                <span className="text-xs font-medium">
                  ${item.cost.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </InsightCard>

      {/* Top sellers */}
      <InsightCard
        title="Best Sellers"
        insight="Classic Burger drives the most volume — ensure consistent supply chain."
      >
        <div className="space-y-2.5">
          {topSellers.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold">{item.avgSales}/day</span>
                <p className="text-[10px] text-success">{item.margin}% margin</p>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>
    </div>
  );
}

const tooltipStyle = {
  background: "#2e1065",
  border: "1px solid rgba(217,70,239,0.2)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#ffffff",
};

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{subtext}</p>
    </div>
  );
}

function InsightCard({
  title,
  insight,
  children,
}: {
  title: string;
  insight: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card mb-5 rounded-xl p-4">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <p className="mb-4 text-sm text-foreground/70">{insight}</p>
      {children}
    </div>
  );
}
