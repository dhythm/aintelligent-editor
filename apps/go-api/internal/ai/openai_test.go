package ai

import (
	"os"
	"testing"
)

func TestNew(t *testing.T) {
	client := New()
	
	if client == nil {
		t.Fatal("New() returned nil")
	}
	
	if client.SDK == nil {
		t.Fatal("SDK is nil")
	}
}

func TestModel(t *testing.T) {
	tests := []struct {
		name     string
		envValue string
		want     string
	}{
		{
			name:     "環境変数が設定されていない場合",
			envValue: "",
			want:     "gpt-4o-mini",
		},
		{
			name:     "環境変数でモデルが指定されている場合",
			envValue: "gpt-4",
			want:     "gpt-4",
		},
		{
			name:     "環境変数でカスタムモデルが指定されている場合",
			envValue: "custom-model",
			want:     "custom-model",
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envValue != "" {
				os.Setenv("OPENAI_MODEL", tt.envValue)
				defer os.Unsetenv("OPENAI_MODEL")
			} else {
				os.Unsetenv("OPENAI_MODEL")
			}
			
			client := New()
			got := client.Model()
			
			if got != tt.want {
				t.Errorf("Model() = %v, want %v", got, tt.want)
			}
		})
	}
}