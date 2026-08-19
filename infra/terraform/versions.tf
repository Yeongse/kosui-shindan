terraform {
  required_version = ">= 1.9.0"

  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      # 5.11 以降で Workers の静的アセットを Terraform から直接アップロードできる
      version = "~> 5.11"
    }
  }

  # 状態ファイルはローカル。共同作業する場合は R2 + S3 互換バックエンドに切り替える
  # backend "s3" { ... }
}

provider "cloudflare" {
  # CLOUDFLARE_API_TOKEN 環境変数から読む（tfvars に書かない）
  api_token = var.cloudflare_api_token != "" ? var.cloudflare_api_token : null
}
