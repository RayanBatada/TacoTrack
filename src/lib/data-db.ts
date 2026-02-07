// ==========================================
// Types (kept from original)
// ==========================================

export interface Ingredient {
  id: string;
  name: string;
  category: "protein" | "dairy" | "produce" | "dry-goods" | "beverage" | "other";
  unit: string;
  onHand: number;
  parLevel: number;
  costPerUnit: number;
  vendor: string;
  storageLocation: string;
  expiryDate: string;
  lastDelivery: string;
  leadTimeDays: number;
  dailyUsage: number[];
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: { ingredientId: string; qty: number; unit: string }[];
  yieldPercent: number;
  sellPrice: number;
  dailySales: number[];
}

export interface Order {
  id: string;
  vendor: string;
  items: { ingredientId: string; qty: number; unitCost: number }[];
  status: "suggested" | "pending" | "placed" | "delivered";
  deliveryDate: string;
  totalCost: number;
}

export interface WasteEntry {
  id: string;
  ingredientId: string;
  qty: number;
  reason: "expired" | "spoiled" | "over-prep" | "dropped" | "other";
  date: string;
  costLost: number;
}

export interface Alert {
  id: string;
  type: "low-stock" | "expiring" | "delivery" | "price-spike" | "waste";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  action: string;
  ingredientId?: string;
}

// ==========================================
// API Data Fetchers
// ==========================================

let cachedRecipes: Recipe[] | null = null;
let cachedIngredients: Ingredient[] | null = null;
let cachedOrders: Order[] | null = null;
let cachedWaste: WasteEntry[] | null = null;

// Fetch recipes from API
async function fetchRecipes(): Promise<Recipe[]> {
  if (cachedRecipes) return cachedRecipes;
  
  try {
    const response = await fetch("/api/recipes", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch recipes");
    cachedRecipes = await response.json();
    return cachedRecipes;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

// Fetch ingredients from API
async function fetchIngredients(): Promise<Ingredient[]> {
  if (cachedIngredients) return cachedIngredients;
  
  try {
    const response = await fetch("/api/ingredients", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch ingredients");
    cachedIngredients = await response.json();
    return cachedIngredients;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return [];
  }
}

// Fetch orders from API
async function fetchOrders(): Promise<Order[]> {
  if (cachedOrders) return cachedOrders;
  
  try {
    const response = await fetch("/api/orders", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch orders");
    cachedOrders = await response.json();
    return cachedOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Fetch waste entries from API
async function fetchWasteEntries(): Promise<WasteEntry[]> {
  if (cachedWaste) return cachedWaste;
  
  try {
    const response = await fetch("/api/waste", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch waste entries");
    cachedWaste = await response.json();
    return cachedWaste;
  } catch (error) {
    console.error("Error fetching waste entries:", error);
    return [];
  }
}

// Export as lazy-loaded data (will need to be awaited in components)
export const getRecipes = fetchRecipes;
export const getIngredients = fetchIngredients;
export const getOrders = fetchOrders;
export const getWasteEntries = fetchWasteEntries;

// For backward compatibility with direct imports, provide empty arrays initially
export const recipes: Recipe[] = [];
export const ingredients: Ingredient[] = [];
export const orders: Order[] = [];
export const wasteEntries: WasteEntry[] = [];
