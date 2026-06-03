-- =====================================================
-- CRIAÇÃO DA TABELA DE AVALIAÇÕES (product_reviews)
-- Execute este script no Supabase SQL Editor:
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso simples para leitura e escrita
DROP POLICY IF EXISTS "Permitir tudo para todos" ON product_reviews;
CREATE POLICY "Permitir tudo para todos" ON product_reviews
  FOR ALL USING (true) WITH CHECK (true);

-- Recarregar o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
