package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dhythm/aintelligent-editor/apps/go-api/internal/ai"
	"github.com/jackc/pgx/v5/pgxpool"
)

func TestHealthEndpoint(t *testing.T) {
	server := &Server{}
	
	req, err := http.NewRequest("GET", "/healthz", nil)
	if err != nil {
		t.Fatal(err)
	}
	
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.health)
	handler.ServeHTTP(rr, req)
	
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}
	
	expected := "ok"
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

func TestSummarizeEndpoint(t *testing.T) {
	tests := []struct {
		name       string
		input      summarizeReq
		wantStatus int
	}{
		{
			name: "valid request",
			input: summarizeReq{
				Text: "これはテスト文章です。",
			},
			wantStatus: http.StatusOK,
		},
		{
			name:       "empty request",
			input:      summarizeReq{},
			wantStatus: http.StatusOK,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Skip("Skipping API test that requires OpenAI API key")
			
			server := &Server{
				AI: ai.New(),
			}
			
			body, _ := json.Marshal(tt.input)
			req, err := http.NewRequest("POST", "/api/ai/summarize", bytes.NewBuffer(body))
			if err != nil {
				t.Fatal(err)
			}
			req.Header.Set("Content-Type", "application/json")
			
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(server.summarize)
			handler.ServeHTTP(rr, req)
			
			if status := rr.Code; status != tt.wantStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, tt.wantStatus)
			}
			
			if tt.wantStatus == http.StatusOK {
				var response summarizeRes
				if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
					t.Errorf("failed to unmarshal response: %v", err)
				}
			}
		})
	}
}

func TestRewriteEndpoint(t *testing.T) {
	tests := []struct {
		name       string
		input      rewriteReq
		wantStatus int
	}{
		{
			name: "valid request with polite tone",
			input: rewriteReq{
				Text: "これはテスト文章です。",
				Tone: "polite",
			},
			wantStatus: http.StatusOK,
		},
		{
			name: "valid request with casual tone",
			input: rewriteReq{
				Text: "これはテスト文章です。",
				Tone: "casual",
			},
			wantStatus: http.StatusOK,
		},
		{
			name:       "empty request",
			input:      rewriteReq{},
			wantStatus: http.StatusOK,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Skip("Skipping API test that requires OpenAI API key")
			
			server := &Server{
				AI: ai.New(),
			}
			
			body, _ := json.Marshal(tt.input)
			req, err := http.NewRequest("POST", "/api/ai/rewrite", bytes.NewBuffer(body))
			if err != nil {
				t.Fatal(err)
			}
			req.Header.Set("Content-Type", "application/json")
			
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(server.rewrite)
			handler.ServeHTTP(rr, req)
			
			if status := rr.Code; status != tt.wantStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, tt.wantStatus)
			}
			
			if tt.wantStatus == http.StatusOK {
				var response rewriteRes
				if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
					t.Errorf("failed to unmarshal response: %v", err)
				}
			}
		})
	}
}

func TestNewServer(t *testing.T) {
	var pool *pgxpool.Pool
	aiClient := ai.New()
	
	server := NewServer(pool, aiClient)
	
	if server == nil {
		t.Fatal("NewServer returned nil")
	}
	
	if server.Addr != ":8080" {
		t.Errorf("Expected server address :8080, got %s", server.Addr)
	}
	
	if server.ReadTimeout != 15*1e9 {
		t.Errorf("Expected ReadTimeout 15s, got %v", server.ReadTimeout)
	}
	
	if server.WriteTimeout != 60*1e9 {
		t.Errorf("Expected WriteTimeout 60s, got %v", server.WriteTimeout)
	}
	
	if server.IdleTimeout != 60*1e9 {
		t.Errorf("Expected IdleTimeout 60s, got %v", server.IdleTimeout)
	}
}