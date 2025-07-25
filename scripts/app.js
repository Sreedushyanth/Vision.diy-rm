// API Configuration
const API_CONFIG = {
  openrouter: {
    key: "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",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
  },
  a4f: {
    key: "Ddc-a4f-b4b6948f71bc4f51bc0b1f161a1b577b",
    baseUrl: "https://api.a4f.co/v1/chat/completions",
  },
}

// Example prompts for different modes
const EXAMPLE_PROMPTS = {
  chat: [
    "Explain quantum computing in simple terms",
    "Write a creative story about time travel",
    "Help me plan a healthy meal for the week",
    "What are the latest trends in AI technology?",
    "Explain the concept of blockchain to a beginner",
  ],
  image: [
    "A futuristic cityscape with flying cars at sunset",
    "A magical forest with glowing mushrooms and fairy lights",
    "A steampunk robot playing chess in a Victorian library",
    "An underwater palace with coral gardens and mermaids",
    "A space station orbiting a colorful nebula",
  ],
  video: [
    "A time-lapse of a flower blooming in spring",
    "A drone shot flying through a mountain valley",
    "A cat playing with a ball of yarn in slow motion",
    "Rain drops falling on a window with city lights in background",
    "A campfire crackling under a starry night sky",
  ],
  music: [
    "Upbeat electronic dance music for a workout",
    "Relaxing ambient sounds for meditation",
    "Jazz piano melody for a cozy evening",
    "Epic orchestral music for a movie trailer",
    "Acoustic guitar ballad about lost love",
  ],
}

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  modeButtons: document.querySelectorAll(".mode-btn"),
  modelSelect: document.getElementById("modelSelect"),
  fileUpload: document.getElementById("fileUpload"),
  fileInput: document.getElementById("fileInput"),
  promptInput: document.getElementById("promptInput"),
  randomPromptBtn: document.getElementById("randomPromptBtn"),
  inputForm: document.getElementById("inputForm"),
  sendBtn: document.getElementById("sendBtn"),
  messagesArea: document.getElementById("messagesArea"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  saveToHistory: document.getElementById("saveToHistory"),
}

// Application State
let currentMode = "chat"
let conversationHistory = []
let isGenerating = false

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeTheme()
  initializeEventListeners()
  loadConversationHistory()
  updatePlaceholder()
})

// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeIcon(newTheme)
}

function updateThemeIcon(theme) {
  const icon = elements.themeToggle.querySelector("i")
  icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon"
}

// Event Listeners
function initializeEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener("click", toggleTheme)

  // Mode selection
  elements.modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode))
  })

  // Random prompt
  elements.randomPromptBtn.addEventListener("click", generateRandomPrompt)

  // Form submission
  elements.inputForm.addEventListener("submit", handleSubmit)

  // File upload
  elements.fileInput.addEventListener("change", handleFileUpload)

  // Enter key handling
  elements.promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  })
}

// Mode Management
function switchMode(mode) {
  currentMode = mode

  // Update active button
  elements.modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode)
  })

  // Update model options
  updateModelOptions(mode)

  // Update file upload visibility
  elements.fileUpload.style.display = ["image", "video"].includes(mode) ? "block" : "none"

  // Update placeholder
  updatePlaceholder()

  // Clear messages for new mode
  if (mode !== "chat") {
    clearMessages()
  }
}

function updateModelOptions(mode) {
  const optgroups = elements.modelSelect.querySelectorAll("optgroup")
  optgroups.forEach((group) => {
    group.style.display = "none"
  })

  const activeGroup = document.getElementById(`${mode}Models`)
  if (activeGroup) {
    activeGroup.style.display = "block"
    elements.modelSelect.value = activeGroup.querySelector("option").value
  }
}

function updatePlaceholder() {
  const placeholders = {
    chat: "Ask me anything...",
    image: "Describe the image you want to generate...",
    video: "Describe the video you want to create...",
    music: "Describe the music you want to generate...",
  }

  elements.promptInput.placeholder = placeholders[currentMode]
}

// Random Prompt Generation
function generateRandomPrompt() {
  const prompts = EXAMPLE_PROMPTS[currentMode]
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

  // Typing effect
  elements.promptInput.value = ""
  let i = 0
  const typeInterval = setInterval(() => {
    if (i < randomPrompt.length) {
      elements.promptInput.value += randomPrompt.charAt(i)
      i++
    } else {
      clearInterval(typeInterval)
    }
  }, 30)
}

// File Upload Handling
function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
  }

  // Display file info in chat
  addMessage("user", `Uploaded file: ${fileInfo.name} (${formatFileSize(fileInfo.size)})`)
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Form Submission
async function handleSubmit(e) {
  e.preventDefault()

  if (isGenerating) return

  const prompt = elements.promptInput.value.trim()
  if (!prompt) return

  const selectedModel = elements.modelSelect.value
  if (!selectedModel) {
    alert("Please select a model")
    return
  }

  // Add user message
  addMessage("user", prompt)

  // Clear input
  elements.promptInput.value = ""

  // Start generation
  await generateResponse(prompt, selectedModel)
}

