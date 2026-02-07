"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, TrendingUp } from "lucide-react";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#4ade80]/[0.08] bg-[#0d1a0f]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-all",
                isActive
                  ? "text-[#4ade80]"
                  : "text-[#7a9a7e] hover:text-[#a7f3d0]"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-0 h-0.5 w-8 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
