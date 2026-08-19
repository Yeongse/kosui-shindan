# Cloudflare へのデプロイ（Terraform）

静的サイト（`out/`）を Cloudflare Workers の静的アセットとして配信する。サーバー機能は持たない。

```
npm run build          # out/ を作る（OG画像の生成 → next build）
cd infra/terraform
terraform apply        # out/ をアップロードし、ドメイン・リダイレクト・解析を設定
```

## 前提

- `kosui-shindan.com` のゾーンが Cloudflare に存在すること（Cloudflare Registrar で取得済み）
- Terraform 1.9 以上

## 初回だけの手順

1. **API トークンを作る**
   Cloudflare ダッシュボード → 「マイプロフィール」→「API トークン」→「トークンを作成」→「カスタムトークン」。
   必要な権限:

   | 種別 | 対象 | 権限 |
   |---|---|---|
   | アカウント | Workers スクリプト | 編集 |
   | アカウント | Web Analytics | 編集 |
   | ゾーン | Workers ルート | 編集 |
   | ゾーン | DNS | 編集 |
   | ゾーン | ゾーン設定 | 編集 |
   | ゾーン | 設定変更（Config Rules / Transform Rules） | 編集 |

   ゾーンリソースは `kosui-shindan.com` に限定してよい。

2. **アカウントIDを控える**（ダッシュボードのアカウントホームURL、または右下に表示される32桁）

3. **変数を用意する**

   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars   # account_id を記入
   export CLOUDFLARE_API_TOKEN='...'              # トークンはファイルに書かない
   terraform init
   ```

4. **反映**

   ```bash
   cd ../..            # リポジトリルート
   npm run build
   cd infra/terraform
   terraform plan      # 差分を確認
   terraform apply
   ```

## 作られるもの

| リソース | 役割 |
|---|---|
| `cloudflare_workers_script.site` | 静的アセット（`out/`）の配信。`_headers` / `_redirects` もここに含まれる |
| `cloudflare_workers_custom_domain.apex` | `kosui-shindan.com` を Worker に接続（DNSと証明書は自動） |
| `cloudflare_dns_record.www` + `cloudflare_ruleset.redirects` | `www` → apex の 301（パス・クエリを維持） |
| `cloudflare_zone_setting.always_use_https` | HTTP → HTTPS の常時リダイレクト |
| `cloudflare_web_analytics_site.this` | Cookie 不使用のアクセス解析（スニペットは自動挿入） |

URL の解決規則（`infra/cloudflare/_headers` / `_redirects` と Terraform の設定）:

- `/type/gekko` → `out/type/gekko.html`、`/type/gekko/` は `/type/gekko` へ 301
- 未一致は `out/404.html` を 404 で返す
- 旧URL（`/q`、`/types`、`/r/{コード}`）は現行URLへ 301
- `/_next/static/*` は 1年キャッシュ、画像・OGは1週間キャッシュ

この挙動はローカルでも再現できる（`npm run serve` → http://localhost:3199 ）。E2E もこの上で実行される。

## 更新するとき

コンテンツや画像を変えたら、**ビルドし直して apply** するだけ。

```bash
npm run build && (cd infra/terraform && terraform apply)
```

## 注意: 環境変数はビルド時に焼き込まれる

`NEXT_PUBLIC_*`（アフィリエイトID・体験リンク）は**ビルドしたマシンの値**が静的HTMLに埋め込まれる。
Cloudflare 側に環境変数を置いても反映されない。値を変えたら `.env.local` を直して**ビルドし直す**こと。

## 後片付け

```bash
terraform destroy
```

ゾーン（ドメイン）自体は Terraform の管理外なので消えない。
