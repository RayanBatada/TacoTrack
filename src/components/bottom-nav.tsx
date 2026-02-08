"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Package,
  ShoppingCart,
  TrendingUp,
  ChefHat,
  Sparkles,
  Settings,
  UserCircle2,
  ChevronRight,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/recipes", label: "Recipes", icon: ChefHat },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
    { href: "/insights", label: "Insights", icon: TrendingUp },
    { href: "/wrapped", label: "Wrapped", icon: Sparkles },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-56 border-r border-primary/20 bg-background/95 backdrop-blur-xl z-50 flex flex-col">
      {/* Header */}
      <div className="relative h-32 w-full border-b border-primary/20 overflow-hidden">
        <Link href="/">
          <Image
            src="/header.png"
            alt="Taco Track Header"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "20% 40%" }}
          />
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
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

      {/* Bottom Section - Settings & Account */}
      <div className="border-t border-primary/20 p-4 space-y-2">
        {/* Switch Account Button */}
        <div
          className="relative -m-2 p-1"
          onMouseEnter={() => setShowAccountMenu(true)}
          onMouseLeave={() => setShowAccountMenu(false)}
        >
          <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <UserCircle2 className="h-5 w-5" />
            Switch Account
            <ChevronRight className="h-4 w-4 ml-auto" />
          </button>

          {/* Account Dropdown Menu */}
          {showAccountMenu && (
            <div className="absolute bottom-full left-0 mb-0 w-full bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-lg overflow-hidden">
              <button className="w-full px-4 py-3 text-sm text-left hover:bg-secondary transition-colors">
                Account 1
              </button>
              <button className="w-full px-4 py-3 text-sm text-left hover:bg-secondary transition-colors">
                Account 2
              </button>
              <button className="w-full px-4 py-3 text-sm text-left hover:bg-secondary transition-colors border-t border-primary/10">
                + Add Account
              </button>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div
          className="relative -m-1 p-1"
          onMouseEnter={() => setShowAccountMenu(true)}
          onMouseLeave={() => setShowAccountMenu(false)}
        >
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${pathname === "/settings"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
          >
            <Settings className="h-5 w-5" />
            Settings
            {pathname === "/settings" && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
