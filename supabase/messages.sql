-- Chat Messages between customers and admin
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ck_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES ck_customers(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ck_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ck_messages_customer ON ck_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_ck_messages_unread ON ck_messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_ck_messages_created ON ck_messages(created_at);