// API Communication
async function generateResponse(prompt, model) {
  isGenerating = true
  showLoading(true)

  try {
    let response

    if (currentMode === "chat") {
      response = await generateChatResponse(prompt, model)
    } else if (currentMode === "image") {
      response = await generateImageResponse(prompt, model)
    } else if (currentMode === "video") {
      response = await generateVideoResponse(prompt, model)
    } else if (currentMode === "music") {
      response = await generateMusicResponse(prompt, model)
    }

    // Add assistant message
    addMessage("assistant", response)

    // Save to history if enabled
    if (elements.saveToHistory.checked) {
      saveToHistory(prompt, response, model)
    }
  } catch (error) {
    console.error("Generation error:", error)
    addMessage("assistant", "Sorry, I encountered an error while generating your content. Please try again.")
  } finally {
    isGenerating = false
    showLoading(false)
  }
}

async function generateChatResponse(prompt, model) {
  const apiProvider = getApiProvider(model)
  const config = API_CONFIG[apiProvider]

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Vision AI Studio",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, accurate, and engaging responses.",
        },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function generateImageResponse(prompt, model) {
  // For image generation, we'll use a placeholder response
  // In a real implementation, you would call the appropriate image generation API
  return `🎨 Generated image with prompt: "${prompt}" using model: ${model}\n\n[Image would be displayed here in a real implementation]`
}

async function generateVideoResponse(prompt, model) {
  // For video generation, we'll use a placeholder response
  return `🎬 Generated video with prompt: "${prompt}" using model: ${model}\n\n[Video would be displayed here in a real implementation]`
}

async function generateMusicResponse(prompt, model) {
  // For music generation, we'll use a placeholder response
  return `🎵 Generated music with prompt: "${prompt}" using model: ${model}\n\n[Audio player would be displayed here in a real implementation]`
}

function getApiProvider(model) {
  // Determine which API to use based on model
  if (
    model.includes("openai") ||
    model.includes("google") ||
    model.includes("mistralai") ||
    model.includes("meta-llama")
  ) {
    return "openrouter"
  }
  return "a4f"
}

// Message Management
function addMessage(role, content) {
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${role}`

  const avatar = document.createElement("div")
  avatar.className = "message-avatar"
  avatar.innerHTML = role === "user" ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'

  const messageContent = document.createElement("div")
  messageContent.className = "message-content"

  const messageText = document.createElement("div")
  messageText.className = "message-text"
  messageText.textContent = content

  const messageTime = document.createElement("div")
  messageTime.className = "message-time"
  messageTime.textContent = new Date().toLocaleTimeString()

  messageContent.appendChild(messageText)
  messageContent.appendChild(messageTime)

  messageDiv.appendChild(avatar)
  messageDiv.appendChild(messageContent)

  // Remove welcome message if it exists
  const welcomeMessage = elements.messagesArea.querySelector(".welcome-message")
  if (welcomeMessage) {
    welcomeMessage.remove()
  }

  elements.messagesArea.appendChild(messageDiv)
  elements.messagesArea.scrollTop = elements.messagesArea.scrollHeight

  // Add to conversation history for chat mode
  if (currentMode === "chat") {
    conversationHistory.push({ role, content })
  }
}

function clearMessages() {
  elements.messagesArea.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-robot"></i>
            </div>
            <h3>Welcome to Vision AI Studio</h3>
            <p>Your unified AI gateway for creative content generation</p>
        </div>
    `
  conversationHistory = []
}

// Loading State
function showLoading(show) {
  elements.loadingOverlay.classList.toggle("active", show)
  elements.sendBtn.disabled = show
}

// History Management
function saveToHistory(prompt, response, model) {
  const historyItem = {
    timestamp: new Date().toISOString(),
    mode: currentMode,
    model: model,
    prompt: prompt,
    response: response,
  }

  let history = JSON.parse(localStorage.getItem("visionAIHistory") || "[]")
  history.unshift(historyItem)

  // Keep only last 100 items
  history = history.slice(0, 100)

  localStorage.setItem("visionAIHistory", JSON.stringify(history))
}

function loadConversationHistory() {
  const history = JSON.parse(localStorage.getItem("visionAIHistory") || "[]")
  const chatHistory = history.filter((item) => item.mode === "chat").slice(0, 10)

  chatHistory.reverse().forEach((item) => {
    conversationHistory.push({ role: "user", content: item.prompt }, { role: "assistant", content: item.response })
  })
}

// Service Worker Registration for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Error Handling
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error)
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
})
