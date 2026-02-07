"use client";

import Link from "next/link";
import {
  ShoppingCart,
  AlertTriangle,
  ClipboardCheck,
  Truck,
  Package,
  Flame,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  TreePine,
} from "lucide-react";
import {
  ingredients,
  recipes,
  generateAlerts,
  daysOfStock,
  totalWasteToday,
  foodCostPercent,
  salesTrendData,
} from "@/lib/data";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function HomePage() {
  const alerts = generateAlerts();
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const wasteToday = totalWasteToday();
  const salesData = salesTrendData();

  const lowStockItems = ingredients
    .map((i) => ({ ...i, days: daysOfStock(i) }))
    .filter((i) => i.days <= 3)
    .sort((a, b) => a.days - b.days);

  const expiringItems = ingredients
    .filter((i) => {
      const d = Math.ceil(
        (new Date(i.expiryDate).getTime() - Date.now()) / 86400000
      );
      return d <= 3;
    })
    .length;

  const avgFoodCost = Math.round(
    recipes.reduce((s, r) => s + foodCostPercent(r), 0) / recipes.length
  );

  const totalDaysOfStock = Math.round(
    ingredients.reduce((s, i) => s + daysOfStock(i), 0) / ingredients.length * 10
  ) / 10;

  const actionCards = [
    {
      icon: ShoppingCart,
      color: "text-[#4ade80]",
      bg: "bg-[#4ade80]/10",
      border: "border-[#4ade80]/20",
      title: "Order supplies today",
      subtitle: `${lowStockItems.length} items running low`,
      href: "/orders",
      urgent: lowStockItems.length > 3,
    },
    {
      icon: AlertTriangle,
      color: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/20",
      title: `${expiringItems} items expiring soon`,
      subtitle: "Use first or discount today",
      href: "/inventory",
      urgent: expiringItems > 2,
    },
    {
      icon: ClipboardCheck,
      color: "text-[#34d399]",
      bg: "bg-[#34d399]/10",
      border: "border-[#34d399]/20",
      title: "Count walk-in items",
      subtitle: "Last count: yesterday 6pm",
      href: "/inventory",
      urgent: false,
    },
    {
      icon: Truck,
      color: "text-[#60a5fa]",
      bg: "bg-[#60a5fa]/10",
      border: "border-[#60a5fa]/20",
      title: "Delivery arriving",
      subtitle: "Sherwood Meats — estimated 2pm",
      href: "/orders",
      urgent: false,
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-[#4ade80]" />
            <h1 className="text-xl font-bold tracking-tight">
              Taco Spell
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-[#7a9a7e]">
            Saturday, Feb 7 — Daily Overview
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4ade80] to-[#16a34a] text-sm font-bold text-white shadow-lg shadow-[#4ade80]/20">
          TS
        </div>
      </div>

      {/* Critical banner */}
      {criticalAlerts.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <Flame className="h-4 w-4" />
            {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? "s" : ""} need attention
          </div>
          <p className="mt-1 text-xs text-red-300/70">
            {criticalAlerts[0].title}
            {criticalAlerts.length > 1 && ` and ${criticalAlerts.length - 1} more`}
          </p>
        </div>
      )}

      {/* Quick stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <QuickStat
          label="Avg Stock"
          value={`${totalDaysOfStock}d`}
          trend={totalDaysOfStock > 4 ? "up" : "down"}
          color={totalDaysOfStock > 4 ? "text-[#4ade80]" : "text-[#f59e0b]"}
        />
        <QuickStat
          label="Food Cost"
          value={`${avgFoodCost}%`}
          trend={avgFoodCost < 32 ? "up" : "down"}
          color={avgFoodCost < 32 ? "text-[#4ade80]" : "text-[#f59e0b]"}
        />
        <QuickStat
          label="Waste Today"
          value={`$${wasteToday.toFixed(0)}`}
          trend="down"
          color="text-[#ef4444]"
        />
      </div>

      {/* Mini sales chart */}
      <div className="glass-card mb-5 rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-[#7a9a7e]">
            Weekly Sales Trend
          </span>
          <Link
            href="/insights"
            className="text-xs text-[#4ade80] hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#162418",
                  border: "1px solid rgba(74,222,128,0.1)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "#eef2e8",
                }}
                formatter={(value: number) => [`${value} items`, "Sales"]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action cards */}
      <div className="mb-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#7a9a7e]">
          <TreePine className="h-3.5 w-3.5 text-[#4ade80]" />
          TODAY&apos;S TASKS
        </h2>
        <div className="space-y-3">
          {actionCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className={`glass-card glow-hover flex items-center gap-4 rounded-xl p-4 transition-all active:scale-[0.98] ${
                card.urgent ? "animate-pulse-glow" : ""
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
                animation: `float-up 0.4s ease-out ${i * 0.08}s forwards${
                  card.urgent ? ", pulse-glow 3s ease-in-out infinite" : ""
                }`,
              }}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.border} border`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {card.title}
                </p>
                <p className="text-xs text-[#7a9a7e]">{card.subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#7a9a7e]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Low stock items */}
      {lowStockItems.length > 0 && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#7a9a7e]">
              <Package className="h-3.5 w-3.5 text-[#f59e0b]" />
              LOW STOCK WARNINGS
            </h2>
            <Link
              href="/inventory"
              className="text-xs text-[#4ade80] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/inventory/${item.id}`}
                className="glass-card flex items-center justify-between rounded-lg px-4 py-3 transition-all active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-[#7a9a7e]">
                    {item.onHand} {item.unit} left
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold ${
                      item.days <= 1.5
                        ? "text-[#ef4444]"
                        : "text-[#f59e0b]"
                    }`}
                  >
                    {item.days}d
                  </span>
                  <p className="text-[10px] text-[#7a9a7e]">remaining</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string;
  trend: "up" | "down";
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl px-3 py-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#7a9a7e]">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
      <div className="mt-0.5 flex items-center justify-center gap-0.5">
        {trend === "up" ? (
          <ArrowUp className="h-3 w-3 text-[#4ade80]" />
        ) : (
          <ArrowDown className="h-3 w-3 text-[#ef4444]" />
        )}
        <span className="text-[10px] text-[#7a9a7e]">vs last wk</span>
      </div>
    </div>
  );
}
