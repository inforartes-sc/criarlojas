$headers = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUxMTEsImV4cCI6MjA5NDIwMTExMX0.r13tp92PhfT0JZLXd-GNkET_ceqcOu87mCL35spWs10"
}
Write-Host "Fetching all stores..."
$stores = Invoke-RestMethod -Uri "https://schcpfbnochnevsivtaj.supabase.co/rest/v1/stores?select=id,name,subdomain,custom_domain,settings" -Headers $headers
$stores | ForEach-Object {
    [PSCustomObject]@{
        id = $_.id
        name = $_.name
        subdomain = $_.subdomain
        custom_domain = $_.custom_domain
        store_mode = $_.settings.store_mode
        layout_model = $_.settings.layout_model
    }
} | ConvertTo-Json -Depth 5
