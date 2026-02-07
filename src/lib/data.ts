// ==========================================
// Types
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
  expiryDate: string; // ISO date
  lastDelivery: string;
  leadTimeDays: number;
  dailyUsage: number[]; // last 14 days
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: { ingredientId: string; qty: number; unit: string }[];
  yieldPercent: number; // after trim/shrink
  sellPrice: number;
  dailySales: number[]; // last 14 days
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
// Mock Data
// ==========================================

// Day-of-week multipliers: Mon=0.7, Tue=0.65, Wed=0.8, Thu=0.9, Fri=1.3, Sat=1.5, Sun=1.15
const DOW_MULTIPLIERS = [0.7, 0.65, 0.8, 0.9, 1.3, 1.5, 1.15];

// Generates 14 days of usage with realistic day-of-week patterns and a weekly trend
function genUsage(base: number, trend: "rising" | "falling" | "stable" | "spike" = "stable"): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const dow = i % 7;
    let multiplier = DOW_MULTIPLIERS[dow];
    // Apply weekly trend (second week vs first)
    if (trend === "rising") multiplier *= i < 7 ? 0.7 : 1.2;
    else if (trend === "falling") multiplier *= i < 7 ? 1.3 : 0.6;
    else if (trend === "spike") multiplier *= i >= 10 ? 2.0 : i >= 7 ? 1.1 : 0.8;
    // Small jitter (±10%)
    const jitter = 1 + (((i * 7 + 3) % 11) - 5) * 0.02;
    return Math.max(0, Math.round(base * multiplier * jitter));
  });
}

function genSales(base: number, trend: "rising" | "falling" | "stable" | "spike" = "stable"): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const dow = i % 7;
    let multiplier = DOW_MULTIPLIERS[dow];
    if (trend === "rising") multiplier *= i < 7 ? 0.65 : 1.3;
    else if (trend === "falling") multiplier *= i < 7 ? 1.35 : 0.55;
    else if (trend === "spike") multiplier *= i >= 10 ? 2.2 : i >= 7 ? 1.0 : 0.75;
    const jitter = 1 + (((i * 13 + 5) % 11) - 5) * 0.02;
    return Math.max(0, Math.round(base * multiplier * jitter));
  });
}

