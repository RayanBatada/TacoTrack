-- Create recipes table
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  yield_percent NUMERIC NOT NULL DEFAULT 100,
  sell_price NUMERIC NOT NULL,
  daily_sales NUMERIC[] NOT NULL DEFAULT ARRAY[]::numeric[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create ingredients table
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  on_hand NUMERIC NOT NULL,
  par_level NUMERIC NOT NULL,
  cost_per_unit NUMERIC NOT NULL,
  vendor TEXT NOT NULL,
  storage_location TEXT,
  expiry_date DATE,
  last_delivery DATE,
  lead_time_days INTEGER,
  daily_usage NUMERIC[] NOT NULL DEFAULT ARRAY[]::numeric[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'suggested',
  delivery_date DATE,
  total_cost NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create waste_entries table
CREATE TABLE waste_entries (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT REFERENCES ingredients(id),
  qty NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  date DATE DEFAULT now(),
  cost_lost NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS (optional but recommended for security)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_entries ENABLE ROW LEVEL SECURITY;

-- Create basic policies that allow all operations (replace with proper auth rules later)
CREATE POLICY "Allow all operations on recipes" ON recipes FOR ALL USING (true);
CREATE POLICY "Allow all operations on ingredients" ON ingredients FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on waste_entries" ON waste_entries FOR ALL USING (true);
