"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
} from "lucide-react";
import {
  ingredients,
  generateSuggestedOrders,
} from "@/lib/data";

export default function OrdersPage() {
  const [orders] = useState(generateSuggestedOrders);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [placed, setPlaced] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const placeOrder = (id: string) => {
    setPlaced((prev) => ({ ...prev, [id]: true }));
  };

  const totalItems = orders.reduce((s, o) => s + o.items.length, 0);
  const totalCost = orders.reduce((s, o) => s + o.totalCost, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-[#a78bfa]" />
          <h1 className="text-xl font-bold tracking-tight">Orders</h1>
        </div>
        <p className="mt-0.5 text-sm text-[#8888a0]">
          {totalItems} items across {orders.length} vendors · Est. ${totalCost.toFixed(0)}
        </p>
      </div>

      {/* Smart summary */}
      <div className="glass-card mb-5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-xs font-medium text-[#a78bfa]">SMART SUGGESTION</span>
        </div>
        <p className="text-sm text-foreground/80">
          Based on your sales trends and current stock, here are your suggested
          orders to cover the next 7 days with a 2-day safety buffer.
        </p>
      </div>

      {/* Order cards by vendor */}
      <div className="space-y-4">
        {orders.map((order, oi) => {
          const isPlaced = placed[order.id];
          const isExpanded = expanded[order.id] !== false;

          return (
            <div
              key={order.id}
              className={`glass-card overflow-hidden rounded-xl transition-all ${
                isPlaced ? "opacity-60" : ""
              }`}
              style={{
                opacity: 0,
                animation: `float-up 0.4s ease-out ${oi * 0.1}s forwards`,
              }}
            >
              {/* Vendor header */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/20">
                    <Truck className="h-5 w-5 text-[#a78bfa]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{order.vendor}</p>
                    <p className="text-xs text-[#8888a0]">
                      {order.items.length} items · ${order.totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPlaced && (
                    <span className="flex items-center gap-1 rounded-full bg-[#34d399]/10 px-2 py-0.5 text-xs font-medium text-[#34d399]">
                      <Check className="h-3 w-3" />
                      Placed
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#8888a0]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#8888a0]" />
                  )}
                </div>
              </button>

              {/* Items list */}
              {isExpanded && (
                <div className="border-t border-white/[0.04] px-4 pb-4">
                  <div className="mt-3 space-y-2">
                    {order.items.map((item) => {
                      const ing = ingredients.find(
                        (i) => i.id === item.ingredientId
                      );
                      if (!ing) return null;
                      return (
                        <div
                          key={item.ingredientId}
                          className="flex items-center justify-between rounded-lg bg-[#0a0a0f]/50 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-[#8888a0]" />
                            <span className="text-sm">{ing.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">
                              {item.qty} {ing.unit}
                            </span>
                            <p className="text-[10px] text-[#8888a0]">
                              ${(item.qty * item.unitCost).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-[#8888a0]">
                    <span>Est. delivery: {order.deliveryDate}</span>
                    <span className="font-medium text-foreground">
                      Total: ${order.totalCost.toFixed(2)}
                    </span>
                  </div>

                  {/* Place order button */}
                  {!isPlaced && (
                    <button
                      onClick={() => placeOrder(order.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] py-3 text-sm font-semibold text-white shadow-lg shadow-[#a78bfa]/20 transition-all active:scale-[0.98] hover:shadow-[#a78bfa]/30"
                    >
                      <Sparkles className="h-4 w-4" />
                      Place Order — ${order.totalCost.toFixed(2)}
                    </button>
                  )}

                  {isPlaced && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#34d399]/20 bg-[#34d399]/10 py-3 text-sm font-medium text-[#34d399]">
                      <Check className="h-4 w-4" />
                      Order placed successfully
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Place all orders */}
      {Object.keys(placed).length < orders.length && (
        <button
          onClick={() => {
            const all: Record<string, boolean> = {};
            orders.forEach((o) => (all[o.id] = true));
            setPlaced(all);
          }}
          className="mt-6 mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#a78bfa]/30 bg-[#a78bfa]/10 py-3.5 text-sm font-semibold text-[#a78bfa] transition-all active:scale-[0.98] hover:bg-[#a78bfa]/15"
        >
          <Sparkles className="h-4 w-4" />
          Place All Orders — ${totalCost.toFixed(2)}
        </button>
      )}

      {Object.keys(placed).length === orders.length && orders.length > 0 && (
        <div className="mt-6 mb-4 text-center">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-[#34d399]" />
          <p className="text-sm font-medium text-[#34d399]">
            All orders placed!
          </p>
          <p className="mt-1 text-xs text-[#8888a0]">
            Supplies are on their way
          </p>
        </div>
      )}
    </div>
  );
}