export const ingredients: Ingredient[] = [
  {
    id: "seasoned-beef",
    name: "Enchanted Seasoned Beef",
    category: "protein",
    unit: "lbs",
    onHand: 45,
    parLevel: 120,
    costPerUnit: 3.49,
    vendor: "Sherwood Meats",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-09",
    lastDelivery: "2026-02-05",
    leadTimeDays: 2,
    dailyUsage: genUsage(18, "rising"),   // beef demand climbing
  },
  {
    id: "grilled-chicken",
    name: "Sherwood Grilled Chicken",
    category: "protein",
    unit: "lbs",
    onHand: 62,
    parLevel: 80,
    costPerUnit: 4.29,
    vendor: "Sherwood Meats",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-10",
    lastDelivery: "2026-02-04",
    leadTimeDays: 2,
    dailyUsage: genUsage(12, "stable"),
  },
  {
    id: "steak-strips",
    name: "Nottingham Steak Strips",
    category: "protein",
    unit: "lbs",
    onHand: 18,
    parLevel: 40,
    costPerUnit: 8.99,
    vendor: "Sherwood Meats",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-08",
    lastDelivery: "2026-02-05",
    leadTimeDays: 1,
    dailyUsage: genUsage(8, "spike"),     // sudden steak demand surge
  },
  {
    id: "nacho-cheese",
    name: "Mystic Nacho Cheese",
    category: "dairy",
    unit: "lbs",
    onHand: 35,
    parLevel: 50,
    costPerUnit: 2.99,
    vendor: "Friar Tuck Dairy",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-14",
    lastDelivery: "2026-02-03",
    leadTimeDays: 2,
    dailyUsage: genUsage(6, "rising"),
  },
  {
    id: "sour-cream",
    name: "Forest Sour Cream",
    category: "dairy",
    unit: "qt",
    onHand: 8,
    parLevel: 20,
    costPerUnit: 3.99,
    vendor: "Friar Tuck Dairy",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-12",
    lastDelivery: "2026-02-04",
    leadTimeDays: 2,
    dailyUsage: genUsage(3, "falling"),   // sour cream demand dropping
  },
  {
    id: "shredded-lettuce",
    name: "Merry Shredded Lettuce",
    category: "produce",
    unit: "lbs",
    onHand: 12,
    parLevel: 30,
    costPerUnit: 1.99,
    vendor: "Greenwood Farms",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-09",
    lastDelivery: "2026-02-06",
    leadTimeDays: 1,
    dailyUsage: genUsage(5, "rising"),
  },
  {
    id: "diced-tomatoes",
    name: "Robin's Diced Tomatoes",
    category: "produce",
    unit: "lbs",
    onHand: 22,
    parLevel: 40,
    costPerUnit: 1.79,
    vendor: "Greenwood Farms",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-11",
    lastDelivery: "2026-02-05",
    leadTimeDays: 1,
    dailyUsage: genUsage(7, "stable"),
  },
  {
    id: "hot-sauce",
    name: "Dragon's Breath Hot Sauce",
    category: "other",
    unit: "gal",
    onHand: 4,
    parLevel: 8,
    costPerUnit: 12.99,
    vendor: "Sherwood Provisions",
    storageLocation: "Dry Storage",
    expiryDate: "2026-06-15",
    lastDelivery: "2026-01-28",
    leadTimeDays: 3,
    dailyUsage: genUsage(1, "spike"),     // hot sauce going viral
  },
  {
    id: "flour-tortillas",
    name: "Spell-Pressed Flour Tortillas",
    category: "dry-goods",
    unit: "dozen",
    onHand: 40,
    parLevel: 60,
    costPerUnit: 2.49,
    vendor: "Greenwood Bakery",
    storageLocation: "Dry Storage",
    expiryDate: "2026-12-01",
    lastDelivery: "2026-01-30",
    leadTimeDays: 3,
    dailyUsage: genUsage(5, "rising"),
  },
  {
    id: "crunchy-shells",
    name: "Enchanted Crunchy Shells",
    category: "dry-goods",
    unit: "dozen",
    onHand: 80,
    parLevel: 100,
    costPerUnit: 1.89,
    vendor: "Greenwood Bakery",
    storageLocation: "Dry Storage",
    expiryDate: "2026-05-20",
    lastDelivery: "2026-02-01",
    leadTimeDays: 3,
    dailyUsage: genUsage(10, "falling"),  // shells demand cooling off
  },
  {
    id: "cheddar-cheese",
    name: "Three-Blend Cheddar",
    category: "dairy",
    unit: "lbs",
    onHand: 6,
    parLevel: 15,
    costPerUnit: 3.49,
    vendor: "Friar Tuck Dairy",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-09",
    lastDelivery: "2026-02-06",
    leadTimeDays: 1,
    dailyUsage: genUsage(2, "spike"),
  },
  {
    id: "guacamole",
    name: "Locksley Guacamole",
    category: "produce",
    unit: "lbs",
    onHand: 15,
    parLevel: 40,
    costPerUnit: 4.49,
    vendor: "Greenwood Farms",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-10",
    lastDelivery: "2026-02-05",
    leadTimeDays: 1,
    dailyUsage: genUsage(6, "rising"),    // guac trending up
  },
  // --- NEW INGREDIENTS ---
  {
    id: "refried-moon-beans",
    name: "Refried Moon Beans",
    category: "dry-goods",
    unit: "lbs",
    onHand: 40,
    parLevel: 80,
    costPerUnit: 1.29,
    vendor: "Friar Tuck Dairy",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-14",
    lastDelivery: "2026-02-05",
    leadTimeDays: 2,
    dailyUsage: genUsage(15, "stable"),
  },
  {
    id: "golden-potato-gems",
    name: "Golden Potato Gems",
    category: "produce",
    unit: "lbs",
    onHand: 60,
    parLevel: 100,
    costPerUnit: 0.89,
    vendor: "Greenwood Farms",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-20",
    lastDelivery: "2026-02-04",
    leadTimeDays: 1,
    dailyUsage: genUsage(20, "rising"),
  },
  {
    id: "ancient-grains-rice",
    name: "Ancient Grains Rice",
    category: "dry-goods",
    unit: "lbs",
    onHand: 25,
    parLevel: 50,
    costPerUnit: 1.49,
    vendor: "Sherwood Provisions",
    storageLocation: "Dry Storage",
    expiryDate: "2026-06-01",
    lastDelivery: "2026-01-28",
    leadTimeDays: 3,
    dailyUsage: genUsage(10, "stable"),
  },
  {
    id: "dragon-dust-shells",
    name: "Dragon Dust Shells",
    category: "dry-goods",
    unit: "dozen",
    onHand: 30,
    parLevel: 60,
    costPerUnit: 2.29,
    vendor: "Greenwood Bakery",
    storageLocation: "Dry Storage",
    expiryDate: "2026-04-15",
    lastDelivery: "2026-02-02",
    leadTimeDays: 2,
    dailyUsage: genUsage(12, "spike"),
  },
  {
    id: "phoenix-sauce",
    name: "Phoenix Sauce",
    category: "other",
    unit: "gal",
    onHand: 5,
    parLevel: 10,
    costPerUnit: 15.99,
    vendor: "Sherwood Provisions",
    storageLocation: "Dry Storage",
    expiryDate: "2026-05-10",
    lastDelivery: "2026-01-25",
    leadTimeDays: 3,
    dailyUsage: genUsage(2, "rising"),
  },
  {
    id: "sirens-blue-syrup",
    name: "Siren's Blue Syrup",
    category: "beverage",
    unit: "gal",
    onHand: 8,
    parLevel: 12,
    costPerUnit: 18.99,
    vendor: "Sherwood Provisions",
    storageLocation: "Dry Storage",
    expiryDate: "2026-08-01",
    lastDelivery: "2026-01-20",
    leadTimeDays: 4,
    dailyUsage: genUsage(1, "spike"),
  },
  {
    id: "spirit-dough-orbs",
    name: "Spirit Dough Orbs",
    category: "dry-goods",
    unit: "count",
    onHand: 100,
    parLevel: 200,
    costPerUnit: 0.15,
    vendor: "Greenwood Bakery",
    storageLocation: "Freezer",
    expiryDate: "2026-03-30",
    lastDelivery: "2026-02-01",
    leadTimeDays: 2,
    dailyUsage: genUsage(25, "rising"),
  },
  {
    id: "crispy-manna-discs",
    name: "Crispy Manna Discs",
    category: "dry-goods",
    unit: "count",
    onHand: 40,
    parLevel: 80,
    costPerUnit: 0.45,
    vendor: "Greenwood Bakery",
    storageLocation: "Dry Storage",
    expiryDate: "2026-04-01",
    lastDelivery: "2026-02-03",
    leadTimeDays: 2,
    dailyUsage: genUsage(8, "stable"),
  },
  {
    id: "soft-cloud-flatbread",
    name: "Soft Cloud Flatbread",
    category: "dry-goods",
    unit: "dozen",
    onHand: 15,
    parLevel: 30,
    costPerUnit: 3.99,
    vendor: "Greenwood Bakery",
    storageLocation: "Walk-in Cooler",
    expiryDate: "2026-02-11",
    lastDelivery: "2026-02-06",
    leadTimeDays: 1,
    dailyUsage: genUsage(4, "rising"),
  },
  {
    id: "red-dragon-scales",
    name: "Red Dragon Scales",
    category: "dry-goods",
    unit: "lbs",
    onHand: 10,
    parLevel: 20,
    costPerUnit: 2.50,
    vendor: "Sherwood Provisions",
    storageLocation: "Dry Storage",
    expiryDate: "2026-06-20",
    lastDelivery: "2026-01-29",
    leadTimeDays: 3,
    dailyUsage: genUsage(2, "stable"),
  },
];

