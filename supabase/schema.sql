-- CardinKim CRM Schema
-- Run this in Supabase SQL Editor

-- Products
CREATE TABLE IF NOT EXISTS ck_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  category TEXT NOT NULL,
  collection TEXT DEFAULT 'new',
  colors JSONB DEFAULT '[{"n":"Default","h":"#ccc"}]'::jsonb,
  sizes TEXT[] DEFAULT ARRAY['One Size'],
  image_url TEXT NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT DEFAULT '',
  condition TEXT DEFAULT 'New',
  badge TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS ck_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  auth_id UUID UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS ck_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES ck_customers(id),
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid','processing','shipped','delivered')),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  promo_code TEXT,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  tracking_number TEXT,
  carrier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS ck_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES ck_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES ck_products(id),
  title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  color TEXT DEFAULT '',
  size TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  image_url TEXT DEFAULT ''
);

-- Notifications
CREATE TABLE IF NOT EXISTS ck_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT DEFAULT 'new_order',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES ck_orders(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock decrement function
CREATE OR REPLACE FUNCTION ck_decrement_stock(p_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE ck_products
  SET stock = GREATEST(stock - qty, 0),
      updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ck_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_notifications ENABLE ROW LEVEL SECURITY;

-- Anon can read active products
CREATE POLICY "anon_read_active_products" ON ck_products
  FOR SELECT USING (is_active = true);

-- Service role can do everything (default for service key)
-- No additional policies needed for service role

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ck_products_active ON ck_products(is_active);
CREATE INDEX IF NOT EXISTS idx_ck_products_category ON ck_products(category);
CREATE INDEX IF NOT EXISTS idx_ck_orders_status ON ck_orders(status);
CREATE INDEX IF NOT EXISTS idx_ck_orders_customer ON ck_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_ck_order_items_order ON ck_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ck_notifications_unread ON ck_notifications(is_read) WHERE is_read = false;
