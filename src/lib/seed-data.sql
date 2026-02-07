-- ==========================================
-- ORCHIDS RESTAURANT - COMPLETE SEED DATA
-- Fantasy-themed taco restaurant
-- ==========================================

-- Clear existing data
TRUNCATE TABLE inventory_transactions, sales_events, recipe_ingredients, waste_entries, orders, ingredients, recipes CASCADE;

-- ============================================================================
-- INGREDIENTS (22 fantasy-themed ingredients)
-- ============================================================================
INSERT INTO ingredients (id, name, category, unit, on_hand, par_level, reorder_point, cost_per_unit, vendor, storage_location, lead_time_days) VALUES
-- Proteins
('seasoned-beef', 'Enchanted Seasoned Beef', 'protein', 'lbs', 45, 120, 70, 3.49, 'Sherwood Meats', 'Walk-in Cooler', 2),
('grilled-chicken', 'Sherwood Grilled Chicken', 'protein', 'lbs', 62, 80, 50, 4.29, 'Sherwood Meats', 'Walk-in Cooler', 2),
('steak-strips', 'Nottingham Steak Strips', 'protein', 'lbs', 18, 40, 25, 8.99, 'Sherwood Meats', 'Walk-in Cooler', 1),

-- Dairy
('nacho-cheese', 'Mystic Nacho Cheese', 'dairy', 'lbs', 35, 50, 30, 2.99, 'Friar Tuck Dairy', 'Walk-in Cooler', 2),
('sour-cream', 'Forest Sour Cream', 'dairy', 'qt', 8, 20, 12, 3.99, 'Friar Tuck Dairy', 'Walk-in Cooler', 2),
('cheddar-cheese', 'Three-Blend Cheddar', 'dairy', 'lbs', 6, 15, 9, 3.49, 'Friar Tuck Dairy', 'Walk-in Cooler', 1),

-- Produce
('shredded-lettuce', 'Merry Shredded Lettuce', 'produce', 'lbs', 12, 30, 18, 1.99, 'Greenwood Farms', 'Walk-in Cooler', 1),
('diced-tomatoes', 'Robin''s Diced Tomatoes', 'produce', 'lbs', 22, 40, 25, 1.79, 'Greenwood Farms', 'Walk-in Cooler', 1),
('guacamole', 'Locksley Guacamole', 'produce', 'lbs', 15, 40, 24, 4.49, 'Greenwood Farms', 'Walk-in Cooler', 1),
('golden-potato-gems', 'Golden Potato Gems', 'produce', 'lbs', 60, 100, 60, 0.89, 'Greenwood Farms', 'Walk-in Cooler', 1),

-- Dry Goods & Bakery
('flour-tortillas', 'Spell-Pressed Flour Tortillas', 'dry-goods', 'dozen', 40, 60, 36, 2.49, 'Greenwood Bakery', 'Dry Storage', 3),
('crunchy-shells', 'Enchanted Crunchy Shells', 'dry-goods', 'dozen', 80, 100, 60, 1.89, 'Greenwood Bakery', 'Dry Storage', 3),
('dragon-dust-shells', 'Dragon Dust Shells', 'dry-goods', 'dozen', 30, 60, 36, 2.29, 'Greenwood Bakery', 'Dry Storage', 2),
('soft-cloud-flatbread', 'Soft Cloud Flatbread', 'dry-goods', 'dozen', 15, 30, 18, 3.99, 'Greenwood Bakery', 'Walk-in Cooler', 1),
('refried-moon-beans', 'Refried Moon Beans', 'dry-goods', 'lbs', 40, 80, 48, 1.29, 'Friar Tuck Dairy', 'Walk-in Cooler', 2),
('ancient-grains-rice', 'Ancient Grains Rice', 'dry-goods', 'lbs', 25, 50, 30, 1.49, 'Sherwood Provisions', 'Dry Storage', 3),
('spirit-dough-orbs', 'Spirit Dough Orbs', 'dry-goods', 'count', 100, 200, 120, 0.15, 'Greenwood Bakery', 'Freezer', 2),
('crispy-manna-discs', 'Crispy Manna Discs', 'dry-goods', 'count', 40, 80, 48, 0.45, 'Greenwood Bakery', 'Dry Storage', 2),
('red-dragon-scales', 'Red Dragon Scales', 'dry-goods', 'lbs', 10, 20, 12, 2.50, 'Sherwood Provisions', 'Dry Storage', 3),