export const recipes: Recipe[] = [
  {
    id: "spell-burrito",
    name: "Spell-Bound Burrito",
    category: "Burritos",
    sellPrice: 8.99,
    yieldPercent: 92,
    ingredients: [
      { ingredientId: "seasoned-beef", qty: 0.25, unit: "lbs" },
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "nacho-cheese", qty: 0.1, unit: "lbs" },
      { ingredientId: "shredded-lettuce", qty: 0.05, unit: "lbs" },
    ],
    dailySales: genSales(55, "rising"),    // burrito sales climbing
  },
  {
    id: "sherwood-crunch",
    name: "Sherwood Crunchwrap",
    category: "Specialties",
    sellPrice: 7.49,
    yieldPercent: 90,
    ingredients: [
      { ingredientId: "seasoned-beef", qty: 0.2, unit: "lbs" },
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "crunchy-shells", qty: 0.083, unit: "dozen" },
      { ingredientId: "nacho-cheese", qty: 0.08, unit: "lbs" },
      { ingredientId: "diced-tomatoes", qty: 0.05, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.05, unit: "qt" },
    ],
    dailySales: genSales(62, "spike"),    // crunchwrap going viral
  },
  {
    id: "outlaw-steak-taco",
    name: "Outlaw Steak Taco",
    category: "Tacos",
    sellPrice: 4.99,
    yieldPercent: 88,
    ingredients: [
      { ingredientId: "steak-strips", qty: 0.15, unit: "lbs" },
      { ingredientId: "crunchy-shells", qty: 0.083, unit: "dozen" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.04, unit: "lbs" },
    ],
    dailySales: genSales(40, "spike"),    // steak tacos surging
  },
  {
    id: "forest-quesadilla",
    name: "Enchanted Forest Quesadilla",
    category: "Specialties",
    sellPrice: 6.99,
    yieldPercent: 95,
    ingredients: [
      { ingredientId: "grilled-chicken", qty: 0.2, unit: "lbs" },
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "cheddar-cheese", qty: 0.12, unit: "lbs" },
      { ingredientId: "nacho-cheese", qty: 0.05, unit: "lbs" },
    ],
    dailySales: genSales(38, "falling"), // quesadilla losing steam
  },
  {
    id: "merry-nachos",
    name: "Merry Men's Nachos",
    category: "Sides",
    sellPrice: 5.99,
    yieldPercent: 90,
    ingredients: [
      { ingredientId: "seasoned-beef", qty: 0.15, unit: "lbs" },
      { ingredientId: "nacho-cheese", qty: 0.12, unit: "lbs" },
      { ingredientId: "guacamole", qty: 0.1, unit: "lbs" },
      { ingredientId: "diced-tomatoes", qty: 0.05, unit: "lbs" },
    ],
    dailySales: genSales(30, "rising"),
  },
  {
    id: "arrow-chalupa",
    name: "Golden Arrow Chalupa",
    category: "Specialties",
    sellPrice: 5.49,
    yieldPercent: 85,
    ingredients: [
      { ingredientId: "grilled-chicken", qty: 0.15, unit: "lbs" },
      { ingredientId: "crunchy-shells", qty: 0.083, unit: "dozen" },
      { ingredientId: "shredded-lettuce", qty: 0.04, unit: "lbs" },
      { ingredientId: "diced-tomatoes", qty: 0.04, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.06, unit: "lbs" },
    ],
    dailySales: genSales(25, "falling"), // chalupa declining
  },
  // --- NEW RECIPES ---
  {
    id: "cosmic-crunch-wrap",
    name: "Cosmic Crunch Wrap",
    category: "Specialties",
    sellPrice: 6.29,
    yieldPercent: 90,
    ingredients: [
      { ingredientId: "seasoned-beef", qty: 0.15, unit: "lbs" },
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "crunchy-shells", qty: 0.083, unit: "dozen" },
      { ingredientId: "nacho-cheese", qty: 0.08, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.05, unit: "qt" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
      { ingredientId: "diced-tomatoes", qty: 0.04, unit: "lbs" },
    ],
    dailySales: genSales(85, "rising"),
  },
  {
    id: "lunar-layered-taco",
    name: "Lunar Layered Taco",
    category: "Tacos",
    sellPrice: 5.69,
    yieldPercent: 88,
    ingredients: [
      { ingredientId: "soft-cloud-flatbread", qty: 0.083, unit: "dozen" },
      { ingredientId: "crunchy-shells", qty: 0.083, unit: "dozen" },
      { ingredientId: "seasoned-beef", qty: 0.12, unit: "lbs" },
      { ingredientId: "three-cheese-blend", qty: 0.05, unit: "lbs" }, // Using Cheddar proxy
      { ingredientId: "phoenix-sauce", qty: 0.02, unit: "gal" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
    ],
    dailySales: genSales(70, "spike"),
  },
  {
    id: "sirens-blue-freeze",
    name: "Siren's Blue Freeze",
    category: "Beverages",
    sellPrice: 4.49,
    yieldPercent: 100,
    ingredients: [
      { ingredientId: "sirens-blue-syrup", qty: 0.1, unit: "gal" },
    ],
    dailySales: genSales(120, "rising"),
  },
  {
    id: "dragon-dust-taco",
    name: "Dragon Dust Taco",
    category: "Tacos",
    sellPrice: 3.49,
    yieldPercent: 92,
    ingredients: [
      { ingredientId: "dragon-dust-shells", qty: 0.083, unit: "dozen" },
      { ingredientId: "seasoned-beef", qty: 0.12, unit: "lbs" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.04, unit: "lbs" },
    ],
    dailySales: genSales(95, "stable"),
  },
  {
    id: "mystic-mandala-pizza",
    name: "Mystic Mandala Pizza",
    category: "Specialties",
    sellPrice: 6.99,
    yieldPercent: 85,
    ingredients: [
      { ingredientId: "crispy-manna-discs", qty: 2, unit: "count" },
      { ingredientId: "seasoned-beef", qty: 0.2, unit: "lbs" },
      { ingredientId: "refried-moon-beans", qty: 0.15, unit: "lbs" },
      { ingredientId: "diced-tomatoes", qty: 0.06, unit: "lbs" },
      { ingredientId: "three-cheese-blend", qty: 0.08, unit: "lbs" }, // Using Cheddar proxy
      { ingredientId: "phoenix-sauce", qty: 0.03, unit: "gal" }, // Pizza sauce proxy
    ],
    dailySales: genSales(50, "rising"),
  },
  {
    id: "titans-mountain-nachos",
    name: "Titan's Mountain Nachos",
    category: "Sides",
    sellPrice: 7.99,
    yieldPercent: 88,
    ingredients: [
      { ingredientId: "crunchy-shells", qty: 0.15, unit: "dozen" }, // Chips proxy
      { ingredientId: "seasoned-beef", qty: 0.25, unit: "lbs" },
      { ingredientId: "nacho-cheese", qty: 0.2, unit: "lbs" },
      { ingredientId: "refried-moon-beans", qty: 0.15, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.08, unit: "qt" },
      { ingredientId: "diced-tomatoes", qty: 0.08, unit: "lbs" },
    ],
    dailySales: genSales(45, "stable"),
  },
  {
    id: "chimeric-chalupa",
    name: "Chimeric Chalupa",
    category: "Specialties",
    sellPrice: 5.29,
    yieldPercent: 85,
    ingredients: [
      { ingredientId: "soft-cloud-flatbread", qty: 0.083, unit: "dozen" }, // Chalupa shell proxy
      { ingredientId: "seasoned-beef", qty: 0.15, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.04, unit: "qt" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
      { ingredientId: "three-cheese-blend", qty: 0.04, unit: "lbs" }, // Cheddar proxy
      { ingredientId: "diced-tomatoes", qty: 0.04, unit: "lbs" },
    ],
    dailySales: genSales(60, "falling"),
  },
  {
    id: "hidden-scroll-burrito",
    name: "Hidden Scroll Burrito",
    category: "Burritos",
    sellPrice: 5.99,
    yieldPercent: 90,
    ingredients: [
      { ingredientId: "flour-tortillas", qty: 0.166, unit: "dozen" }, // Double tortilla
      { ingredientId: "seasoned-beef", qty: 0.2, unit: "lbs" },
      { ingredientId: "ancient-grains-rice", qty: 0.1, unit: "lbs" },
      { ingredientId: "nacho-cheese", qty: 0.1, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.05, unit: "qt" },
      { ingredientId: "phoenix-sauce", qty: 0.03, unit: "gal" },
    ],
    dailySales: genSales(55, "rising"),
  },
  {
    id: "sweet-spirit-orbs",
    name: "Sweet Spirit Orbs (12pk)",
    category: "Dessert",
    sellPrice: 6.49,
    yieldPercent: 95,
    ingredients: [
      { ingredientId: "spirit-dough-orbs", qty: 12, unit: "count" },
    ],
    dailySales: genSales(40, "spike"),
  },
  {
    id: "cloud-walker-taco",
    name: "Cloud Walker Taco",
    category: "Tacos",
    sellPrice: 2.89,
    yieldPercent: 95,
    ingredients: [
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "seasoned-beef", qty: 0.12, unit: "lbs" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.03, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.02, unit: "qt" },
    ],
    dailySales: genSales(100, "rising"),
  },
  {
    id: "earth-binder-burrito",
    name: "Earth Binder Burrito",
    category: "Burritos",
    sellPrice: 2.49,
    yieldPercent: 95,
    ingredients: [
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "refried-moon-beans", qty: 0.25, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.05, unit: "lbs" },
      { ingredientId: "hot-sauce", qty: 0.01, unit: "gal" }, // Red sauce proxy
    ],
    dailySales: genSales(65, "stable"),
  },
  {
    id: "fire-gem-potato-taco",
    name: "Fire Gem Potato Taco",
    category: "Tacos",
    sellPrice: 1.99,
    yieldPercent: 90,
    ingredients: [
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "golden-potato-gems", qty: 0.15, unit: "lbs" },
      { ingredientId: "phoenix-sauce", qty: 0.02, unit: "gal" },
      { ingredientId: "shredded-lettuce", qty: 0.03, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.02, unit: "lbs" },
    ],
    dailySales: genSales(80, "rising"),
  },
  {
    id: "phoenix-feather-quesadilla",
    name: "Phoenix Feather Quesadilla",
    category: "Specialties",
    sellPrice: 6.49,
    yieldPercent: 92,
    ingredients: [
      { ingredientId: "flour-tortillas", qty: 0.083, unit: "dozen" },
      { ingredientId: "grilled-chicken", qty: 0.2, unit: "lbs" },
      { ingredientId: "three-cheese-blend", qty: 0.15, unit: "lbs" }, // Cheddar proxy
      { ingredientId: "phoenix-sauce", qty: 0.04, unit: "gal" },
    ],
    dailySales: genSales(55, "falling"),
  },
  {
    id: "golden-nugget-potatoes",
    name: "Golden Nugget Potatoes",
    category: "Sides",
    sellPrice: 3.49,
    yieldPercent: 90,
    ingredients: [
      { ingredientId: "golden-potato-gems", qty: 0.3, unit: "lbs" },
      { ingredientId: "nacho-cheese", qty: 0.1, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.05, unit: "qt" },
    ],
    dailySales: genSales(45, "rising"),
  },
  {
    id: "heros-feast-bowl",
    name: "Hero's Feast Bowl",
    category: "Bowls",
    sellPrice: 8.49,
    yieldPercent: 95,
    ingredients: [
      { ingredientId: "ancient-grains-rice", qty: 0.2, unit: "lbs" },
      { ingredientId: "refried-moon-beans", qty: 0.15, unit: "lbs" }, // Black beans proxy
      { ingredientId: "grilled-chicken", qty: 0.2, unit: "lbs" },
      { ingredientId: "cheddar-cheese", qty: 0.05, unit: "lbs" },
      { ingredientId: "sour-cream", qty: 0.05, unit: "qt" },
      { ingredientId: "guacamole", qty: 0.1, unit: "lbs" },
      { ingredientId: "shredded-lettuce", qty: 0.05, unit: "lbs" },
    ],
    dailySales: genSales(35, "rising"),
  },
];

