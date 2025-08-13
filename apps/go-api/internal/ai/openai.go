package ai

import (
	"os"

	openai "github.com/openai/openai-go"
)

type Client struct {
	SDK *openai.Client
}

func New() *Client {
	client := openai.NewClient()
	return &Client{SDK: &client}
}

func (c *Client) Model() string {
	if m := os.Getenv("OPENAI_MODEL"); m != "" {
		return m
	}
	return string(openai.ChatModelGPT4oMini)
}