package ai

import (
	"os"

	openai "github.com/openai/openai-go"
)

type Client struct {
	SDK *openai.Client
}

func New() *Client {
	return &Client{SDK: openai.NewClient()}
}

func (c *Client) Model() string {
	if m := os.Getenv("OPENAI_MODEL"); m != "" {
		return m
	}
	return string(openai.ChatModelGPT4oMini)
}