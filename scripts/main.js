// Main Application Controller
class VisionAIApp {
  constructor() {
    this.currentMode = "chat"
    this.currentTheme = localStorage.getItem("theme") || "light"
    this.currentPlan = localStorage.getItem("currentPlan") || "free"
    this.apiKeys = {
      a4f: "Ddc-a4f-b4b6948f71bc4f51bc0b1f161a1b577b",
      binaryJazz: {
        genre: "https://binaryjazz.us/wp-json/genrenator/v1/genre/",
        story: "https://binaryjazz.us/wp-json/genrenator/v1/story/",
      },
    }
    this.planLimits = {
      free: { images: 10, videos: 3, audio: 5 },
      basic: { images: 15, videos: 6, audio: 10 },
      pro: { images: 21, videos: 10, audio: 15 },
      subscription: { images: 50, videos: 15, audio: 25 },
      ultimate: { images: -1, videos: -1, audio: -1 }, // -1 means unlimited
    }
    this.usage = JSON.parse(localStorage.getItem("dailyUsage") || "{}")

    this.init()
  }

  init() {
    this.initializeTheme()
    this.initializeEventListeners()
    this.initializeAdMob()
    this.checkDailyUsage()
    this.showAppOpenAd()
  }

  initializeTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme)
    this.updateThemeIcon()
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById("themeToggle")
    const icon = themeToggle.querySelector(".material-icons")
    icon.textContent = this.currentTheme === "dark" ? "light_mode" : "dark_mode"
  }

  initializeEventListeners() {
    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Mode switching
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.switchMode(tab.dataset.mode)
      })
    })

    // Plans modal
    document.getElementById("planBtn").addEventListener("click", () => {
      this.showPlansModal()
    })

    document.getElementById("closePlansModal").addEventListener("click", () => {
      this.hidePlansModal()
    })

    // Plan upgrade buttons
    document.querySelectorAll(".plan-btn.upgrade").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.initiatePlanUpgrade(btn.dataset.plan, btn.dataset.price)
      })
    })

    // Payment modal
    document.getElementById("closePaymentModal").addEventListener("click", () => {
      this.hidePaymentModal()
    })

    document.getElementById("paymentForm").addEventListener("submit", (e) => {
      this.processPayment(e)
    })

    // Chat form
    document.getElementById("chatForm").addEventListener("submit", (e) => {
      this.handleChatSubmit(e)
    })

    // Image generation form
    document.getElementById("imageForm").addEventListener("submit", (e) => {
      this.handleImageGeneration(e)
    })

    // Video generation form
    document.getElementById("videoForm").addEventListener("submit", (e) => {
      this.handleVideoGeneration(e)
    })

    // TTS form
    document.getElementById("ttsForm").addEventListener("submit", (e) => {
      this.handleTTSGeneration(e)
    })

    // Audio tabs
    document.querySelectorAll(".audio-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.switchAudioMode(tab.dataset.audioMode)
      })
    })

    // Music generators
    document.getElementById("genreBtn").addEventListener("click", () => {
      this.generateRandomGenre()
    })

    document.getElementById("storyBtn").addEventListener("click", () => {
      this.generateRandomStory()
    })

    // File upload
    document.getElementById("audioUpload").addEventListener("click", () => {
      document.getElementById("audioFile").click()
    })

    document.getElementById("audioFile").addEventListener("change", (e) => {
      this.handleAudioUpload(e)
    })

    // Close modals on overlay click
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active")
        }
      })
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e)
    })
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", this.currentTheme)
    localStorage.setItem("theme", this.currentTheme)
    this.updateThemeIcon()
  }

  switchMode(mode) {
    this.currentMode = mode

    // Update nav tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.mode === mode)
    })

    // Update panels
    document.querySelectorAll(".mode-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `${mode}Panel`)
    })

    // Reset audio mode when switching to audio
    if (mode === "audio") {
      this.switchAudioMode("tts")
    }
  }

  switchAudioMode(audioMode) {
    // Update audio tabs
    document.querySelectorAll(".audio-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.audioMode === audioMode)
    })

    // Update audio panels
    document.querySelectorAll(".audio-panel").forEach((panel) => {
      panel.classList.remove("active")
    })

    document.getElementById(`${audioMode}Panel`).classList.add("active")
  }

  showPlansModal() {
    document.getElementById("plansModal").classList.add("active")
    document.body.style.overflow = "hidden"
  }

  hidePlansModal() {
    document.getElementById("plansModal").classList.remove("active")
    document.body.style.overflow = ""
  }

  showPaymentModal() {
    document.getElementById("paymentModal").classList.add("active")
    document.body.style.overflow = "hidden"
  }

  hidePaymentModal() {
    document.getElementById("paymentModal").classList.remove("active")
    document.body.style.overflow = ""
  }

  initiatePlanUpgrade(plan, price) {
    const planSummary = document.getElementById("planSummary")
    planSummary.innerHTML = `
            <h3>Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}</h3>
            <p>Price: ₹${price}/month</p>
            <div class="plan-benefits">
                <h4>What you get:</h4>
                <ul>
                    ${this.getPlanBenefits(plan)}
                </ul>
            </div>
        `

    this.hidePlansModal()
    this.showPaymentModal()
  }

  getPlanBenefits(plan) {
    const benefits = {
      basic: ["15 Images per day", "6 Videos per day", "Genre music matching", "Story pairing"],
      pro: ["21 Images per day", "10 Videos per day", "All models unlocked", "Text-to-speech included"],
      subscription: ["50 Images per day", "15 Videos per day", "Remove watermarks", "Priority processing"],
      ultimate: ["Unlimited images", "Unlimited videos", "Full model access", "DSLR quality output"],
    }

    return benefits[plan].map((benefit) => `<li>${benefit}</li>`).join("")
  }

  async processPayment(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const paymentData = {
      name: formData.get("customerName") || document.getElementById("customerName").value,
      email: formData.get("customerEmail") || document.getElementById("customerEmail").value,
      phone: formData.get("customerPhone") || document.getElementById("customerPhone").value,
      paymentMethod: formData.get("paymentMethod"),
    }

    this.showLoading("Processing payment...")

    try {
      // Simulate payment processing
      await this.simulatePaymentProcess(paymentData)

      this.hideLoading()
      this.hidePaymentModal()
      this.showPaymentSuccess()
    } catch (error) {
      this.hideLoading()
      this.showError("Payment failed. Please try again.")
    }
  }

  async simulatePaymentProcess(paymentData) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Store payment info (in real app, this would be sent to server)
    const paymentRecord = {
      ...paymentData,
      timestamp: new Date().toISOString(),
      status: "completed",
      transactionId: "TXN" + Date.now(),
    }

    localStorage.setItem("lastPayment", JSON.stringify(paymentRecord))

    // Update user plan
    const selectedPlan = document.querySelector(".plan-btn.upgrade").dataset.plan
    this.currentPlan = selectedPlan
    localStorage.setItem("currentPlan", selectedPlan)

    return paymentRecord
  }

  showPaymentSuccess() {
    const successHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <span class="material-icons">check_circle</span>
                </div>
                <h3>Payment Successful!</h3>
                <p>Your plan has been upgraded successfully.</p>
                <button onclick="location.reload()" class="success-btn">Continue</button>
            </div>
        `

    document.body.insertAdjacentHTML(
      "beforeend",
      `
            <div class="modal-overlay active">
                <div class="modal-content">${successHTML}</div>
            </div>
        `,
    )
  }

  async handleChatSubmit(e) {
    e.preventDefault()

    const input = document.getElementById("chatInput")
    const message = input.value.trim()

    if (!message) return

    const model = document.getElementById("chatModelSelect").value

    // Add user message
    this.addChatMessage("user", message)
    input.value = ""

    // Show typing indicator
    this.showTypingIndicator()

    try {
      const response = await this.callChatAPI(message, model)
      this.hideTypingIndicator()
      this.addChatMessage("assistant", response)
    } catch (error) {
      this.hideTypingIndicator()
      this.addChatMessage("assistant", "Sorry, I encountered an error. Please try again.")
    }
  }

  async handleImageGeneration(e) {
    e.preventDefault()

    if (!this.checkUsageLimit("images")) return

    const prompt = document.getElementById("imageInput").value.trim()
    const model = document.getElementById("imageModelSelect").value
    const size = document.getElementById("imageSize").value

    if (!prompt) return

    this.showLoading("Generating images...")

    try {
      const images = await this.callImageAPI(prompt, model, size)
      this.hideLoading()
      this.displayGeneratedImages(images)
      this.updateUsage("images")
      document.getElementById("imageInput").value = ""
    } catch (error) {
      this.hideLoading()
      this.showError("Failed to generate images. Please try again.")
    }
  }

  async handleVideoGeneration(e) {
    e.preventDefault()

    if (!this.checkUsageLimit("videos")) return

    const prompt = document.getElementById("videoInput").value.trim()
    const model = document.getElementById("videoModelSelect").value
    const duration = document.getElementById("videoDuration").value
    const style = document.getElementById("videoStyle").value

    if (!prompt) return

    this.showLoading("Generating video...")

    try {
      const video = await this.callVideoAPI(prompt, model, duration, style)
      this.hideLoading()
      this.displayGeneratedVideo(video)
      this.updateUsage("videos")
      document.getElementById("videoInput").value = ""
    } catch (error) {
      this.hideLoading()
      this.showError("Failed to generate video. Please try again.")
    }
  }

  async handleTTSGeneration(e) {
    e.preventDefault()

    if (!this.checkUsageLimit("audio")) return

    const text = document.getElementById("ttsInput").value.trim()
    const model = document.getElementById("ttsModelSelect").value
    const voice = document.getElementById("voiceSelect").value

    if (!text) return

    this.showLoading("Generating speech...")

    try {
      const audio = await this.callTTSAPI(text, model, voice)
      this.hideLoading()
      this.displayGeneratedAudio(audio)
      this.updateUsage("audio")
      document.getElementById("ttsInput").value = ""
    } catch (error) {
      this.hideLoading()
      this.showError("Failed to generate speech. Please try again.")
    }
  }

  async handleAudioUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const model = document.getElementById("transcribeModelSelect").value

    this.showLoading("Transcribing audio...")

    try {
      const transcription = await this.callTranscriptionAPI(file, model)
      this.hideLoading()
      this.displayTranscription(transcription)
    } catch (error) {
      this.hideLoading()
      this.showError("Failed to transcribe audio. Please try again.")
    }
  }

  async generateRandomGenre() {
    try {
      const response = await fetch(this.apiKeys.binaryJazz.genre)
      const genre = await response.text()
      this.displayMusicResult("genre", genre)
    } catch (error) {
      this.showError("Failed to generate genre. Please try again.")
    }
  }

  async generateRandomStory() {
    try {
      const response = await fetch(this.apiKeys.binaryJazz.story)
      const story = await response.text()
      this.displayMusicResult("story", story)
    } catch (error) {
      this.showError("Failed to generate story. Please try again.")
    }
  }

  checkUsageLimit(type) {
    const today = new Date().toDateString()
    const limits = this.planLimits[this.currentPlan]

    if (!this.usage[today]) {
      this.usage[today] = { images: 0, videos: 0, audio: 0 }
    }

    if (limits[type] === -1) return true // Unlimited

    if (this.usage[today][type] >= limits[type]) {
      this.showUpgradePrompt(type)
      return false
    }

    return true
  }

  updateUsage(type) {
    const today = new Date().toDateString()
    if (!this.usage[today]) {
      this.usage[today] = { images: 0, videos: 0, audio: 0 }
    }
    this.usage[today][type]++
    localStorage.setItem("dailyUsage", JSON.stringify(this.usage))
  }

  checkDailyUsage() {
    const today = new Date().toDateString()

    // Clean up old usage data (keep only last 7 days)
    Object.keys(this.usage).forEach((date) => {
      const usageDate = new Date(date)
      const daysDiff = (new Date() - usageDate) / (1000 * 60 * 60 * 24)
      if (daysDiff > 7) {
        delete this.usage[date]
      }
    })

    localStorage.setItem("dailyUsage", JSON.stringify(this.usage))
  }

  showUpgradePrompt(type) {
    const typeNames = { images: "image", videos: "video", audio: "audio" }
    const message = `You've reached your daily ${typeNames[type]} generation limit. Upgrade your plan to continue.`

    const promptHTML = `
            <div class="upgrade-prompt">
                <div class="prompt-icon">
                    <span class="material-icons">warning</span>
                </div>
                <h3>Limit Reached</h3>
                <p>${message}</p>
                <button onclick="app.showPlansModal(); this.closest('.modal-overlay').remove();" class="upgrade-btn">
                    Upgrade Now
                </button>
                <button onclick="this.closest('.modal-overlay').remove();" class="cancel-btn">
                    Maybe Later
                </button>
            </div>
        `

    document.body.insertAdjacentHTML(
      "beforeend",
      `
            <div class="modal-overlay active">
                <div class="modal-content">${promptHTML}</div>
            </div>
        `,
    )
  }

  addChatMessage(role, content) {
    const messagesArea = document.getElementById("chatMessages")
    const welcomeMessage = messagesArea.querySelector(".welcome-message")

    if (welcomeMessage) {
      welcomeMessage.remove()
    }

    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${role}`

    const avatar = document.createElement("div")
    avatar.className = "message-avatar"
    avatar.innerHTML = `<span class="material-icons">${role === "user" ? "person" : "smart_toy"}</span>`

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

    messagesArea.appendChild(messageDiv)
    messagesArea.scrollTop = messagesArea.scrollHeight
  }

  showTypingIndicator() {
    const messagesArea = document.getElementById("chatMessages")
    const typingDiv = document.createElement("div")
    typingDiv.className = "message assistant typing-indicator"
    typingDiv.innerHTML = `
            <div class="message-avatar">
                <span class="material-icons">smart_toy</span>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `

    messagesArea.appendChild(typingDiv)
    messagesArea.scrollTop = messagesArea.scrollHeight
  }

  hideTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator")
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  displayGeneratedImages(images) {
    const gallery = document.getElementById("imageGallery")
    const placeholder = gallery.querySelector(".gallery-placeholder")

    if (placeholder) {
      placeholder.remove()
    }

    images.forEach((imageData) => {
      const imageDiv = document.createElement("div")
      imageDiv.className = "generated-image"
      imageDiv.innerHTML = `
                <img src="${imageData.url}" alt="Generated image" loading="lazy">
                <div class="image-info">
                    <p>Model: ${imageData.model}</p>
                    <p>Size: ${imageData.size}</p>
                </div>
            `

      gallery.appendChild(imageDiv)
    })
  }

  displayGeneratedVideo(videoData) {
    const player = document.getElementById("videoPlayer")
    player.innerHTML = `
            <video controls width="100%" height="400">
                <source src="${videoData.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="video-info">
                <p>Model: ${videoData.model}</p>
                <p>Duration: ${videoData.duration}s</p>
                <p>Style: ${videoData.style}</p>
            </div>
        `
  }

  displayGeneratedAudio(audioData) {
    const player = document.getElementById("audioPlayer")
    player.innerHTML = `
            <audio controls width="100%">
                <source src="${audioData.url}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
            <div class="audio-info">
                <p>Model: ${audioData.model}</p>
                <p>Voice: ${audioData.voice}</p>
                <p>Duration: ${audioData.duration}s</p>
            </div>
        `
  }

  displayTranscription(transcriptionData) {
    const result = document.getElementById("transcriptionResult")
    result.innerHTML = `
            <div class="transcription-content">
                <h3>Transcription Result</h3>
                <div class="transcription-text">${transcriptionData.text}</div>
                <div class="transcription-info">
                    <p>Model: ${transcriptionData.model}</p>
                    <p>Confidence: ${transcriptionData.confidence}%</p>
                    <p>Duration: ${transcriptionData.duration}s</p>
                </div>
                <button onclick="navigator.clipboard.writeText('${transcriptionData.text}')" class="copy-btn">
                    <span class="material-icons">content_copy</span>
                    Copy Text
                </button>
            </div>
        `
  }

  displayMusicResult(type, content) {
    const result = document.getElementById("musicResult")
    result.innerHTML = `
            <div class="music-content">
                <h3>Random ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <div class="music-text">${content}</div>
                <div class="music-actions">
                    <button onclick="navigator.clipboard.writeText('${content}')" class="copy-btn">
                        <span class="material-icons">content_copy</span>
                        Copy
                    </button>
                    <button onclick="app.generate${type.charAt(0).toUpperCase() + type.slice(1)}()" class="refresh-btn">
                        <span class="material-icons">refresh</span>
                        Generate New
                    </button>
                </div>
            </div>
        `
  }

  showLoading(text = "Processing...") {
    const overlay = document.getElementById("loadingOverlay")
    const loadingText = document.getElementById("loadingText")
    loadingText.textContent = text
    overlay.classList.add("active")
  }

  hideLoading() {
    document.getElementById("loadingOverlay").classList.remove("active")
  }

  showError(message) {
    const errorHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <span class="material-icons">error</span>
                </div>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="this.closest('.modal-overlay').remove()" class="error-btn">
                    OK
                </button>
            </div>
        `

    document.body.insertAdjacentHTML(
      "beforeend",
      `
            <div class="modal-overlay active">
                <div class="modal-content">${errorHTML}</div>
            </div>
        `,
    )
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K for quick search/prompt
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      const currentInput = document.querySelector(".mode-panel.active textarea")
      if (currentInput) {
        currentInput.focus()
      }
    }

    // Escape to close modals
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach((modal) => {
        modal.classList.remove("active")
      })
      document.body.style.overflow = ""
    }
  }

  initializeAdMob() {
    // Show app open ad on first load
    if (!sessionStorage.getItem("appOpenAdShown")) {
      setTimeout(() => {
        this.showAppOpenAd()
        sessionStorage.setItem("appOpenAdShown", "true")
      }, 1000)
    }
  }

  showAppOpenAd() {
    const appOpenAd = document.getElementById("appOpenAd")
    appOpenAd.classList.add("show")

    // Hide after 5 seconds
    setTimeout(() => {
      appOpenAd.classList.remove("show")
    }, 5000)
  }

  // API methods will be implemented in api.js
  async callChatAPI(message, model) {
    return window.apiHandler.callChatAPI(message, model)
  }

  async callImageAPI(prompt, model, size) {
    return window.apiHandler.callImageAPI(prompt, model, size)
  }

  async callVideoAPI(prompt, model, duration, style) {
    return window.apiHandler.callVideoAPI(prompt, model, duration, style)
  }

  async callTTSAPI(text, model, voice) {
    return window.apiHandler.callTTSAPI(text, model, voice)
  }

  async callTranscriptionAPI(file, model) {
    return window.apiHandler.callTranscriptionAPI(file, model)
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new VisionAIApp()
})

// Service Worker Registration
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
