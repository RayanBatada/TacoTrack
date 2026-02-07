// components/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, TrendingUp, ChefHat } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/recipes", label: "Recipes", icon: ChefHat },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-56 border-r border-primary/20 bg-background/95 backdrop-blur-xl z-50">
      {/* Logo */}
      <div className="flex h-32 items-center gap-3 border-b border-primary/20 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/50">
          <span className="text-xl font-bold text-primary-foreground">🌮</span>
        </div>
        <span className="text-xl font-bold tracking-tight">Taco Track</span>
      </div>

      {/* Nav Items */}
      <div className="space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
