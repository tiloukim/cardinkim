-- Add delivery tracking columns to ck_orders
ALTER TABLE ck_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE ck_orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE ck_orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE ck_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
