You are an expert repo surgeon. Work in the current Turborepo at repo root.
Goal: Add a Go backend (apps/go-api) that talks to Postgres and OpenAI API, wired for local dev alongside the existing frontend at apps/web (from v0.dev). Make changes idempotent.

# ========================
# 0) Assumptions & Conventions
# ========================
- Monorepo structure: turbo at root, frontend in apps/web (Next.js or Vite).
- Node: >= 20, pnpm enabled (or use npm if pnpm is missing).
- Go: 1.22+. Use pgx (pool) for Postgres. Use official openai-go SDK.
- Dev ports: web=3000, api=8080, db=5432.
- API base URL for web (during dev): http://localhost:8080
- Create docker/compose.db.yml for Postgres.
- Use goose for DB migrations.
- Use chi for HTTP routing. Enable CORS for http://localhost:3000 .
- Put Go build artifact into apps/go-api/bin/ so turbo cache works.
- If turbo.json or package.json scripts exist, merge minimally (do not break other tasks).

# ========================
# 1) Root-level files (turbo, scripts, env)
# ========================
Create or patch the following:

1. package.json (root): ensure dev/build/test/lint/migrate scripts that delegate to turbo.
- If no package.json exists, create minimal one.
- If exists, add missing scripts only.

--- file: package.json (merge or create) ---
{
  "name": "workspace",
  "private": true,
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "migrate": "turbo run migrate"
  }
}
--- end ---

2. turbo.json (root): ensure pipeline with outputs including **/bin/**
- If exists, merge keys; do not remove existing tasks.

--- file: turbo.json (merge or create) ---
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "lint": { "cache": true },
    "typecheck": { "cache": true },
    "build": {
      "dependsOn": ["^typecheck"],
      "outputs": ["**/bin/**", "**/dist/**", "**/build/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["**/coverage/**"]
    },
    "migrate": { "cache": false },
    "dev": { "cache": false, "persistent": true }
  }
}
--- end ---

3. .env.example (root): create if missing. Do not overwrite .env if present.

--- file: .env.example ---
# Common
OPENAI_API_KEY=sk-xxxxx
API_PORT=8080

# Postgres (docker-compose default)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app

# For Next.js / Vite web app
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
--- end ---

4. Ensure apps/web consumes NEXT_PUBLIC_API_BASE_URL for API calls (no code changes now; just environment contract).

# ========================
# 2) Postgres via Docker Compose
# ========================
Create docker compose file for local DB.

--- file: docker/compose.db.yml ---
services:
  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app}
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data: {}
--- end ---

# ========================
# 3) Go backend skeleton (apps/go-api)
# ========================
Create the Go app with chi, pgx, goose, openai-go. Use module path inferred from git remote if possible; otherwise default to "example.com/monorepo".

Create directories:
- apps/go-api/cmd/server
- apps/go-api/internal/{http,db,ai}
- apps/go-api/migrations
- apps/go-api/bin  (build output)

--- file: apps/go-api/go.mod (create) ---
module REPLACE_ME_MODULE/apps/go-api

go 1.22

require (
  github.com/go-chi/chi/v5 v5.0.11
  github.com/go-chi/cors v1.2.1
  github.com/jackc/pgx/v5 v5.6.0
  github.com/pressly/goose/v3 v3.23.0
  github.com/joho/godotenv v1.5.1
  github.com/openai/openai-go v0.5.0
)
--- end ---

NOTE: After creating go.mod, run `go mod tidy` later in the "Run" section. For module path:
- Try to detect `git remote get-url origin`, transform to `github.com/<org>/<repo>` then append `/apps/go-api`. If not possible, keep placeholder.

--- file: apps/go-api/package.json ---
{
  "name": "go-api",
  "private": true,
  "scripts": {
    "lint": "golangci-lint run ./... || true",
    "typecheck": "go vet ./...",
    "build": "mkdir -p bin && go build -o bin/server ./cmd/server",
    "test": "go test ./... -cover",
    "migrate": "goose -dir ./migrations postgres \"$POSTGRES_DSN\" up",
    "dev": "air || reflex -r '\\.go$' -s -- sh -c 'go build -o bin/server ./cmd/server && ./bin/server'"
  }
}
--- end ---

