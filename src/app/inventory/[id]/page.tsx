"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingDown,
  Calendar,
  MapPin,
  Truck,
  DollarSign,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  ingredients,
  daysOfStock,
  urgencyLevel,
  daysUntilExpiry,
  suggestedOrderQty,
  avgDailyUsage,
  burndownData,
  weeklyUsageData,
} from "@/lib/data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

export default function IngredientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ingredient = ingredients.find((i) => i.id === id);

  if (!ingredient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#8888a0]" />
          <p className="text-sm text-[#8888a0]">Ingredient not found</p>
          <Link
            href="/inventory"
            className="mt-3 inline-block text-sm text-[#a78bfa] hover:underline"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const days = daysOfStock(ingredient);
  const urgency = urgencyLevel(ingredient);
  const expDays = daysUntilExpiry(ingredient);
  const orderQty = suggestedOrderQty(ingredient);
  const avgUsage = avgDailyUsage(ingredient.dailyUsage);
  const burndown = burndownData(ingredient);
  const weeklyUsage = weeklyUsageData(ingredient);

  const urgencyColor =
    urgency === "critical"
      ? "#ef4444"
      : urgency === "warning"
      ? "#fbbf24"
      : "#34d399";

  return (
    <div className="p-6 max-w-4xl">
      {/* Back button */}
      <Link
        href="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#8888a0] hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Stock Vault
      </Link>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{ingredient.name}</h1>
            <p className="mt-0.5 text-sm text-[#8888a0]">
              {ingredient.category} · {ingredient.vendor}
            </p>
          </div>
          <div
            className="rounded-lg px-3 py-1.5 text-center"
            style={{
              background: `${urgencyColor}15`,
              border: `1px solid ${urgencyColor}30`,
            }}
          >
            <span
              className="text-lg font-bold"
              style={{ color: urgencyColor }}
            >
              {days}d
            </span>
            <p className="text-[10px]" style={{ color: `${urgencyColor}cc` }}>
              remaining
            </p>
          </div>
        </div>
      </div>

      {/* Key stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard
          icon={<Package2Icon />}
          label="On Hand"
          value={`${ingredient.onHand} ${ingredient.unit}`}
        />
        <StatCard
          icon={<TrendingDown className="h-4 w-4 text-[#a78bfa]" />}
          label="Avg Usage"
          value={`${Math.round(avgUsage * 10) / 10}/${ingredient.unit.slice(0, 2)}`}
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4 text-[#34d399]" />}
          label="Unit Cost"
          value={`$${ingredient.costPerUnit.toFixed(2)}`}
        />
      </div>

      {/* Burn-down chart - like Robinhood */}
      <div className="glass-card mb-5 rounded-xl p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[#8888a0]">
            Stock Forecast
          </span>
          <span className="text-xs text-[#8888a0]">7-day projection</span>
        </div>
        <p className="mb-3 text-sm text-foreground/70">
          {days <= 2
            ? `You'll run out in ${days} days — cast a reorder spell`
            : days <= 4
            ? `Stock declining — consider ordering soon`
            : `Inventory looks stable for the week`}
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burndown}>
              <defs>
                <linearGradient id={`bd-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={urgencyColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={urgencyColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#8888a0" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8888a0" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a28",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "#f0f0f5",
                }}
                formatter={(v?: number) => [`${v ?? 0} ${ingredient.unit}`, "Stock"]}
              />
              <ReferenceLine
                y={0}
                stroke="#ef4444"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="stock"
                stroke={urgencyColor}
                strokeWidth={2}
                fill={`url(#bd-${id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly usage chart */}
      <div className="glass-card mb-5 rounded-xl p-4">
        <span className="text-xs font-medium text-[#8888a0]">
          Weekly Usage Pattern
        </span>
        <div className="mt-3 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyUsage}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#8888a0" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#1a1a28",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "#f0f0f5",
                }}
                formatter={(v?: number) => [`${v ?? 0} ${ingredient.unit}`, "Used"]}
              />
              <Bar
                dataKey="usage"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details grid */}
      <div className="mb-5 space-y-2">
        <DetailRow
          icon={<MapPin className="h-4 w-4 text-[#8888a0]" />}
          label="Storage"
          value={ingredient.storageLocation}
        />
        <DetailRow
          icon={<Calendar className="h-4 w-4 text-[#8888a0]" />}
          label="Expires"
          value={`${ingredient.expiryDate} (${expDays}d)`}
          valueColor={expDays <= 2 ? "#ef4444" : expDays <= 4 ? "#fbbf24" : undefined}
        />
        <DetailRow
          icon={<Truck className="h-4 w-4 text-[#8888a0]" />}
          label="Last Delivery"
          value={ingredient.lastDelivery}
        />
        <DetailRow
          icon={<Clock className="h-4 w-4 text-[#8888a0]" />}
          label="Lead Time"
          value={`${ingredient.leadTimeDays} days`}
        />
      </div>

      {/* Order CTA */}
      {orderQty > 0 && (
        <Link
          href="/orders"
          className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 transition-all active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          Order {orderQty} {ingredient.unit} from {ingredient.vendor}
        </Link>
      )}
    </div>
  );
}

function Package2Icon() {
  return (
    <svg
      className="h-4 w-4 text-[#fbbf24]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-xl px-3 py-3 text-center">
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#8888a0]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="glass-card flex items-center justify-between rounded-lg px-4 py-2.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-[#8888a0]">{label}</span>
      </div>
      <span
        className="text-sm font-medium"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
