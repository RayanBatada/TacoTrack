"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  ChevronUp,
  Package,
  Truck,
  Check,
  Clock,
  Lightbulb,
} from "lucide-react";
import {
  getOrders,
  type Ingredient,
  type Order,
} from "@/lib/data";

import { getIngredients } from "@/lib/cache";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ord, ing] = await Promise.all([getOrders(), getIngredients()]);
        setOrders(ord);
        setIngredients(ing);

        // Auto-expand all orders by default
        const initialExpanded: Record<string, boolean> = {};
        ord.forEach((o) => {
          initialExpanded[o.id] = true;
        });
        setExpanded(initialExpanded);
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
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = orders.reduce((s, o) => {
    const items = Array.isArray(o.items)
      ? o.items
      : typeof o.items === "string"
        ? JSON.parse(o.items)
        : [];
    return s + items.length;
  }, 0);

  const totalCost = orders.reduce((s, o) => s + (o.totalCost || 0), 0);

  const vendorCount = new Set(orders.map((o) => o.vendor)).size;

  // Status icons and colors
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          icon: Check,
          label: "Delivered",
          className: "bg-success/10 text-success",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-warning/10 text-warning",
        };
      case "suggested":
        return {
          icon: Lightbulb,
          label: "Suggested",
          className: "bg-primary/10 text-primary",
        };
      default:
        return {
          icon: Package,
          label: status,
          className: "bg-secondary/50 text-muted-foreground",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Order History
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalItems} items across {vendorCount} vendors · $
          {totalCost.toFixed(2)} total spent
        </p>
      </div>

      {/* Order cards */}
      <div className="space-y-4 max-w-4xl">
        {orders.map((order, oi) => {
          const items = Array.isArray(order.items)
            ? order.items
            : typeof order.items === "string"
              ? JSON.parse(order.items)
              : [];
          const isExpanded = expanded[order.id];
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={order.id}
              className="glass-card rounded-xl overflow-hidden transition-all"
              style={{
                opacity: 0,
                animation: `float-up 0.4s ease-out ${oi * 0.08}s forwards`,
              }}
            >
              {/* Vendor header - always visible */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{order.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {items.length} items · $
                      {(order.totalCost || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusConfig.label}
                  </span>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="p-2 hover:bg-secondary/30 rounded-lg transition-colors"
                    title={isExpanded ? "Hide items" : "Show items"}
                  >
                    <ChevronUp
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isExpanded ? "" : "rotate-180"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Ingredient rectangles - toggle visibility */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {/* Ingredient cards grid */}
                  <div className="grid grid-cols-1 gap-2">
                    {items.map(
                      (item: {
                        ingredientId?: string;
                        id?: string;
                        quantity: number;
                        unit_cost: number;
                      }) => {
                        const ingId = item.ingredientId || item.id;
                        const ing = ingredients.find((i) => i.id === ingId);

                        if (!ing) {
                          console.log("Ingredient not found:", ingId);
                          return null;
                        }

                        const itemTotal =
                          (item.quantity || 0) * (item.unit_cost || 0);

                        return (
                          <div
                            key={ingId}
                            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-secondary/40 to-secondary/20 border border-primary/20 px-4 py-3 hover:border-primary/40 hover:bg-gradient-to-r hover:from-secondary/60 hover:to-secondary/40 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Package className="h-5 w-5 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {ing.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ${(item.unit_cost || 0).toFixed(2)} per{" "}
                                  {ing.unit}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-sm font-bold text-white">
                                {item.quantity} {ing.unit}
                              </p>
                              <p className="text-xs text-primary font-semibold">
                                ${itemTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Delivery info footer */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Delivery: {order.deliveryDate}
                    </span>
                    <span className="font-bold text-white">
                      Total: ${(order.totalCost || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
