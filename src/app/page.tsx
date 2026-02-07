"use client";

import { useState } from "react";
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
  background: "#162418",
  border: "1px solid rgba(74,222,128,0.1)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#eef2e8",
};

export default function HomePage() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hey! I can help with inventory questions, menu analysis, and ordering suggestions. What do you need?",
    },
  ]);

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
      (sum, ing) => sum + (ing.dailyUsage[i] || 0),
      0
    );
    const totalValue = ingredients.reduce(
      (sum, ing) => sum + (ing.dailyUsage[i] || 0) * ing.costPerUnit,
      0
    );
    return {
      day: dayNames[i],
      usage: totalUsage,
      value: Math.round(totalValue),
    };
  });

  const lastWeekIngUsage = ingredientTrendData
    .slice(0, 7)
    .reduce((s, d) => s + d.usage, 0);
  const thisWeekIngUsage = ingredientTrendData
    .slice(7, 14)
    .reduce((s, d) => s + d.usage, 0);
  const ingChange =
    lastWeekIngUsage > 0
      ? Math.round(
          ((thisWeekIngUsage - lastWeekIngUsage) / lastWeekIngUsage) * 100
        )
      : 0;

  // Dish sales trend data
  const salesData = salesTrendData();
  const lastWeekSales = salesData.slice(0, 7);
  const thisWeekSales = salesData.slice(7, 14);
  const lastWeekTotal = lastWeekSales.reduce((s, d) => s + d.sales, 0);
  const thisWeekTotal = thisWeekSales.reduce((s, d) => s + d.sales, 0);
  const salesChange =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;

  const dishTrendData = salesData.map((d, i) => ({
    day: d.day,
    sales: d.sales,
    revenue: Math.round(d.revenue),
  }));

  // Top & bottom performing items
  const topSellers = topSellingItems();
  const topThree = topSellers.slice(0, 3);
  const bottomThree = topSellers.slice(-3).reverse();

  // Stock-sorted ingredients for visual display
  const stockItems = ingredients
    .map((i) => ({
      ...i,
      days: daysOfStock(i),
      avgUsage: avgDailyUsage(i.dailyUsage),
    }))
    .sort((a, b) => a.days - b.days);

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Simple bot response logic
    setTimeout(() => {
      let response = "Let me look into that for you.";
      const q = userMsg.toLowerCase();
      if (q.includes("low") || q.includes("stock") || q.includes("running")) {
        const lowItems = stockItems.filter((i) => i.days <= 3);
        response = `You have ${lowItems.length} items running low: ${lowItems
          .slice(0, 3)
          .map((i) => `${i.name} (${i.days}d)`)
          .join(", ")}${lowItems.length > 3 ? " and more." : "."}`;
      } else if (q.includes("top") || q.includes("best") || q.includes("seller")) {
        response = `Your top sellers are: ${topThree.map((t) => `${t.name} (${t.avgSales}/day)`).join(", ")}.`;
      } else if (q.includes("waste") || q.includes("loss")) {
        response =
          "Protein waste is your biggest loss category. Focus on FIFO rotation and smaller prep batches.";
      } else if (q.includes("order") || q.includes("buy")) {
        const critical = stockItems.filter((i) => i.days <= 1.5);
        response = critical.length
          ? `Urgent orders needed for: ${critical.map((i) => i.name).join(", ")}. Check the Orders tab for suggested quantities.`
          : "All stock levels look manageable. Check Orders for recommended restocking.";
      } else if (q.includes("cost") || q.includes("margin")) {
        const avgCost = Math.round(
          recipes.reduce((s, r) => s + foodCostPercent(r), 0) / recipes.length
        );
        response = `Average food cost is ${avgCost}%. ${avgCost > 30 ? "That's above the 30% target — review high-cost recipes." : "You're within the 30% target."}`;
      }
      setChatMessages((prev) => [...prev, { role: "bot", text: response }]);
    }, 600);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#7a9a7e]">
            Saturday, Feb 7 — Overview
          </p>
        </div>
        {/* Quick stats */}
        <div className="flex gap-4">
          <QuickPill label="Low Stock" value={`${stockItems.filter((i) => i.days <= 3).length} items`} color="text-[#f59e0b]" />
          <QuickPill label="This Week Sales" value={`${thisWeekTotal}`} color="text-[#4ade80]" />
          <QuickPill
            label="Avg Food Cost"
            value={`${Math.round(recipes.reduce((s, r) => s + foodCostPercent(r), 0) / recipes.length)}%`}
            color="text-[#a78bfa]"
          />
        </div>
      </div>

      {/* 2x2 Dashboard Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* TOP LEFT: Ingredient Usage Trend */}
        <div className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#4ade80]" />
              <h2 className="text-sm font-semibold">Ingredient Usage</h2>
            </div>
            <TrendBadge value={ingChange} />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingredientTrendData}>
                <defs>
                  <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#7a9a7e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#7a9a7e" }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === "value" ? `$${value}` : `${value} units`,
                    name === "value" ? "Cost" : "Usage",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#ingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Mini stock bars */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#7a9a7e]">
              Stock Levels
            </p>
            {stockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-28 truncate text-xs text-[#7a9a7e]">
                  {item.name.split(" ").slice(-2).join(" ")}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#1a2e1e] overflow-hidden">
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
                  className={`text-xs font-semibold w-8 text-right ${
                    item.days <= 1.5
                      ? "text-[#ef4444]"
                      : item.days <= 3
                      ? "text-[#f59e0b]"
                      : "text-[#4ade80]"
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
              <UtensilsCrossed className="h-4 w-4 text-[#a78bfa]" />
              <h2 className="text-sm font-semibold">Dish Sales</h2>
            </div>
            <TrendBadge value={salesChange} />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dishTrendData}>
                <defs>
                  <linearGradient id="dishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#7a9a7e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#7a9a7e" }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `$${value}` : `${value} sold`,
                    name === "revenue" ? "Revenue" : "Sales",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fill="url(#dishGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Per-dish breakdown */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#7a9a7e]">
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
                  <span className="w-32 truncate text-xs text-[#7a9a7e]">
                    {r.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#1a2e1e] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#a78bfa]"
                      style={{
                        width: `${Math.min(100, (todaySales / 120) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">
                    {todaySales}
                  </span>
                  <span
                    className={`text-[10px] w-10 text-right ${
                      change >= 0 ? "text-[#4ade80]" : "text-[#ef4444]"
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
            <TreePine className="h-4 w-4 text-[#4ade80]" />
            <h2 className="text-sm font-semibold">Food for Thought</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Top 3 */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#4ade80]">
                Top Sellers
              </p>
              <div className="space-y-3">
                {topThree.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-lg bg-[#4ade80]/5 p-3 border border-[#4ade80]/10"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4ade80]/15 text-xs font-bold text-[#4ade80]">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#7a9a7e]">
                          {item.avgSales}/day
                        </span>
                        <span className="text-[10px] text-[#4ade80]">
                          {item.margin}% margin
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#4ade80]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 3 */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#ef4444]">
                Needs Attention
              </p>
              <div className="space-y-3">
                {bottomThree.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-lg bg-[#ef4444]/5 p-3 border border-[#ef4444]/10"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ef4444]/15 text-xs font-bold text-[#ef4444]">
                      {topSellers.length - i}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#7a9a7e]">
                          {item.avgSales}/day
                        </span>
                        <span className="text-[10px] text-[#ef4444]">
                          {item.margin}% margin
                        </span>
                      </div>
                    </div>
                    <ArrowDownRight className="h-4 w-4 text-[#ef4444]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All stock visual overview */}
          <div className="mt-5 pt-4 border-t border-[#4ade80]/[0.06]">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-[#7a9a7e]">
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
                    className="rounded-lg bg-[#0d1a0f] p-2 text-center border border-[#4ade80]/[0.04]"
                  >
                    {/* Mini circle gauge */}
                    <div className="relative mx-auto mb-1 h-10 w-10">
                      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#1a2e1e"
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
                    <p className="text-[9px] text-[#7a9a7e] truncate">
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
            <MessageSquare className="h-4 w-4 text-[#4ade80]" />
            <h2 className="text-sm font-semibold">AI Assistant</h2>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[300px] max-h-[400px] pr-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#4ade80]/15 text-[#a7f3d0]"
                      : "bg-[#1a2e1e] text-[#d4e8d0]"
                  }`}
                >
                  {msg.text}
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
              placeholder="Ask about stock, sales, orders..."
              className="flex-1 rounded-lg border border-[#4ade80]/10 bg-[#0d1a0f] px-3 py-2 text-sm text-foreground placeholder:text-[#7a9a7e] focus:border-[#4ade80]/30 focus:outline-none"
            />
            <button
              onClick={handleChat}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4ade80]/15 text-[#4ade80] transition-colors hover:bg-[#4ade80]/25"
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
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isUp
          ? "bg-[#4ade80]/10 text-[#4ade80]"
          : "bg-[#ef4444]/10 text-[#ef4444]"
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
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#7a9a7e]">
        {label}
      </p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