-- Sauces & Beverages
('hot-sauce', 'Dragon''s Breath Hot Sauce', 'other', 'gal', 4, 8, 5, 12.99, 'Sherwood Provisions', 'Dry Storage', 3),
('phoenix-sauce', 'Phoenix Sauce', 'other', 'gal', 5, 10, 6, 15.99, 'Sherwood Provisions', 'Dry Storage', 3),
('sirens-blue-syrup', 'Siren''s Blue Syrup', 'beverage', 'gal', 8, 12, 7, 18.99, 'Sherwood Provisions', 'Dry Storage', 4);

-- ============================================================================
-- RECIPES (22 fantasy-themed menu items)
-- ============================================================================
INSERT INTO recipes (id, name, category, yield_percent, sell_price, active) VALUES
('spell-burrito', 'Spell-Bound Burrito', 'Burritos', 92, 8.99, true),
('sherwood-crunch', 'Sherwood Crunchwrap', 'Specialties', 90, 7.49, true),
('outlaw-steak-taco', 'Outlaw Steak Taco', 'Tacos', 88, 4.99, true),
('forest-quesadilla', 'Enchanted Forest Quesadilla', 'Specialties', 95, 6.99, true),
('merry-nachos', 'Merry Men''s Nachos', 'Sides', 90, 5.99, true),
('arrow-chalupa', 'Golden Arrow Chalupa', 'Specialties', 85, 5.49, true),
('cosmic-crunch-wrap', 'Cosmic Crunch Wrap', 'Specialties', 90, 6.29, true),
('lunar-layered-taco', 'Lunar Layered Taco', 'Tacos', 88, 5.69, true),
('sirens-blue-freeze', 'Siren''s Blue Freeze', 'Beverages', 100, 4.49, true),
('dragon-dust-taco', 'Dragon Dust Taco', 'Tacos', 92, 3.49, true),
('mystic-mandala-pizza', 'Mystic Mandala Pizza', 'Specialties', 85, 6.99, true),
('titans-mountain-nachos', 'Titan''s Mountain Nachos', 'Sides', 88, 7.99, true),
('chimeric-chalupa', 'Chimeric Chalupa', 'Specialties', 85, 5.29, true),
('hidden-scroll-burrito', 'Hidden Scroll Burrito', 'Burritos', 90, 5.99, true),
('sweet-spirit-orbs', 'Sweet Spirit Orbs (12pk)', 'Dessert', 95, 6.49, true),
('cloud-walker-taco', 'Cloud Walker Taco', 'Tacos', 95, 2.89, true),
('earth-binder-burrito', 'Earth Binder Burrito', 'Burritos', 95, 2.49, true),
('fire-gem-potato-taco', 'Fire Gem Potato Taco', 'Tacos', 90, 1.99, true),
('phoenix-feather-quesadilla', 'Phoenix Feather Quesadilla', 'Specialties', 92, 6.49, true),
('golden-nugget-potatoes', 'Golden Nugget Potatoes', 'Sides', 90, 3.49, true),
('heros-feast-bowl', 'Hero''s Feast Bowl', 'Bowls', 95, 8.49, true);

-- ============================================================================
-- RECIPE_INGREDIENTS (Junction table - replaces JSONB ingredients)
-- ============================================================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
-- Spell-Bound Burrito
('spell-burrito', 'seasoned-beef', 0.25),
('spell-burrito', 'flour-tortillas', 0.083),
('spell-burrito', 'nacho-cheese', 0.1),
('spell-burrito', 'shredded-lettuce', 0.05),