export const wasteEntries: WasteEntry[] = [
  { id: "w1", ingredientId: "shredded-lettuce", qty: 3, reason: "expired", date: "2026-02-06", costLost: 5.97 },
  { id: "w2", ingredientId: "steak-strips", qty: 2, reason: "spoiled", date: "2026-02-05", costLost: 17.98 },
  { id: "w3", ingredientId: "guacamole", qty: 4, reason: "over-prep", date: "2026-02-06", costLost: 17.96 },
  { id: "w4", ingredientId: "sour-cream", qty: 1, reason: "expired", date: "2026-02-04", costLost: 3.99 },
  { id: "w5", ingredientId: "diced-tomatoes", qty: 3, reason: "spoiled", date: "2026-02-06", costLost: 5.37 },
  { id: "w6", ingredientId: "seasoned-beef", qty: 2, reason: "over-prep", date: "2026-02-05", costLost: 6.98 },
  { id: "w7", ingredientId: "cheddar-cheese", qty: 1, reason: "expired", date: "2026-02-06", costLost: 3.49 },
];

// ==========================================
// Prediction Engine (simple, no ML)
// ==========================================

export function avgDailyUsage(usage: number[]): number {
  if (!usage.length) return 0;
  // Weighted: recent days matter more
  const weights = usage.map((_, i) => 1 + i * 0.15);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return usage.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
}

