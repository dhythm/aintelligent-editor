# AIntelligent Editor

## 必要要件

- Node.js >= 20
- Go >= 1.22
- Docker (PostgreSQL用)
- pnpm

## Setting up

```sh
pnpm dlx create-turbo@latest

? Where would you like to create your Turborepo? aintelligent-editor
? Which package manager do you want to use? pnpm
```

```sh
rm -fr apps/docs
rm -fr apps/web/*

sh -c 'rsync -av --remove-source-files "$1/" $2 && find "$1" -type d -empty -delete' _ <V0_CODE_PATH> ./apps/web
rm -f apps/web/pnpm-lock.yaml

pnpm install
```

## Go API の起動

### 1. 環境変数の設定

`.env` ファイルを作成して必要な環境変数を設定します：

```sh
cp .env.example .env
cp apps/go-api/.env.example apps/go-api/.env
```

以下の環境変数を設定してください：
- `OPENAI_API_KEY`: OpenAI APIキー
- `POSTGRES_DSN`: PostgreSQL接続文字列（デフォルト: `postgres://postgres:postgres@localhost:5432/app?sslmode=disable`）

### 2. PostgreSQLの起動

```sh
docker compose -f docker/compose.db.yml up -d
```

### 3. Goツールのインストール

```sh
# マイグレーションツール
go install github.com/pressly/goose/v3/cmd/goose@latest

# ホットリロード用（オプション）
go install github.com/cosmtrek/air@latest
```

### 4. DBマイグレーション

```sh
pnpm run migrate
```

### 5. 開発サーバーの起動

すべてのサービスを起動：
```sh
pnpm run dev
```

個別に起動する場合：
```sh
# バックエンドのみ
pnpm --filter go-api dev

# フロントエンドのみ
pnpm --filter web dev
```

## API動作確認

### ヘルスチェック
```sh
curl http://localhost:8080/healthz
```

### 要約API
```sh
curl -X POST http://localhost:8080/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "これはテスト用の長い文章です。要約APIは入力されたテキストを簡潔にまとめます。"
  }'
```

### リライトAPI
```sh
curl -X POST http://localhost:8080/api/ai/rewrite \
  -H "Content-Type: application/json" \
  -d '{
    "text": "これはテスト文章です。",
    "tone": "polite"
  }'
```

トーンのオプション：
- `polite`: 丁寧な文体
- `casual`: カジュアルな文体
- `shorter`: より簡潔に
- `simplify`: わかりやすく

## テストの実行

すべてのテストを実行：
```sh
pnpm run test
```

Go APIのテストのみ：
```sh
pnpm --filter go-api test
```

## ビルド

```sh
pnpm run build
```

## その他のコマンド

```sh
# Lintの実行
pnpm run lint

# 型チェック
pnpm run typecheck

# PostgreSQLの停止
docker compose -f docker/compose.db.yml down

# PostgreSQLの停止とデータ削除
docker compose -f docker/compose.db.yml down -v
```