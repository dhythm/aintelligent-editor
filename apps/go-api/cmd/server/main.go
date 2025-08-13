package main

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/dhythm/aintelligent-editor/apps/go-api/internal/ai"
	"github.com/dhythm/aintelligent-editor/apps/go-api/internal/db"
	httph "github.com/dhythm/aintelligent-editor/apps/go-api/internal/http"
)

func main() {
	_ = godotenv.Load(".env")
	ctx := context.Background()

	pool, err := db.NewPool(ctx)
	if err != nil {
		log.Fatal(err)
	}
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