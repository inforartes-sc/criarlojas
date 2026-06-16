const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function run() {
  const sql = `
    CREATE OR REPLACE FUNCTION get_db_size() 
    RETURNS NUMERIC AS $$ 
    BEGIN 
      RETURN pg_database_size(current_database()); 
    END; 
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE OR REPLACE FUNCTION get_active_connections() 
    RETURNS INTEGER AS $$ 
    BEGIN 
      RETURN (SELECT count(*)::integer FROM pg_stat_activity); 
    END; 
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Configurar todos os relacionamentos com 'stores' para ON DELETE CASCADE dinamicamente
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN 
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                tc.constraint_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE 
                tc.constraint_type = 'FOREIGN KEY' 
                AND ccu.table_name = 'stores'
                AND tc.table_schema = 'public'
        LOOP
            BEGIN
                EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || ' FOREIGN KEY (' || quote_ident(r.column_name) || ') REFERENCES stores(id) ON DELETE CASCADE';
                RAISE NOTICE 'Updated constraint % on table % to ON DELETE CASCADE', r.constraint_name, r.table_name;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not update constraint % on table %', r.constraint_name, r.table_name;
            END;
        END LOOP;
    END;
    $$;
  `;

  console.log('Running SQL query to create Postgres functions and setup CASCADE DELETE on Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error running SQL:', err);
  }
}

run();
