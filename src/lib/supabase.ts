// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  on_hand: number;
  par_level: number;
  cost_per_unit: number;
  vendor: string;
  storage_location: string;
  expiry_date: string;
  last_delivery: string;
  lead_time_days: number;
  daily_usage: number[];
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: { ingredientId: string; qty: number; unit: string }[];
  yield_percent: number;
  sell_price: number;
  daily_sales: number[];
  prep_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
}