export function daysOfStock(ingredient: Ingredient): number {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  if (avg <= 0) return 999;
  return Math.round(ingredient.onHand / avg * 10) / 10;
}

export function stockoutDate(ingredient: Ingredient): string {
  const days = daysOfStock(ingredient);
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(days));
  return date.toISOString().split("T")[0];
}

export function suggestedOrderQty(ingredient: Ingredient): number {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  const safetyDays = 2;
  const orderCoverDays = 7;
  const needed = avg * (orderCoverDays + safetyDays + ingredient.leadTimeDays);
  const toOrder = Math.max(0, Math.ceil(needed - ingredient.onHand));
  return toOrder;
}

export function urgencyLevel(ingredient: Ingredient): "critical" | "warning" | "good" {
  const days = daysOfStock(ingredient);
  if (days <= 1.5) return "critical";
  if (days <= 3) return "warning";
  return "good";
}

export function daysUntilExpiry(ingredient: Ingredient): number {
  const now = new Date();
  const exp = new Date(ingredient.expiryDate);
  return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function foodCostPercent(recipe: Recipe): number {
  const cost = recipe.ingredients.reduce((sum, ri) => {
    const ing = ingredients.find((i) => i.id === ri.ingredientId);
    if (!ing) return sum;
    return sum + ri.qty * ing.costPerUnit;
  }, 0);
  return Math.round((cost / recipe.sellPrice) * 100);
}

export function totalWasteToday(): number {
  return wasteEntries
    .filter((w) => w.date === "2026-02-06")
    .reduce((sum, w) => sum + w.costLost, 0);
}

export function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];

  for (const ing of ingredients) {
    const days = daysOfStock(ing);
    if (days <= 1.5) {
      alerts.push({
        id: `low-${ing.id}`,
        type: "low-stock",
        severity: "critical",
        title: `${ing.name} critically low`,
        description: `Only ${ing.onHand} ${ing.unit} left — about ${days} days of stock`,
        action: `Order ${suggestedOrderQty(ing)} ${ing.unit} now`,
        ingredientId: ing.id,
      });
    } else if (days <= 3) {
      alerts.push({
        id: `low-${ing.id}`,
        type: "low-stock",
        severity: "warning",
        title: `${ing.name} running low`,
        description: `${ing.onHand} ${ing.unit} left — ~${days} days of stock`,
        action: `Order ${suggestedOrderQty(ing)} ${ing.unit} by tomorrow`,
        ingredientId: ing.id,
      });
    }

    const expDays = daysUntilExpiry(ing);
    if (expDays <= 2) {
      alerts.push({
        id: `exp-${ing.id}`,
        type: "expiring",
        severity: expDays <= 1 ? "critical" : "warning",
        title: `${ing.name} expiring ${expDays === 0 ? "today" : `in ${expDays} day${expDays > 1 ? "s" : ""}`}`,
        description: `${ing.onHand} ${ing.unit} at risk — use first or discount`,
        action: "Prioritize in today's prep",
        ingredientId: ing.id,
      });
    }
  }

  return alerts;
}

