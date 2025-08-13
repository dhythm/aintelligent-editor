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
	"github.com/dhythm/aintelligent-editor/apps/go-api/internal/ai"
)

type Server struct {
	DB *pgxpool.Pool
	AI *ai.Client
}

func NewServer(db *pgxpool.Pool, ai *ai.Client) *http.Server {
	r := chi.NewRouter()
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
		http.Error(w, err.Error(), 400)
		return
	}
	resp, err := s.AI.SDK.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("あなたは優秀な日本語の要約アシスタントです。要点を簡潔に日本語でまとめてください。"),
			openai.UserMessage(in.Text),
		}),
		Model: openai.F(openai.ChatModel(s.AI.Model())),
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	out := ""
	if len(resp.Choices) > 0 && resp.Choices[0].Message.Content != "" {
		out = resp.Choices[0].Message.Content
	}
	json.NewEncoder(w).Encode(summarizeRes{Summary: out})
}

type rewriteReq struct {
	Text string `json:"text"`
	Tone string `json:"tone"`
}

type rewriteRes struct {
	Rewritten string `json:"rewritten"`
}

func (s *Server) rewrite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var in rewriteReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), 400)
		return
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
		http.Error(w, err.Error(), 500)
		return
	}
	out := ""
	if len(resp.Choices) > 0 && resp.Choices[0].Message.Content != "" {
		out = resp.Choices[0].Message.Content
	}
	json.NewEncoder(w).Encode(rewriteRes{Rewritten: out})
}