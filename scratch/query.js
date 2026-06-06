const url = "https://schcpfbnochnevsivtaj.supabase.co/rest/v1/stores?select=id,subdomain,custom_domain&or=(subdomain.eq.nailashopmix,subdomain.eq.nailashopmix.criarlojas.com.br,custom_domain.eq.nailashopmix.criarlojas.com.br)";
const headers = {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10"
};

async function run() {
  try {
    const res = await fetch(url, { headers });
    const stores = await res.json();
    console.log("Stores found:", stores);
    
    if (stores.length > 0) {
      const storeId = stores[0].id;
      // Now fetch all products for this store to inspect their slugs
      const productsUrl = `https://schcpfbnochnevsivtaj.supabase.co/rest/v1/products?select=id,name,slug,is_active&store_id=eq.${storeId}`;
      const res2 = await fetch(productsUrl, { headers });
      const products = await res2.json();
      console.log("Products in this store:", products);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
