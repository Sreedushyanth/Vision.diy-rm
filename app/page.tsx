"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Send, Wand2, Code, MessageSquare, Dice1 } from "lucide-react"
import { useTheme } from "next-themes"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const AI_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "google/gemini-2.5-pro-exp-03-25", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small", provider: "Mistral" },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", provider: "Google" },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen 2.5 VL", provider: "Qwen" },
  { id: "moonshotai/kimi-vl-a3b-thinking:free", name: "Kimi VL", provider: "Moonshot" },
]

const EXAMPLE_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list of dictionaries",
  "Help me debug this JavaScript code",
  "Create a responsive CSS layout",
  "Explain the difference between React hooks",
  "Write a SQL query to find duplicate records",
  "How do I optimize my website's performance?",
  "Create a REST API endpoint in Node.js",
  "Explain machine learning concepts",
  "Help me with algorithm complexity analysis",
]

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<"chat" | "code">("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateRandomPrompt = () => {
    const prompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
    setInput("")

    // Typing effect
    let i = 0
    const typeInterval = setInterval(() => {
      if (i < prompt.length) {
        setInput((prev) => prev + prompt.charAt(i))
        i++
      } else {
        clearInterval(typeInterval)
      }
    }, 30)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedModel || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          model: selectedModel,
          chatMode,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 p-6 border-t-4 border-t-gradient-to-r from-purple-500 to-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Eye/Vision element */}
                  <ellipse cx="16" cy="16" rx="14" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="16" cy="16" r="4" fill="currentColor" />
                  <circle cx="17" cy="15" r="1.5" fill="white" />
                  {/* DIY Tools - Wrench */}
                  <path d="M8 6L10 8L8 10L6 8L8 6Z" fill="currentColor" />
                  <path d="M24 22L26 24L24 26L22 24L24 22Z" fill="currentColor" />
                  {/* Connection lines */}
                  <path d="M10 8L22 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Vision DIY AI
                </h1>
                <p className="text-sm text-muted-foreground">Powered by vision.diy.com - Build Your Ideas with AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatMode(chatMode === "chat" ? "code" : "chat")}
                className="gap-2"
              >
                {chatMode === "chat" ? <Code className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                {chatMode === "chat" ? "Code Mode" : "Chat Mode"}
              </Button>

              <Button variant="outline" size="sm" onClick={clearChat} disabled={messages.length === 0}>
                Clear Chat
              </Button>

              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-6 h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-md">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Hey there, Developer! 👋
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  I'm your AI coding companion, ready to help you build amazing things. Whether you need code reviews,
                  debugging help, or creative solutions - I've got your back!
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    💻 Code Generation
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    🐛 Debug Helper
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    🚀 Best Practices
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 opacity-75">
                  Select a model above and let's start coding together!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      className="prose dark:prose-invert prose-p:my-2 prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-4"
                      linkTarget="_blank"
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div
                    className={`text-xs mt-2 ${message.role === "user" ? "text-purple-100" : "text-muted-foreground"}`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </Card>

        {/* Input Form */}
        <Card className="p-4">
          <form onSubmit={sendMessage} className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.provider}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateRandomPrompt}
                title="Get random prompt"
              >
                <Dice1 className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask me anything${chatMode === "code" ? " about coding" : ""}...`}
                className="min-h-[100px] pr-12 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={!input.trim() || !selectedModel || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line. Currently in {chatMode} mode.
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
