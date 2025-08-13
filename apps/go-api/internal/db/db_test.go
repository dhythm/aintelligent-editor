package db

import (
	"context"
	"os"
	"testing"
)

func TestGetenv(t *testing.T) {
	tests := []struct {
		name     string
		key      string
		envValue string
		defValue string
		want     string
	}{
		{
			name:     "環境変数が設定されている場合",
			key:      "TEST_ENV_VAR",
			envValue: "test_value",
			defValue: "default",
			want:     "test_value",
		},
		{
			name:     "環境変数が空の場合",
			key:      "EMPTY_ENV_VAR",
			envValue: "",
			defValue: "default",
			want:     "default",
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envValue != "" {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}
			
			got := getenv(tt.key, tt.defValue)
			if got != tt.want {
				t.Errorf("getenv() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewPool(t *testing.T) {
	t.Run("環境変数POSTGRES_DSNが設定されている場合", func(t *testing.T) {
		dsn := "postgres://test:test@localhost:5432/testdb?sslmode=disable"
		os.Setenv("POSTGRES_DSN", dsn)
		defer os.Unsetenv("POSTGRES_DSN")
		
		ctx := context.Background()
		pool, err := NewPool(ctx)
		
		if err == nil && pool != nil {
			pool.Close()
		}
	})
	
	t.Run("環境変数が個別に設定されている場合", func(t *testing.T) {
		os.Setenv("POSTGRES_HOST", "testhost")
		os.Setenv("POSTGRES_PORT", "5433")
		os.Setenv("POSTGRES_USER", "testuser")
		os.Setenv("POSTGRES_PASSWORD", "testpass")
		os.Setenv("POSTGRES_DB", "testdb")
		
		defer func() {
			os.Unsetenv("POSTGRES_HOST")
			os.Unsetenv("POSTGRES_PORT")
			os.Unsetenv("POSTGRES_USER")
			os.Unsetenv("POSTGRES_PASSWORD")
			os.Unsetenv("POSTGRES_DB")
		}()
		
		ctx := context.Background()
		pool, err := NewPool(ctx)
		
		if err == nil && pool != nil {
			pool.Close()
		}
	})
	
	t.Run("環境変数が設定されていない場合（デフォルト値使用）", func(t *testing.T) {
		os.Unsetenv("POSTGRES_DSN")
		os.Unsetenv("POSTGRES_HOST")
		os.Unsetenv("POSTGRES_PORT")
		os.Unsetenv("POSTGRES_USER")
		os.Unsetenv("POSTGRES_PASSWORD")
		os.Unsetenv("POSTGRES_DB")
		
		ctx := context.Background()
		pool, err := NewPool(ctx)
		
		if err == nil && pool != nil {
			pool.Close()
		}
	})
}