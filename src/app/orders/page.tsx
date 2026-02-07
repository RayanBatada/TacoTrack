"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Check,
} from "lucide-react";
import {
  getIngredients,
  getOrders,
  type Ingredient,
  type Order,
} from "@/lib/data";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ord, ing] = await Promise.all([
          getOrders(),
          getIngredients(),
        ]);
        setOrders(ord);
        setIngredients(ing);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-6"><p>Loading orders...</p></div>;
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = orders.reduce((s, o) => {
    const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []);
    return s + items.length;
  }, 0);
  const totalCost = orders.reduce((s, o) => s + (o.totalCost || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Order History</h1>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {totalItems} items across {orders.length} vendors · $
          {totalCost.toFixed(0)} total spent
        </p>
      </div>

      {/* Order cards by vendor */}
      <div className="space-y-4">
        {orders.map((order, oi) => {
          const items = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
          const isExpanded = expanded[order.id] !== false;

          return (
            <div
              key={order.id}
              className="glass-card overflow-hidden rounded-xl transition-all"
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary border border-primary/20">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{order.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {items.length} items · ${(order.totalCost || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <Check className="h-3 w-3" />
                    Delivered
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Items list */}
              {isExpanded && (
                <div className="border-t border-white/[0.04] px-4 pb-4">
                  <div className="mt-3 space-y-2">
                    {items.map((item: any) => {
                      const ing = ingredients.find(
                        (i) => i.id === item.ingredientId,
                      );
                      if (!ing) return null;
                      return (
                        <div
                          key={item.ingredientId}
                          className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{ing.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">
                              {item.qty} {ing.unit}
                            </span>
                            <p className="text-[10px] text-muted-foreground">
                              ${((item.qty || 0) * (item.unitCost || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Delivered: {order.deliveryDate}</span>
                    <span className="font-medium text-foreground">
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
