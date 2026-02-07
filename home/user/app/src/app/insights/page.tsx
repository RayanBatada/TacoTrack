"use client";

import {
  TrendingUp,
  Sparkles,
  DollarSign,
  Trash2,
  Award,
  BarChart3,
} from "lucide-react";
import {
  salesTrendData,
  wasteByCategory,
  topSellingItems,
  recipes,
  ingredients,
  foodCostPercent,
  totalWasteToday,
  wasteEntries,
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

const COLORS = ["#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];

export default function InsightsPage() {
  const salesData = salesTrendData();
  const wasteData = wasteByCategory();
  const topSellers = topSellingItems();
  const totalWaste = wasteEntries.reduce((s, w) => s + w.costLost, 0);
  const wasteToday = totalWasteToday();

  const avgFoodCost = Math.round(
    recipes.reduce((s, r) => s + foodCostPercent(r), 0) / recipes.length
  );

  const totalWeeklyRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalWeeklySales = salesData.reduce((s, d) => s + d.sales, 0);

  const marginData = recipes.map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + "..." : r.name,
    margin: 100 - foodCostPercent(r),
    cost: foodCostPercent(r),
  })).sort((a, b) => b.margin - a.margin);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#a78bfa]" />
          <h1 className="text-xl font-bold tracking-tight">Crystal Ball</h1>
        </div>
        <p className="mt-0.5 text-sm text-[#8888a0]">
          Insights and trends to improve your bottom line
        </p>
      </div>

      {/* Key metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <MetricCard
          icon={<DollarSign className="h-4 w-4 text-[#34d399]" />}
          label="Weekly Revenue"
          value={`$${(totalWeeklyRevenue / 1000).toFixed(1)}k`}
          subtext={`${totalWeeklySales} items sold`}
          color="text-[#34d399]"
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4 text-[#a78bfa]" />}
          label="Avg Food Cost"
          value={`${avgFoodCost}%`}
          subtext={avgFoodCost < 30 ? "Below target" : "Above target"}
          color={avgFoodCost < 30 ? "text-[#34d399]" : "text-[#fbbf24]"}
        />
        <MetricCard
          icon={<Trash2 className="h-4 w-4 text-[#ef4444]" />}
          label="Total Waste"
          value={`$${totalWaste.toFixed(0)}`}
          subtext={`$${wasteToday.toFixed(0)} today`}
          color="text-[#ef4444]"
        />
        <MetricCard
          icon={<Award className="h-4 w-4 text-[#fbbf24]" />}
          label="Top Seller"
          value={topSellers[0]?.name.split(" ")[0] || "N/A"}
          subtext={`${topSellers[0]?.avgSales || 0}/day avg`}
          color="text-[#fbbf24]"
        />
      </div>

      {/* Sales trend chart */}
      <InsightCard
        title="Sales Trend"
        insight="Weekend sales are consistently higher — consider increasing prep on Fridays."
      >
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#8888a0" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} items`, "Sales"]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#salesG)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
                tick={{ fontSize: 10, fill: "#8888a0" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: "#8888a0" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`]}
              />
              <Bar
                dataKey="margin"
                fill="#34d399"
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
                  formatter={(v: number) => [`$${v.toFixed(2)}`]}
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
                <span className="text-xs text-[#8888a0]">
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#a78bfa]/10 text-xs font-bold text-[#a78bfa]">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold">{item.avgSales}/day</span>
                <p className="text-[10px] text-[#34d399]">{item.margin}% margin</p>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>
    </div>
  );
}

const tooltipStyle = {
  background: "#1a1a28",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#f0f0f5",
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
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#8888a0]">
          {label}
        </span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-[#8888a0]">{subtext}</p>
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
        <Sparkles className="h-3.5 w-3.5 text-[#a78bfa]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8888a0]">
          {title}
        </span>
      </div>
      <p className="mb-4 text-sm text-foreground/70">{insight}</p>
      {children}
    </div>
  );
}