-- Sherwood Crunchwrap
('sherwood-crunch', 'seasoned-beef', 0.2),
('sherwood-crunch', 'flour-tortillas', 0.083),
('sherwood-crunch', 'crunchy-shells', 0.083),
('sherwood-crunch', 'nacho-cheese', 0.08),
('sherwood-crunch', 'diced-tomatoes', 0.05),
('sherwood-crunch', 'sour-cream', 0.05),

-- Outlaw Steak Taco
('outlaw-steak-taco', 'steak-strips', 0.15),
('outlaw-steak-taco', 'crunchy-shells', 0.083),
('outlaw-steak-taco', 'shredded-lettuce', 0.03),
('outlaw-steak-taco', 'cheddar-cheese', 0.04),

-- Enchanted Forest Quesadilla
('forest-quesadilla', 'grilled-chicken', 0.2),
('forest-quesadilla', 'flour-tortillas', 0.083),
('forest-quesadilla', 'cheddar-cheese', 0.12),
('forest-quesadilla', 'nacho-cheese', 0.05),

-- Merry Men's Nachos
('merry-nachos', 'seasoned-beef', 0.15),
('merry-nachos', 'nacho-cheese', 0.12),
('merry-nachos', 'guacamole', 0.1),
('merry-nachos', 'diced-tomatoes', 0.05),

-- Golden Arrow Chalupa
('arrow-chalupa', 'grilled-chicken', 0.15),
('arrow-chalupa', 'crunchy-shells', 0.083),
('arrow-chalupa', 'shredded-lettuce', 0.04),
('arrow-chalupa', 'diced-tomatoes', 0.04),
('arrow-chalupa', 'cheddar-cheese', 0.06),

-- Cosmic Crunch Wrap
('cosmic-crunch-wrap', 'seasoned-beef', 0.15),
('cosmic-crunch-wrap', 'flour-tortillas', 0.083),
('cosmic-crunch-wrap', 'crunchy-shells', 0.083),
('cosmic-crunch-wrap', 'nacho-cheese', 0.08),
('cosmic-crunch-wrap', 'sour-cream', 0.05),
('cosmic-crunch-wrap', 'shredded-lettuce', 0.03),
('cosmic-crunch-wrap', 'diced-tomatoes', 0.04),

-- Lunar Layered Taco
('lunar-layered-taco', 'soft-cloud-flatbread', 0.083),
('lunar-layered-taco', 'crunchy-shells', 0.083),
('lunar-layered-taco', 'seasoned-beef', 0.12),
('lunar-layered-taco', 'cheddar-cheese', 0.05),
('lunar-layered-taco', 'phoenix-sauce', 0.02),
('lunar-layered-taco', 'shredded-lettuce', 0.03),

-- Siren's Blue Freeze
('sirens-blue-freeze', 'sirens-blue-syrup', 0.1),

-- Dragon Dust Taco
('dragon-dust-taco', 'dragon-dust-shells', 0.083),
('dragon-dust-taco', 'seasoned-beef', 0.12),
('dragon-dust-taco', 'shredded-lettuce', 0.03),
('dragon-dust-taco', 'cheddar-cheese', 0.04),

-- Mystic Mandala Pizza
('mystic-mandala-pizza', 'crispy-manna-discs', 2),
('mystic-mandala-pizza', 'seasoned-beef', 0.2),
('mystic-mandala-pizza', 'refried-moon-beans', 0.15),
('mystic-mandala-pizza', 'diced-tomatoes', 0.06),
('mystic-mandala-pizza', 'cheddar-cheese', 0.08),
('mystic-mandala-pizza', 'phoenix-sauce', 0.03),

