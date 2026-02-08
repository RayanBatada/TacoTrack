export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendor: string;
  orderDate: string;
  deliveryDate: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
}

export interface OrderItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export const SAMPLE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-2026-001",
    orderNumber: "PO-2026-001",
    vendor: "Sysco Meats",
    orderDate: "2026-02-05",
    deliveryDate: "2026-02-08",
    status: "confirmed",
    items: [
      {
        ingredientId: "ground-beef",
        ingredientName: "Ground Beef (80/20)",
        quantity: 60,
        unit: "lbs",
        unitPrice: 5.99,
        totalPrice: 359.40,
      },
      {
        ingredientId: "chicken-breast",
        ingredientName: "Chicken Breast",
        quantity: 50,
        unit: "lbs",
        unitPrice: 4.49,
        totalPrice: 224.50,
      },
    ],
    subtotal: 583.90,
    tax: 46.71,
    shipping: 0,
    total: 630.61,
    notes: "Urgent - low stock",
  },
  {
    id: "po-2026-002",
    orderNumber: "PO-2026-002",
    vendor: "Produce Express",
    orderDate: "2026-02-06",
    deliveryDate: "2026-02-07",
    status: "shipped",
    items: [
      {
        ingredientId: "lettuce-iceberg",
        ingredientName: "Iceberg Lettuce",
        quantity: 24,
        unit: "heads",
        unitPrice: 1.89,
        totalPrice: 45.36,
      },
      {
        ingredientId: "tomatoes-roma",
        ingredientName: "Roma Tomatoes",
        quantity: 40,
        unit: "lbs",
        unitPrice: 2.49,
        totalPrice: 99.60,
      },
      {
        ingredientId: "limes",
        ingredientName: "Limes",
        quantity: 100,
        unit: "count",
        unitPrice: 0.35,
        totalPrice: 35.00,
      },
    ],
    subtotal: 179.96,
    tax: 14.40,
    shipping: 25.00,
    total: 219.36,
  },
];