export function generateSuggestedOrders(): Order[] {
  const vendorGroups: Record<string, Order["items"]> = {};

  for (const ing of ingredients) {
    const qty = suggestedOrderQty(ing);
    if (qty <= 0) continue;
    if (!vendorGroups[ing.vendor]) vendorGroups[ing.vendor] = [];
    vendorGroups[ing.vendor].push({
      ingredientId: ing.id,
      qty,
      unitCost: ing.costPerUnit,
    });
  }

  return Object.entries(vendorGroups).map(([vendor, items], i) => ({
    id: `order-${i}`,
    vendor,
    items,
    status: "suggested" as const,
    deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    totalCost: items.reduce((s, item) => s + item.qty * item.unitCost, 0),
  }));
}

// Chart data helpers
export function burndownData(ingredient: Ingredient): { day: string; stock: number }[] {
  const avg = avgDailyUsage(ingredient.dailyUsage);
  const days = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  let stock = ingredient.onHand;
  return days.map((day) => {
    const point = { day, stock: Math.max(0, Math.round(stock * 10) / 10) };
    stock -= avg;
    return point;
  });
}

export function weeklyUsageData(ingredient: Ingredient): { day: string; usage: number }[] {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return ingredient.dailyUsage.slice(-7).map((usage, i) => ({
    day: dayNames[i],
    usage,
  }));
}

