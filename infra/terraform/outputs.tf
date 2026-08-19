output "site_url" {
  description = "公開URL"
  value       = "https://${var.domain}"
}

output "worker_name" {
  description = "デプロイ先の Worker 名"
  value       = cloudflare_workers_script.site.script_name
}

output "zone_id" {
  description = "対象ゾーンのID"
  value       = local.zone_id
}

output "web_analytics_site_token" {
  description = "Cloudflare Web Analytics のサイトトークン（auto_install のため通常は設定不要）"
  value       = try(cloudflare_web_analytics_site.this[0].site_token, null)
  sensitive   = true
}
