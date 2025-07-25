import { type NextRequest, NextResponse } from "next/server"

// OpenRouter API keys for different models
const API_KEYS = {
  "openai/gpt-4o": "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",
  "google/gemini-2.0-flash-exp:free": "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",
  "google/gemini-2.5-pro-exp-03-25": "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",
  "mistralai/mistral-small-3.2-24b-instruct:free":
    "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",
  "google/gemma-3-27b-it:free": "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",
  "qwen/qwen2.5-vl-32b-instruct:free": "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",
  "moonshotai/kimi-vl-a3b-thinking:free": "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",
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, chatMode } = await request.json()

    if (!messages || !model) {
      return NextResponse.json({ error: "Messages and model are required" }, { status: 400 })
    }

    const apiKey = API_KEYS[model as keyof typeof API_KEYS]
    if (!apiKey) {
      return NextResponse.json({ error: "Invalid model selected" }, { status: 400 })
    }

    // Add system message based on chat mode
    const systemMessage = {
      role: "system",
      content:
        chatMode === "code"
          ? "You are an expert programming assistant. Help users with coding questions, debugging, code reviews, and technical explanations. Provide clear, well-commented code examples and explain your solutions step by step."
          : "You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Be conversational and engaging while maintaining professionalism.",
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://v0.dev",
        "X-Title": "AI Assistant Chat App",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenRouter API error:", errorData)
      return NextResponse.json({ error: "Failed to get response from AI model" }, { status: response.status })
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ error: "Invalid response from AI model" }, { status: 500 })
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
