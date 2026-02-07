"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, TrendingUp, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/insights", label: "Analytics", icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-56 flex-col border-r border-primary/20 bg-sidebar/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-primary/10">
        <div className="h-8 w-8 overflow-hidden rounded-full border border-primary/20">
          <img src="/logo.png" alt="Taco Track" className="h-full w-full object-cover" />
        </div>
        <span className="text-lg font-bold tracking-tight">Taco Track</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  isActive && "drop-shadow-[0_0_6px_rgba(217,70,239,0.5)]"
                )}
              />
              {tab.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(217,70,239,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-primary/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-800 text-xs font-bold text-white">
            TT
          </div>
          <div>
            <p className="text-xs font-medium">Taco Track</p>
            <p className="text-[10px] text-muted-foreground">Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