-- Titan's Mountain Nachos
('titans-mountain-nachos', 'crunchy-shells', 0.15),
('titans-mountain-nachos', 'seasoned-beef', 0.25),
('titans-mountain-nachos', 'nacho-cheese', 0.2),
('titans-mountain-nachos', 'refried-moon-beans', 0.15),
('titans-mountain-nachos', 'sour-cream', 0.08),
('titans-mountain-nachos', 'diced-tomatoes', 0.08),

-- Chimeric Chalupa
('chimeric-chalupa', 'soft-cloud-flatbread', 0.083),
('chimeric-chalupa', 'seasoned-beef', 0.15),
('chimeric-chalupa', 'sour-cream', 0.04),
('chimeric-chalupa', 'shredded-lettuce', 0.03),
('chimeric-chalupa', 'cheddar-cheese', 0.04),
('chimeric-chalupa', 'diced-tomatoes', 0.04),

-- Hidden Scroll Burrito
('hidden-scroll-burrito', 'flour-tortillas', 0.166),
('hidden-scroll-burrito', 'seasoned-beef', 0.2),
('hidden-scroll-burrito', 'ancient-grains-rice', 0.1),
('hidden-scroll-burrito', 'nacho-cheese', 0.1),
('hidden-scroll-burrito', 'sour-cream', 0.05),
('hidden-scroll-burrito', 'phoenix-sauce', 0.03),

-- Sweet Spirit Orbs
('sweet-spirit-orbs', 'spirit-dough-orbs', 12),

-- Cloud Walker Taco
('cloud-walker-taco', 'flour-tortillas', 0.083),
('cloud-walker-taco', 'seasoned-beef', 0.12),
('cloud-walker-taco', 'shredded-lettuce', 0.03),
('cloud-walker-taco', 'cheddar-cheese', 0.03),
('cloud-walker-taco', 'sour-cream', 0.02),

-- Earth Binder Burrito
('earth-binder-burrito', 'flour-tortillas', 0.083),
('earth-binder-burrito', 'refried-moon-beans', 0.25),
('earth-binder-burrito', 'cheddar-cheese', 0.05),
('earth-binder-burrito', 'hot-sauce', 0.01),

-- Fire Gem Potato Taco
('fire-gem-potato-taco', 'flour-tortillas', 0.083),
('fire-gem-potato-taco', 'golden-potato-gems', 0.15),
('fire-gem-potato-taco', 'phoenix-sauce', 0.02),
('fire-gem-potato-taco', 'shredded-lettuce', 0.03),
('fire-gem-potato-taco', 'cheddar-cheese', 0.02),

-- Phoenix Feather Quesadilla
('phoenix-feather-quesadilla', 'flour-tortillas', 0.083),
('phoenix-feather-quesadilla', 'grilled-chicken', 0.2),
('phoenix-feather-quesadilla', 'cheddar-cheese', 0.15),
('phoenix-feather-quesadilla', 'phoenix-sauce', 0.04),

-- Golden Nugget Potatoes
('golden-nugget-potatoes', 'golden-potato-gems', 0.3),
('golden-nugget-potatoes', 'nacho-cheese', 0.1),
('golden-nugget-potatoes', 'sour-cream', 0.05),

-- Hero's Feast Bowl
('heros-feast-bowl', 'ancient-grains-rice', 0.2),
('heros-feast-bowl', 'refried-moon-beans', 0.15),
('heros-feast-bowl', 'grilled-chicken', 0.2),
('heros-feast-bowl', 'cheddar-cheese', 0.05),
('heros-feast-bowl', 'sour-cream', 0.05),
('heros-feast-bowl', 'guacamole', 0.1),
('heros-feast-bowl', 'shredded-lettuce', 0.05);

-- ============================================================================
-- SALES_EVENTS (60 days of realistic historical sales)
-- Based on original daily_sales patterns with time-of-day variation
-- ============================================================================