--- file: apps/go-api/.env.example ---
# API
API_PORT=8080

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Postgres DSN (used by app and migrate)
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/app?sslmode=disable
--- end ---

--- file: apps/go-api/internal/db/db.go ---
package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context) (*pgxpool.Pool, error) {
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		host := getenv("POSTGRES_HOST", "localhost")
		port := getenv("POSTGRES_PORT", "5432")
		user := getenv("POSTGRES_USER", "postgres")
		pass := getenv("POSTGRES_PASSWORD", "postgres")
		name := getenv("POSTGRES_DB", "app")
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, pass, host, port, name)
	}
	return pgxpool.New(ctx, dsn)
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
--- end ---

--- file: apps/go-api/internal/ai/openai.go ---
package ai

import (
	"context"
	"os"

	openai "github.com/openai/openai-go"
)

type Client struct {
	SDK *openai.Client
}

func New() *Client {
	// openai-go reads OPENAI_API_KEY from env by default when using NewClient()
	return &Client{SDK: openai.NewClient()}
}

func (c *Client) Model() string {
	if m := os.Getenv("OPENAI_MODEL"); m != "" {
		return m
	}
	// default lightweight model; adjust as needed
	return string(openai.ChatModelGPT4oMini)
}
--- end ---

--- file: apps/go-api/internal/http/handlers.go ---
package http

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	openai "github.com/openai/openai-go"
	"REPLACE_ME_MODULE/apps/go-api/internal/ai"
)

type Server struct {
	DB  *pgxpool.Pool
	AI  *ai.Client
}

func NewServer(db *pgxpool.Pool, ai *ai.Client) *http.Server {
	r := chi.NewRouter()
	// CORS for local web at 3000
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	s := &Server{DB: db, AI: ai}

	r.Get("/healthz", s.health)
	r.Post("/api/ai/summarize", s.summarize)
	r.Post("/api/ai/rewrite", s.rewrite)

	return &http.Server{
		Addr:         ":8080",
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ok"))
}

type summarizeReq struct {
	Text string `json:"text"`
}

type summarizeRes struct {
	Summary string `json:"summary"`
}

func (s *Server) summarize(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var in summarizeReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), 400); return
	}
	resp, err := s.AI.SDK.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("あなたは優秀な日本語の要約アシスタントです。要点を簡潔に日本語でまとめてください。"),
			openai.UserMessage(in.Text),
		}),
		Model: openai.F(openai.ChatModel(s.AI.Model())),
	})
	if err != nil {
		http.Error(w, err.Error(), 500); return
	}
	out := ""
	if len(resp.Content) > 0 {
		out = resp.Content[0].Text()
	}
	json.NewEncoder(w).Encode(summarizeRes{Summary: out})
}

type rewriteReq struct {
	Text  string `json:"text"`
	Tone  string `json:"tone"`  // e.g., "polite","casual","shorter","simplify"
}

type rewriteRes struct {
	Rewritten string `json:"rewritten"`
}

func (s *Server) rewrite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var in rewriteReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), 400); return
	}
	sys := "あなたは優秀な日本語のリライトアシスタントです。意味を変えず、指示されたトーンに書き換えてください。"
	prompt := "トーン: " + in.Tone + "\n本文:\n" + in.Text
	resp, err := s.AI.SDK.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(sys),
			openai.UserMessage(prompt),
		}),
		Model: openai.F(openai.ChatModel(s.AI.Model())),
	})
	if err != nil {
		http.Error(w, err.Error(), 500); return
	}
	out := ""
	if len(resp.Content) > 0 {
		out = resp.Content[0].Text()
	}
	json.NewEncoder(w).Encode(rewriteRes{Rewritten: out})
}
--- end ---

