$headers = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10"
}
Write-Host "Fetching stores..."
$stores = Invoke-RestMethod -Uri "https://schcpfbnochnevsivtaj.supabase.co/rest/v1/stores?select=id,subdomain,custom_domain&or=(subdomain.eq.nailashopmix,subdomain.eq.nailashopmix.criarlojas.com.br,custom_domain.eq.nailashopmix.criarlojas.com.br)" -Headers $headers
$stores | ConvertTo-Json -Depth 5

if ($stores) {
  $storeId = $stores.id
  if ($stores -is [array]) {
    $storeId = $stores[0].id
  }
  Write-Host "Store ID found: $storeId. Fetching products..."
  $products = Invoke-RestMethod -Uri "https://schcpfbnochnevsivtaj.supabase.co/rest/v1/products?select=id,name,slug,is_active&store_id=eq.$storeId" -Headers $headers
  $products | ConvertTo-Json -Depth 5
}