export function salesTrendData(): { day: string; sales: number; revenue: number; lastWeek: number }[] {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon2", "Tue2", "Wed2", "Thu2", "Fri2", "Sat2", "Sun2"];
  return dayLabels.map((label, i) => ({
    day: label.replace("2", ""),
    sales: recipes.reduce((sum, r) => sum + (r.dailySales[i] || 0), 0),
    revenue: recipes.reduce((sum, r) => sum + (r.dailySales[i] || 0) * r.sellPrice, 0),
    lastWeek: i < 7
      ? recipes.reduce((sum, r) => sum + (r.dailySales[i] || 0), 0)
      : recipes.reduce((sum, r) => sum + (r.dailySales[i - 7] || 0), 0),
  }));
}

export function wasteByCategory(): { category: string; cost: number }[] {
  const cats: Record<string, number> = {};
  for (const w of wasteEntries) {
    const ing = ingredients.find((i) => i.id === w.ingredientId);
    const cat = ing?.category || "other";
    cats[cat] = (cats[cat] || 0) + w.costLost;
  }
  return Object.entries(cats).map(([category, cost]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    cost: Math.round(cost * 100) / 100,
  }));
}

export function topSellingItems(): { name: string; avgSales: number; margin: number }[] {
  return recipes
    .map((r) => ({
      name: r.name,
      avgSales: Math.round(r.dailySales.reduce((a, b) => a + b, 0) / r.dailySales.length),
      margin: 100 - foodCostPercent(r),
    }))
    .sort((a, b) => b.avgSales - a.avgSales);
}
