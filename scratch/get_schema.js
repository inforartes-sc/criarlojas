const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY'; // service role

async function run() {
  const url = `${supabaseUrl}/rest/v1/`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch schema:', response.statusText);
    return;
  }

  const schema = await response.json();
  console.log('EXPOSED TABLES AND DEFINITIONS:');
  
  if (schema.paths) {
    const paths = Object.keys(schema.paths);
    paths.forEach(path => {
      if (path !== '/' && !path.includes('/rpc/')) {
        console.log(`- Table/Endpoint: ${path}`);
      }
    });
  }

  if (schema.definitions) {
    console.log('\nDEFINITIONS:');
    Object.keys(schema.definitions).forEach(name => {
      console.log(`- ${name}`);
      const def = schema.definitions[name];
      if (def.properties) {
        console.log('  Columns:');
        Object.keys(def.properties).forEach(col => {
          console.log(`    * ${col}: ${def.properties[col].type}`);
        });
      }
    });
  }
}

run();
