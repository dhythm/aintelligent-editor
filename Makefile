.PHONY: db-up db-down api-dev api-build migrate

db-up:
	docker compose -f docker/compose.db.yml up -d

db-down:
	docker compose -f docker/compose.db.yml down -v

api-build:
	cd apps/go-api && go build -o bin/server ./cmd/server

api-dev:
	pnpm --filter go-api dev

migrate:
	cd apps/go-api && goose -dir ./migrations postgres "$$POSTGRES_DSN" up