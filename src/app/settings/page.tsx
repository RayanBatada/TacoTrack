"use client";

import { useState, useEffect } from "react";
import { Settings, User, Building2, Bell } from "lucide-react";

export default function SettingsPage() {
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [restaurantName, setRestaurantName] = useState("");
    const [lowStockThreshold, setLowStockThreshold] = useState(2);

    useEffect(() => {
        // Load settings from localStorage
        setUserName(localStorage.getItem("userName") || "Manager");
        setUserRole(localStorage.getItem("userRole") || "Head Chef");
        setRestaurantName(localStorage.getItem("restaurantName") || "Orchids Restaurant");
        setLowStockThreshold(Number(localStorage.getItem("lowStockThreshold") || 2));
    }, []);

    const handleSave = () => {
        localStorage.setItem("userName", userName);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("restaurantName", restaurantName);
        localStorage.setItem("lowStockThreshold", String(lowStockThreshold));

        alert("Settings saved successfully!");
    };

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your restaurant and user preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* User Profile Section */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">User Profile</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Display Name</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full rounded-lg border border-primary/20 bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="e.g., Manager Mike"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <input
                                type="text"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="w-full rounded-lg border border-primary/20 bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                                placeholder="e.g., Head Chef"
                            />
                        </div>
                    </div>
                </div>

                {/* Restaurant Settings Section */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">Restaurant Settings</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                        <input
                            type="text"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            className="w-full rounded-lg border border-primary/20 bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                            placeholder="e.g., Orchids Restaurant"
                        />
                    </div>
                </div>

                {/* Inventory Alerts Section */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">Inventory Alerts</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Low Stock Threshold (days)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="7"
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-lg font-bold text-primary w-12 text-center">
                                {lowStockThreshold}d
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Items with less than {lowStockThreshold} days of stock will be flagged as low
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
}
