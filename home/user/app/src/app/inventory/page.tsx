"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Sparkles,
  ChevronRight,
  ScanBarcode,
} from "lucide-react";
import {
  ingredients,
  daysOfStock,
  urgencyLevel,
  daysUntilExpiry,
} from "@/lib/data";

type SortMode = "urgency" | "name" | "expiry";
type FilterCategory = "all" | "protein" | "dairy" | "produce" | "dry-goods" | "other";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("urgency");
  const [category, setCategory] = useState<FilterCategory>("all");

  const items = ingredients
    .map((i) => ({
      ...i,
      days: daysOfStock(i),
      urgency: urgencyLevel(i),
      expDays: daysUntilExpiry(i),
    }))
    .filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "all" || i.category === category)
    )
    .sort((a, b) => {
      if (sort === "urgency") return a.days - b.days;
      if (sort === "expiry") return a.expDays - b.expDays;
      return a.name.localeCompare(b.name);
    });

  const categories: { value: FilterCategory; label: string }[] = [
    { value: "all", label: "All" },
    { value: "protein", label: "Protein" },
    { value: "dairy", label: "Dairy" },
    { value: "produce", label: "Produce" },
    { value: "dry-goods", label: "Dry Goods" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#a78bfa]" />
            <h1 className="text-xl font-bold tracking-tight">Stock Vault</h1>
          </div>
          <p className="mt-0.5 text-sm text-[#8888a0]">
            {ingredients.length} ingredients tracked
          </p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-[#1a1a28] transition-colors hover:bg-[#252535]">
          <ScanBarcode className="h-5 w-5 text-[#a78bfa]" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888a0]" />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a28] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-[#8888a0] focus:border-[#a78bfa]/40 focus:outline-none focus:ring-1 focus:ring-[#a78bfa]/30"
        />
      </div>

      {/* Category pills */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              category === cat.value
                ? "bg-[#a78bfa] text-[#0a0a0f]"
                : "bg-[#1a1a28] text-[#8888a0] hover:bg-[#252535]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-[#1a1a28] p-0.5">
        {(["urgency", "name", "expiry"] as SortMode[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
              sort === s
                ? "bg-[#252535] text-foreground"
                : "text-[#8888a0] hover:text-foreground"
            }`}
          >
            {s === "urgency" ? "By Urgency" : s === "name" ? "A–Z" : "Expiry"}
          </button>
        ))}
      </div>

      {/* Inventory list */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/inventory/${item.id}`}
            className="glass-card flex items-center gap-3 rounded-xl p-3.5 transition-all active:scale-[0.98]"
            style={{
              opacity: 0,
              animation: `float-up 0.3s ease-out ${i * 0.04}s forwards`,
            }}
          >
            {/* Urgency indicator */}
            <div
              className={`h-10 w-1 rounded-full ${
                item.urgency === "critical"
                  ? "bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                  : item.urgency === "warning"
                  ? "bg-[#fbbf24] shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                  : "bg-[#34d399]"
              }`}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-[#8888a0]">
                  {item.onHand} {item.unit}
                </span>
                <span className="text-[#8888a0]">·</span>
                <span className="text-xs text-[#8888a0]">
                  {item.storageLocation}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`text-sm font-bold ${
                  item.urgency === "critical"
                    ? "text-[#ef4444]"
                    : item.urgency === "warning"
                    ? "text-[#fbbf24]"
                    : "text-[#34d399]"
                }`}
              >
                {item.days}d
              </span>
              <p className="text-[10px] text-[#8888a0]">left</p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#8888a0]" />
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#8888a0]" />
          <p className="text-sm text-[#8888a0]">No ingredients match your search</p>
        </div>
      )}
    </div>
  );
}