--- file: apps/go-api/cmd/server/main.go ---
package main

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"REPLACE_ME_MODULE/apps/go-api/internal/ai"
	"REPLACE_ME_MODULE/apps/go-api/internal/db"
	httph "REPLACE_ME_MODULE/apps/go-api/internal/http"
)

func main() {
	_ = godotenv.Load(".env") // optional
	ctx := context.Background()

	pool, err := db.NewPool(ctx)
	if err != nil { log.Fatal(err) }
	defer pool.Close()

	aiClient := ai.New()

	srv := httph.NewServer(pool, aiClient)

	port := os.Getenv("API_PORT")
	if port != "" && port != "8080" {
		srv.Addr = ":" + port
	}

	log.Printf("Go API listening on %s\n", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}
--- end ---

# ========================
# 4) DB migrations (goose)
# ========================
Create initial migration for a minimal documents table (for future use by editor).

--- file: apps/go-api/migrations/20250813_init.sql ---
-- +goose Up
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS documents;
--- end ---

# ========================
# 5) Wire frontend to backend (env only)
# ========================
- Do not modify app code. Ensure apps/web can read NEXT_PUBLIC_API_BASE_URL and call /api/ai/* .
- If apps/web has an .env.example, append NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 . If not, create one.

--- file: apps/web/.env.example (append or create) ---
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
--- end ---

# ========================
# 6) Dev helper: Makefile (optional)
# ========================
--- file: Makefile ---
.PHONY: db-up db-down api-dev api-build migrate

db-up:
\tdocker compose -f docker/compose.db.yml up -d

db-down:
\tdocker compose -f docker/compose.db.yml down -v

api-build:
\tcd apps/go-api && go build -o bin/server ./cmd/server

api-dev:
\tpnpm --filter go-api dev

migrate:
\tcd apps/go-api && goose -dir ./migrations postgres "$$POSTGRES_DSN" up
--- end ---

# ========================
# 7) Run instructions (print as final message)
# ========================
After writing files, run the following shell commands and ensure they succeed. If a step fails, fix and retry.

1) Start Postgres
- `docker compose -f docker/compose.db.yml up -d`

2) Go tools
- `cd apps/go-api`
- Replace module path in go.mod and imports (REPLACE_ME_MODULE) with actual module path.
  - If git remote origin exists like git@github.com:ORG/REPO.git, use module "github.com/ORG/REPO/apps/go-api".
  - Update import paths in internal/http/*.go and cmd/server/main.go accordingly.
- `go mod tidy`
- Install goose: `go install github.com/pressly/goose/v3/cmd/goose@latest`
- (Optional) Install air for hot reload: `go install github.com/cosmtrek/air@latest`

3) Migrate DB
- `export POSTGRES_DSN='postgres://postgres:postgres@localhost:5432/app?sslmode=disable'`
- `pnpm --filter go-api migrate`

4) Backend dev
- `pnpm --filter go-api dev`
  - If `air` is not installed, the fallback reflex path compiles & runs.

5) Frontend dev (separate terminal)
- `export NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- `pnpm --filter web dev`  (Next.js or Vite dev server on :3000)

6) Test endpoints (from another terminal)
- `curl -X POST http://localhost:8080/api/ai/summarize -H 'Content-Type: application/json' -d '{"text":"これはテスト文章です。"}'`
- `curl -X POST http://localhost:8080/api/ai/rewrite -H 'Content-Type: application/json' -d '{"text":"これはテスト文章です。","tone":"polite"}'`

# ========================
# 8) Notes
# ========================
- Ensure OPENAI_API_KEY is exported in your shell or placed in apps/go-api/.env .
- If CORS issues appear, confirm web runs on http://localhost:3000 and API on http://localhost:8080 .
- For CI later, cache Go build and enable turbo remote cache if needed.
- To add more endpoints (e.g., save/load documents), extend internal/http and create matching migrations.

# End of plan. Please apply these changes now.