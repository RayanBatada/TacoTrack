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
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-56 flex-col border-r border-[#4ade80]/[0.08] bg-[#0a1410]/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#4ade80]/[0.06]">
        <TreePine className="h-6 w-6 text-[#4ade80]" />
        <span className="text-lg font-bold tracking-tight">Taco Spell</span>
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
                  ? "bg-[#4ade80]/10 text-[#4ade80]"
                  : "text-[#7a9a7e] hover:bg-[#4ade80]/5 hover:text-[#a7f3d0]"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  isActive && "drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]"
                )}
              />
              {tab.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#4ade80]/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#4ade80] to-[#16a34a] text-xs font-bold text-white">
            TS
          </div>
          <div>
            <p className="text-xs font-medium">Taco Spell</p>
            <p className="text-[10px] text-[#7a9a7e]">Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
