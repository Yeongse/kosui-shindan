###############################################################################
# 香水診断 調香箋 — Cloudflare 静的ホスティング
#
#   1. npm run build            … out/ に静的サイトを書き出す
#   2. terraform apply          … out/ を Workers の静的アセットとしてアップロードし、
#                                 独自ドメイン・リダイレクト・解析を設定する
#
# サーバー機能は持たない（OG画像はビルド時生成、`?d=` はブラウザ側で解決）。
###############################################################################

data "cloudflare_zone" "this" {
  filter = {
    name = var.domain
  }
}

locals {
  # provider のバージョンによって zone の識別子が zone_id / id のどちらかに入るため両対応
  zone_id = try(coalesce(data.cloudflare_zone.this.zone_id, data.cloudflare_zone.this.id), data.cloudflare_zone.this.id)
}

# --- 静的サイト本体（アセットのみ・Worker コードは持たない） ----------------
# スクリプトを置かない「アセット専用」構成。リクエストは Cloudflare のアセット配信層で
# 完結し、Worker は起動しない（コールドスタートなし・Worker のリクエスト課金なし）。
# 将来サーバー処理が必要になったら content_file / main_module と ASSETS バインディングを足す。
resource "cloudflare_workers_script" "site" {
  account_id  = var.account_id
  script_name = var.worker_name

  compatibility_date = var.compatibility_date

  assets = {
    directory = var.assets_directory

    config = {
      # /type/gekko → type/gekko.html。末尾スラッシュ付きは 301 で落とす（canonical と一致させる）
      html_handling = "drop-trailing-slash"
      # どのアセットにも一致しないリクエストは 404.html を 404 で返す
      not_found_handling = "404-page"

      headers   = file("${path.module}/../cloudflare/_headers")
      redirects = file("${path.module}/../cloudflare/_redirects")
    }
  }

  observability = {
    enabled = true
  }
}

# --- 独自ドメイン（DNS と証明書は Cloudflare 側で自動設定される） -----------
resource "cloudflare_workers_custom_domain" "apex" {
  account_id = var.account_id
  zone_id    = local.zone_id
  hostname   = var.domain
  service    = cloudflare_workers_script.site.script_name
}

# --- www → apex の 301 ------------------------------------------------------
# リダイレクトを Cloudflare のエッジで完結させるため、www はプロキシ経由の
# ダミーレコード（RFC 6666 の破棄用プレフィックス）に向けてルールで折り返す。
resource "cloudflare_dns_record" "www" {
  count = var.redirect_www ? 1 : 0

  zone_id = local.zone_id
  name    = "www.${var.domain}"
  type    = "AAAA"
  content = "100::"
  ttl     = 1
  proxied = true
  comment = "www を apex へ 301 するためのプレースホルダ（Terraform 管理）"
}

resource "cloudflare_ruleset" "redirects" {
  count = var.redirect_www ? 1 : 0

  zone_id     = local.zone_id
  name        = "www to apex"
  description = "www.${var.domain} を https://${var.domain} へ 301（パスとクエリは維持）"
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules = [
    {
      ref         = "www_to_apex"
      description = "www → apex"
      expression  = "(http.host eq \"www.${var.domain}\")"
      action      = "redirect"
      enabled     = true

      action_parameters = {
        from_value = {
          status_code           = 301
          preserve_query_string = true
          target_url = {
            expression = "concat(\"https://${var.domain}\", http.request.uri.path)"
          }
        }
      }
    }
  ]

  depends_on = [cloudflare_dns_record.www]
}

# --- ゾーン設定 -------------------------------------------------------------
resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = local.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

# --- アクセス解析（Cookie 不使用・スニペット自動挿入） ----------------------
resource "cloudflare_web_analytics_site" "this" {
  count = var.enable_web_analytics ? 1 : 0

  account_id   = var.account_id
  zone_tag     = local.zone_id
  auto_install = true
}
