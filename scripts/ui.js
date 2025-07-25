// UI Enhancement Scripts
class UIEnhancements {
  constructor() {
    this.init()
  }

  init() {
    this.addTypingDotsCSS()
    this.addScrollAnimations()
    this.addHoverEffects()
    this.addProgressIndicators()
  }

  addTypingDotsCSS() {
    const style = document.createElement("style")
    style.textContent = `
            .typing-dots {
                display: flex;
                gap: 4px;
                padding: 12px;
            }

            .typing-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--text-secondary);
                animation: typing 1.4s infinite ease-in-out;
            }

            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .success-message,
            .error-message,
            .upgrade-prompt {
                text-align: center;
                padding: 2rem;
                max-width: 400px;
            }

            .success-icon,
            .error-icon,
            .prompt-icon {
                width: 4rem;
                height: 4rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
                font-size: 2rem;
            }

            .success-icon {
                background: var(--success);
                color: white;
            }

            .error-icon {
                background: var(--error);
                color: white;
            }

            .prompt-icon {
                background: var(--warning);
                color: white;
            }

            .success-btn,
            .error-btn,
            .upgrade-btn,
            .cancel-btn {
                background: var(--gradient-primary);
                color: white;
                border: none;
                border-radius: var(--radius-md);
                padding: var(--spacing-md) var(--spacing-lg);
                margin: var(--spacing-sm);
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .cancel-btn {
                background: var(--surface);
                color: var(--text-secondary);
                border: 1px solid var(--border);
            }

            .copy-btn,
            .refresh-btn {
                background: var(--surface-elevated);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: var(--spacing-sm) var(--spacing-md);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: var(--font-size-sm);
                transition: all 0.3s ease;
                margin: var(--spacing-xs);
            }

            .copy-btn:hover,
            .refresh-btn:hover {
                background: var(--primary-color);
                color: white;
            }

            .transcription-content,
            .music-content {
                background: var(--surface-elevated);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                margin: var(--spacing-lg) 0;
            }

            .transcription-text,
            .music-text {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                margin: var(--spacing-md) 0;
                font-family: monospace;
                line-height: 1.6;
                max-height: 200px;
                overflow-y: auto;
            }

            .transcription-info,
            .audio-info,
            .video-info {
                display: flex;
                gap: var(--spacing-lg);
                margin: var(--spacing-md) 0;
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
            }

            .music-actions,
            .transcription-actions {
                display: flex;
                gap: var(--spacing-sm);
                justify-content: center;
                margin-top: var(--spacing-md);
            }

            @media (max-width: 768px) {
                .transcription-info,
                .audio-info,
                .video-info {
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .music-actions,
                .transcription-actions {
                    flex-direction: column;
                }
            }
        `
    document.head.appendChild(style)
  }

  addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fadeIn 0.6s ease forwards"
        }
      })
    })

    // Observe elements that should animate on scroll
    document.querySelectorAll(".plan-card, .generated-image, .message").forEach((el) => {
      observer.observe(el)
    })
  }

  addHoverEffects() {
    // Add ripple effect to buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches("button")) {
        this.createRipple(e)
      }
    })
  }

  createRipple(event) {
    const button = event.target
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
        `

    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)

    // Add ripple animation
    if (!document.getElementById("ripple-animation")) {
      const style = document.createElement("style")
      style.id = "ripple-animation"
      style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `
      document.head.appendChild(style)
    }
  }

  addProgressIndicators() {
    // Add progress bars for long operations
    const style = document.createElement("style")
    style.textContent = `
            .progress-bar {
                width: 100%;
                height: 4px;
                background: var(--border);
                border-radius: 2px;
                overflow: hidden;
                margin: var(--spacing-md) 0;
            }

            .progress-fill {
                height: 100%;
                background: var(--gradient-primary);
                border-radius: 2px;
                transition: width 0.3s ease;
                animation: progressPulse 2s infinite;
            }

            @keyframes progressPulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }

            .generation-status {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
                margin: var(--spacing-md) 0;
            }

            .status-icon {
                animation: spin 2s linear infinite;
            }
        `
    document.head.appendChild(style)
  }

  showProgressBar(container, progress = 0) {
    let progressBar = container.querySelector(".progress-bar")
    if (!progressBar) {
      progressBar = document.createElement("div")
      progressBar.className = "progress-bar"
      progressBar.innerHTML = '<div class="progress-fill"></div>'
      container.appendChild(progressBar)
    }

    const fill = progressBar.querySelector(".progress-fill")
    fill.style.width = progress + "%"

    if (progress >= 100) {
      setTimeout(() => {
        progressBar.remove()
      }, 500)
    }
  }

  showGenerationStatus(container, status) {
    let statusDiv = container.querySelector(".generation-status")
    if (!statusDiv) {
      statusDiv = document.createElement("div")
      statusDiv.className = "generation-status"
      container.appendChild(statusDiv)
    }

    statusDiv.innerHTML = `
            <span class="material-icons status-icon">autorenew</span>
            <span>${status}</span>
        `
  }

  hideGenerationStatus(container) {
    const statusDiv = container.querySelector(".generation-status")
    if (statusDiv) {
      statusDiv.remove()
    }
  }
}

// Initialize UI enhancements
document.addEventListener("DOMContentLoaded", () => {
  window.uiEnhancements = new UIEnhancements()
})
