variable "cloudflare_api_token" {
  description = "Cloudflare API トークン。通常は環境変数 CLOUDFLARE_API_TOKEN を使い、ここは空のままにする"
  type        = string
  default     = ""
  sensitive   = true
}

variable "account_id" {
  description = "Cloudflare アカウントID（ダッシュボード右下、またはアカウントホームのURLに含まれる32桁）"
  type        = string
}

variable "domain" {
  description = "本番ドメイン（Cloudflare にゾーンが存在すること）"
  type        = string
  default     = "kosui-shindan.com"
}

variable "worker_name" {
  description = "Worker（静的サイト）の名前"
  type        = string
  default     = "kosui-shindan"
}

variable "assets_directory" {
  description = "アップロードする静的ファイルのディレクトリ（Next.js の `npm run build` が出力する out/）"
  type        = string
  default     = "../../out"
}

variable "redirect_www" {
  description = "www.<domain> を apex へ 301 でリダイレクトする"
  type        = bool
  default     = true
}

variable "enable_web_analytics" {
  description = "Cloudflare Web Analytics を有効にする（Cookie 不使用・スニペットは自動挿入）"
  type        = bool
  default     = true
}

variable "compatibility_date" {
  description = "Workers の互換性日付"
  type        = string
  default     = "2026-08-01"
}
