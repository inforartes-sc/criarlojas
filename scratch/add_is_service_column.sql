-- Adiciona a coluna is_service à tabela products para suportar serviços e produtos físicos no modelo de advocacia/serviços
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT FALSE;