-- Generate 60 days of sales with realistic patterns
DO $$
DECLARE
  recipe_data RECORD;
  sale_day DATE;
  day_of_week INT;
  base_sales NUMERIC[];
  daily_count INT;
  hour_of_day INT;
  sales_this_hour INT;
  i INT;
BEGIN
  -- Loop through each recipe
  FOR recipe_data IN 
    SELECT id, 
      CASE id
        WHEN 'spell-burrito' THEN ARRAY[38,36,48,56,71,82,62]
        WHEN 'sherwood-crunch' THEN ARRAY[43,41,55,63,81,94,72]
        WHEN 'outlaw-steak-taco' THEN ARRAY[28,27,36,41,53,62,47]
        WHEN 'forest-quesadilla' THEN ARRAY[27,25,33,38,49,57,44]
        WHEN 'merry-nachos' THEN ARRAY[21,20,27,31,40,46,35]
        WHEN 'arrow-chalupa' THEN ARRAY[18,17,22,25,32,37,29]
        WHEN 'cosmic-crunch-wrap' THEN ARRAY[59,56,75,86,111,129,99]
        WHEN 'lunar-layered-taco' THEN ARRAY[49,46,62,71,92,107,82]
        WHEN 'sirens-blue-freeze' THEN ARRAY[84,79,105,121,157,182,140]
        WHEN 'dragon-dust-taco' THEN ARRAY[66,62,83,96,125,145,111]
        WHEN 'mystic-mandala-pizza' THEN ARRAY[35,33,44,51,66,76,59]
        WHEN 'titans-mountain-nachos' THEN ARRAY[31,30,40,46,60,70,53]
        WHEN 'chimeric-chalupa' THEN ARRAY[42,40,53,61,79,92,70]
        WHEN 'hidden-scroll-burrito' THEN ARRAY[38,36,48,56,71,82,62]
        WHEN 'sweet-spirit-orbs' THEN ARRAY[28,27,36,41,53,62,47]
        WHEN 'cloud-walker-taco' THEN ARRAY[70,66,88,102,132,153,117]
        WHEN 'earth-binder-burrito' THEN ARRAY[45,43,57,66,85,99,76]
        WHEN 'fire-gem-potato-taco' THEN ARRAY[56,53,70,81,105,122,93]
        WHEN 'phoenix-feather-quesadilla' THEN ARRAY[38,36,48,56,71,82,62]
        WHEN 'golden-nugget-potatoes' THEN ARRAY[31,30,40,46,60,70,53]
        WHEN 'heros-feast-bowl' THEN ARRAY[24,23,31,36,46,54,41]
        ELSE ARRAY[20,20,25,30,35,40,30]
      END as daily_pattern
    FROM recipes
  LOOP
    base_sales := recipe_data.daily_pattern;
    
    -- Generate sales for last 60 days
    FOR day_offset IN 0..59 LOOP
      sale_day := CURRENT_DATE - day_offset;
      day_of_week := EXTRACT(DOW FROM sale_day)::INT;
      
      -- Get base daily count from pattern (cycles through week)
      daily_count := base_sales[(day_of_week % 7) + 1];
      
      -- Distribute sales throughout the day
      -- Lunch rush: 11am-2pm (40% of sales)
      -- Dinner rush: 5pm-8pm (45% of sales)
      -- Other hours: 10am, 3pm-4pm, 9pm-10pm (15% of sales)
      
      -- Lunch rush
      FOR hour_of_day IN 11..14 LOOP
        sales_this_hour := CEIL(daily_count * 0.10 * (0.9 + random() * 0.2));
        FOR i IN 1..sales_this_hour LOOP
          INSERT INTO sales_events (id, recipe_id, quantity, sale_timestamp)
          VALUES (
            gen_random_uuid()::TEXT,
            recipe_data.id,
            1,
            sale_day + (hour_of_day || ' hours')::INTERVAL + (random() * 59 || ' minutes')::INTERVAL
          );
        END LOOP;
      END LOOP;
      
      -- Dinner rush
      FOR hour_of_day IN 17..20 LOOP
        sales_this_hour := CEIL(daily_count * 0.11 * (0.9 + random() * 0.2));
        FOR i IN 1..sales_this_hour LOOP
          INSERT INTO sales_events (id, recipe_id, quantity, sale_timestamp)
          VALUES (
            gen_random_uuid()::TEXT,
            recipe_data.id,
            1,
            sale_day + (hour_of_day || ' hours')::INTERVAL + (random() * 59 || ' minutes')::INTERVAL
          );
        END LOOP;
      END LOOP;
      
      -- Off-peak hours
      FOREACH hour_of_day IN ARRAY ARRAY[10, 15, 16, 21, 22] LOOP
        sales_this_hour := CEIL(daily_count * 0.03 * (0.8 + random() * 0.4));
        FOR i IN 1..sales_this_hour LOOP
          INSERT INTO sales_events (id, recipe_id, quantity, sale_timestamp)
          VALUES (
            gen_random_uuid()::TEXT,
            recipe_data.id,
            1,
            sale_day + (hour_of_day || ' hours')::INTERVAL + (random() * 59 || ' minutes')::INTERVAL
          );
        END LOOP;
      END LOOP;
      
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- ORDERS (Historical and pending orders)
-- ============================================================================
INSERT INTO orders (id, vendor, items, status, delivery_date, total_cost) VALUES
('ord_001', 'Sherwood Meats', '[
  {"ingredient_id": "seasoned-beef", "quantity": 80, "unit_cost": 3.49},
  {"ingredient_id": "grilled-chicken", "quantity": 50, "unit_cost": 4.29},
  {"ingredient_id": "steak-strips", "quantity": 25, "unit_cost": 8.99}
]', 'delivered', CURRENT_DATE - 7, 708.95),

