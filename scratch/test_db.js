const url = "https://schcpfbnochnevsivtaj.supabase.co/rest/v1/products?select=id,name,slug,store_id";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10";

fetch(url, {
  headers: {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("Products in Database:");
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error(err));
