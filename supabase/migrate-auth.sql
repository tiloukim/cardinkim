-- CardinKim Auth Migration
-- Adds customer accounts with Supabase Auth
-- Run this in Supabase SQL Editor

-- 1. Add auth_id column to ck_customers (nullable for guest checkout)
ALTER TABLE ck_customers
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- 2. Create index on auth_id
CREATE INDEX IF NOT EXISTS idx_ck_customers_auth ON ck_customers(auth_id);

-- 3. Trigger: auto-link or create customer on signup
CREATE OR REPLACE FUNCTION ck_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If email matches existing guest customer, link them
  UPDATE ck_customers
  SET auth_id = NEW.id
  WHERE email = NEW.email AND auth_id IS NULL;

  -- If no existing customer row, create one
  IF NOT FOUND THEN
    INSERT INTO ck_customers (email, name, auth_id)
    VALUES (
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ck_handle_new_user();

-- 4. RLS policies for authenticated customers

-- Customers can read their own profile
CREATE POLICY "customers_read_own" ON ck_customers
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

-- Customers can update their own profile
CREATE POLICY "customers_update_own" ON ck_customers
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Customers can read their own orders
CREATE POLICY "customers_read_own_orders" ON ck_orders
  FOR SELECT TO authenticated
  USING (customer_id IN (
    SELECT id FROM ck_customers WHERE auth_id = auth.uid()
  ));

-- Customers can read their own order items
CREATE POLICY "customers_read_own_items" ON ck_order_items
  FOR SELECT TO authenticated
  USING (order_id IN (
    SELECT o.id FROM ck_orders o
    JOIN ck_customers c ON o.customer_id = c.id
    WHERE c.auth_id = auth.uid()
  ));