('ord_002', 'Greenwood Farms', '[
  {"ingredient_id": "shredded-lettuce", "quantity": 30, "unit_cost": 1.99},
  {"ingredient_id": "diced-tomatoes", "quantity": 40, "unit_cost": 1.79},
  {"ingredient_id": "guacamole", "quantity": 30, "unit_cost": 4.49},
  {"ingredient_id": "golden-potato-gems", "quantity": 80, "unit_cost": 0.89}
]', 'delivered', CURRENT_DATE - 5, 376.50),

('ord_003', 'Friar Tuck Dairy', '[
  {"ingredient_id": "nacho-cheese", "quantity": 40, "unit_cost": 2.99},
  {"ingredient_id": "sour-cream", "quantity": 18, "unit_cost": 3.99},
  {"ingredient_id": "cheddar-cheese", "quantity": 12, "unit_cost": 3.49}
]', 'delivered', CURRENT_DATE - 4, 233.30),

('ord_004', 'Greenwood Bakery', '[
  {"ingredient_id": "flour-tortillas", "quantity": 50, "unit_cost": 2.49},
  {"ingredient_id": "crunchy-shells", "quantity": 80, "unit_cost": 1.89},
  {"ingredient_id": "dragon-dust-shells", "quantity": 40, "unit_cost": 2.29}
]', 'delivered', CURRENT_DATE - 3, 387.30),

('ord_005', 'Sherwood Provisions', '[
  {"ingredient_id": "hot-sauce", "quantity": 5, "unit_cost": 12.99},
  {"ingredient_id": "phoenix-sauce", "quantity": 8, "unit_cost": 15.99},
  {"ingredient_id": "sirens-blue-syrup", "quantity": 10, "unit_cost": 18.99}
]', 'delivered', CURRENT_DATE - 8, 382.07),

('ord_006', 'Sherwood Meats', '[
  {"ingredient_id": "seasoned-beef", "quantity": 60, "unit_cost": 3.49},
  {"ingredient_id": "steak-strips", "quantity": 20, "unit_cost": 8.99}
]', 'pending', CURRENT_DATE + 1, 389.20),

