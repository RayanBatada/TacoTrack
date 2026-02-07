-- ============================================================================
-- CLEAN SCHEMA FOR RESTAURANT INVENTORY + FORECASTING
-- ============================================================================

-- Drop existing tables (if re-running)
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS sales_events CASCADE;
DROP TABLE IF EXISTS waste_entries CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;

-- ============================================================================
-- RECIPES
-- ============================================================================
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  yield_percent NUMERIC NOT NULL DEFAULT 100,
  sell_price NUMERIC NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_recipes_active ON recipes(active);
CREATE INDEX idx_recipes_category ON recipes(category);

-- ============================================================================
-- INGREDIENTS
-- ============================================================================
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  on_hand NUMERIC NOT NULL DEFAULT 0,
  par_level NUMERIC NOT NULL,
  reorder_point NUMERIC NOT NULL,
  cost_per_unit NUMERIC NOT NULL,
  vendor TEXT NOT NULL,
  storage_location TEXT,
  lead_time_days INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_vendor ON ingredients(vendor);
CREATE INDEX idx_ingredients_low_stock ON ingredients(on_hand) WHERE on_hand < reorder_point;

-- ============================================================================
-- RECIPE_INGREDIENTS (Junction Table)
-- ============================================================================
CREATE TABLE recipe_ingredients (
  recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (recipe_id, ingredient_id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- ============================================================================
-- SALES_EVENTS (Core Forecasting Data)
-- ============================================================================
CREATE TABLE sales_events (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sale_timestamp TIMESTAMP NOT NULL DEFAULT now(),
  day_of_week INTEGER GENERATED ALWAYS AS (EXTRACT(DOW FROM sale_timestamp)::INTEGER) STORED,
  hour_of_day INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM sale_timestamp)::INTEGER) STORED,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_sales_recipe_time ON sales_events(recipe_id, sale_timestamp DESC);
CREATE INDEX idx_sales_timestamp ON sales_events(sale_timestamp DESC);
CREATE INDEX idx_sales_dow_hour ON sales_events(day_of_week, hour_of_day);
CREATE INDEX idx_sales_recipe_dow ON sales_events(recipe_id, day_of_week);

-- ============================================================================
-- ORDERS
-- ============================================================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'pending', 'ordered', 'delivered', 'cancelled')),
  delivery_date DATE,
  total_cost NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_orders_vendor ON orders(vendor);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);

-- ============================================================================
-- WASTE_ENTRIES
-- ============================================================================
CREATE TABLE waste_entries (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty NUMERIC NOT NULL CHECK (qty > 0),
  reason TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  cost_lost NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_waste_ingredient ON waste_entries(ingredient_id);
CREATE INDEX idx_waste_date ON waste_entries(date DESC);

-- ============================================================================
-- INVENTORY_TRANSACTIONS (Optional but Recommended)
-- ============================================================================
CREATE TABLE inventory_transactions (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'waste', 'adjustment')),
  reference_id TEXT,
  transaction_timestamp TIMESTAMP NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_inv_txn_ingredient_time ON inventory_transactions(ingredient_id, transaction_timestamp DESC);
CREATE INDEX idx_inv_txn_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inv_txn_timestamp ON inventory_transactions(transaction_timestamp DESC);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_entries_updated_at BEFORE UPDATE ON waste_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();