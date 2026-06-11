CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10,2),
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para todos" ON abandoned_carts;
CREATE POLICY "Permitir tudo para todos" ON abandoned_carts FOR ALL USING (true) WITH CHECK (true);