('ord_007', 'Greenwood Farms', '[
  {"ingredient_id": "shredded-lettuce", "quantity": 25, "unit_cost": 1.99},
  {"ingredient_id": "diced-tomatoes", "quantity": 35, "unit_cost": 1.79}
]', 'suggested', CURRENT_DATE + 2, 112.40);

-- ============================================================================
-- WASTE_ENTRIES (Historical waste tracking)
-- ============================================================================
INSERT INTO waste_entries (id, ingredient_id, qty, reason, date, cost_lost) VALUES
('w001', 'shredded-lettuce', 3, 'expired', CURRENT_DATE - 2, 5.97),
('w002', 'steak-strips', 2, 'spoiled', CURRENT_DATE - 3, 17.98),
('w003', 'guacamole', 4, 'over-prep', CURRENT_DATE - 2, 17.96),
('w004', 'sour-cream', 1, 'expired', CURRENT_DATE - 4, 3.99),
('w005', 'diced-tomatoes', 3, 'spoiled', CURRENT_DATE - 2, 5.37),
('w006', 'seasoned-beef', 2, 'over-prep', CURRENT_DATE - 3, 6.98),
('w007', 'cheddar-cheese', 1, 'expired', CURRENT_DATE - 2, 3.49),
('w008', 'grilled-chicken', 1.5, 'freezer burn', CURRENT_DATE - 5, 6.44),
('w009', 'soft-cloud-flatbread', 0.5, 'mold', CURRENT_DATE - 1, 2.00),
('w010', 'nacho-cheese', 2, 'past prime', CURRENT_DATE - 6, 5.98);

-- ============================================================================
-- INVENTORY_TRANSACTIONS (Recent inventory movements)
-- ============================================================================
INSERT INTO inventory_transactions (id, ingredient_id, quantity, transaction_type, reference_id, transaction_timestamp, notes) VALUES
-- Recent deliveries
('txn_001', 'seasoned-beef', 80, 'purchase', 'ord_001', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Weekly meat delivery'),
('txn_002', 'grilled-chicken', 50, 'purchase', 'ord_001', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Weekly meat delivery'),
('txn_003', 'guacamole', 30, 'purchase', 'ord_002', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Fresh produce order'),
('txn_004', 'flour-tortillas', 50, 'purchase', 'ord_004', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Bakery restock'),

-- Waste transactions
('txn_005', 'shredded-lettuce', -3, 'waste', 'w001', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Expired produce'),
('txn_006', 'steak-strips', -2, 'waste', 'w002', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Spoilage'),

-- Manual adjustments
('txn_007', 'cheddar-cheese', 5, 'adjustment', NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Inventory count correction'),
('txn_008', 'hot-sauce', -1, 'adjustment', NULL, CURRENT_TIMESTAMP - INTERVAL '4 days', 'Broken bottle');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
SELECT '=== DATABASE POPULATED ===' as status;
SELECT 'Recipes' as table_name, COUNT(*) as count FROM recipes
UNION ALL
SELECT 'Ingredients', COUNT(*) FROM ingredients
UNION ALL
SELECT 'Recipe Ingredients', COUNT(*) FROM recipe_ingredients
UNION ALL
SELECT 'Sales Events', COUNT(*) FROM sales_events
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Waste Entries', COUNT(*) FROM waste_entries
UNION ALL
SELECT 'Inventory Transactions', COUNT(*) FROM inventory_transactions;

-- Show sales summary by recipe
SELECT 
  r.name,
  COUNT(*) as total_sales,
  MIN(s.sale_timestamp::DATE) as earliest_sale,
  MAX(s.sale_timestamp::DATE) as latest_sale
FROM recipes r
LEFT JOIN sales_events s ON r.id = s.recipe_id
GROUP BY r.name
ORDER BY total_sales DESC
LIMIT 10;