// Payment Processing Scripts
class PaymentHandler {
  constructor() {
    this.supportedMethods = {
      gpay: {
        name: "Google Pay",
        id: "sreedushyanth59@okhdfcbank",
        icon: "account_balance",
      },
      phonepe: {
        name: "PhonePe",
        id: "9347307112@axl",
        icon: "smartphone",
      },
    }
    this.transactionHistory = JSON.parse(localStorage.getItem("transactions") || "[]")
  }

  async processPayment(paymentData, planData) {
    const { name, email, phone, paymentMethod } = paymentData
    const { plan, price } = planData

    // Validate payment data
    if (!this.validatePaymentData(paymentData)) {
      throw new Error("Invalid payment data")
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId()

    // Create transaction record
    const transaction = {
      id: transactionId,
      plan: plan,
      amount: price,
      currency: "INR",
      paymentMethod: paymentMethod,
      customer: {
        name: name,
        email: email,
        phone: phone,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Simulate payment processing
    await this.simulatePaymentGateway(transaction)

    // Update transaction status
    transaction.status = "completed"
    transaction.updatedAt = new Date().toISOString()
    transaction.completedAt = new Date().toISOString()

    // Store transaction
    this.transactionHistory.unshift(transaction)
    localStorage.setItem("transactions", JSON.stringify(this.transactionHistory))

    // Update user plan
    this.updateUserPlan(plan, transaction)

    return transaction
  }

  validatePaymentData(data) {
    const { name, email, phone, paymentMethod } = data

    if (!name || name.length < 2) return false
    if (!email || !this.isValidEmail(email)) return false
    if (!phone || !this.isValidPhone(phone)) return false
    if (!paymentMethod || !this.supportedMethods[paymentMethod]) return false

    return true
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\D/g, ""))
  }

  generateTransactionId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `TXN${timestamp}${random}`.toUpperCase()
  }

  async simulatePaymentGateway(transaction) {
    const method = this.supportedMethods[transaction.paymentMethod]

    // Simulate different processing times
    const processingTime = Math.random() * 3000 + 2000 // 2-5 seconds

    // Show payment gateway simulation
    this.showPaymentGatewaySimulation(method, transaction)

    await new Promise((resolve) => setTimeout(resolve, processingTime))

    // Simulate possible payment failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error("Payment failed: Insufficient funds or network error")
    }

    this.hidePaymentGatewaySimulation()
  }

  showPaymentGatewaySimulation(method, transaction) {
    const simulationHTML = `
            <div class="payment-simulation">
                <div class="payment-header">
                    <span class="material-icons">${method.icon}</span>
                    <h3>Processing ${method.name} Payment</h3>
                </div>
                <div class="payment-details">
                    <div class="detail-row">
                        <span>Amount:</span>
                        <span>₹${transaction.amount}</span>
                    </div>
                    <div class="detail-row">
                        <span>Plan:</span>
                        <span>${transaction.plan.charAt(0).toUpperCase() + transaction.plan.slice(1)}</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment ID:</span>
                        <span>${method.id}</span>
                    </div>
                </div>
                <div class="payment-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p>Please wait while we process your payment...</p>
                </div>
            </div>
        `

    const overlay = document.createElement("div")
    overlay.className = "modal-overlay active payment-simulation-overlay"
    overlay.innerHTML = `<div class="modal-content">${simulationHTML}</div>`
    document.body.appendChild(overlay)

    // Animate progress bar
    const progressFill = overlay.querySelector(".progress-fill")
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10
      if (progress > 100) progress = 100
      progressFill.style.width = progress + "%"
      if (progress >= 100) clearInterval(progressInterval)
    }, 200)
  }

  hidePaymentGatewaySimulation() {
    const simulation = document.querySelector(".payment-simulation-overlay")
    if (simulation) {
      simulation.remove()
    }
  }

  updateUserPlan(plan, transaction) {
    const userData = {
      currentPlan: plan,
      planActivatedAt: transaction.completedAt,
      planExpiresAt: this.calculateExpiryDate(plan),
      lastTransaction: transaction.id,
      planFeatures: this.getPlanFeatures(plan),
    }

    localStorage.setItem("userData", JSON.stringify(userData))
    localStorage.setItem("currentPlan", plan)

    // Reset daily usage for new plan
    const today = new Date().toDateString()
    const usage = JSON.parse(localStorage.getItem("dailyUsage") || "{}")
    usage[today] = { images: 0, videos: 0, audio: 0 }
    localStorage.setItem("dailyUsage", JSON.stringify(usage))
  }

  calculateExpiryDate(plan) {
    const now = new Date()
    const expiryDate = new Date(now)
    expiryDate.setMonth(now.getMonth() + 1) // Add 1 month
    return expiryDate.toISOString()
  }

  getPlanFeatures(plan) {
    const features = {
      free: {
        images: 10,
        videos: 3,
        audio: 5,
        watermark: true,
        priority: false,
        allModels: false,
      },
      basic: {
        images: 15,
        videos: 6,
        audio: 10,
        watermark: true,
        priority: false,
        allModels: false,
        genreMusic: true,
        storyPairing: true,
      },
      pro: {
        images: 21,
        videos: 10,
        audio: 15,
        watermark: false,
        priority: false,
        allModels: true,
        tts: true,
        genreMusic: true,
        storyPairing: true,
      },
      subscription: {
        images: 50,
        videos: 15,
        audio: 25,
        watermark: false,
        priority: true,
        allModels: true,
        tts: true,
        genreMusic: true,
        storyPairing: true,
      },
      ultimate: {
        images: -1, // unlimited
        videos: -1,
        audio: -1,
        watermark: false,
        priority: true,
        allModels: true,
        dslrQuality: true,
        tts: true,
        genreMusic: true,
        storyPairing: true,
      },
    }

    return features[plan] || features.free
  }

  getTransactionHistory() {
    return this.transactionHistory
  }

  getTransactionById(id) {
    return this.transactionHistory.find((t) => t.id === id)
  }

  generateInvoice(transactionId) {
    const transaction = this.getTransactionById(transactionId)
    if (!transaction) {
      throw new Error("Transaction not found")
    }

    const invoice = {
      invoiceNumber: `INV-${transaction.id}`,
      date: new Date(transaction.completedAt).toLocaleDateString(),
      customer: transaction.customer,
      items: [
        {
          description: `${transaction.plan.charAt(0).toUpperCase() + transaction.plan.slice(1)} Plan - Monthly Subscription`,
          amount: transaction.amount,
          currency: transaction.currency,
        },
      ],
      total: transaction.amount,
      paymentMethod: this.supportedMethods[transaction.paymentMethod].name,
      transactionId: transaction.id,
    }

    return invoice
  }

  downloadInvoice(transactionId) {
    const invoice = this.generateInvoice(transactionId)
    const invoiceContent = this.formatInvoiceHTML(invoice)

    const blob = new Blob([invoiceContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Invoice-${invoice.invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  formatInvoiceHTML(invoice) {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .invoice-details { margin: 20px 0; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .total { font-size: 18px; font-weight: bold; text-align: right; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>VisionAI Pro Studio</h1>
                    <h2>Invoice ${invoice.invoiceNumber}</h2>
                </div>
                
                <div class="invoice-details">
                    <p><strong>Date:</strong> ${invoice.date}</p>
                    <p><strong>Customer:</strong> ${invoice.customer.name}</p>
                    <p><strong>Email:</strong> ${invoice.customer.email}</p>
                    <p><strong>Phone:</strong> ${invoice.customer.phone}</p>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items
                          .map(
                            (item) => `
                            <tr>
                                <td>${item.description}</td>
                                <td>₹${item.amount}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Total: ₹${invoice.total}</p>
                    <p>Payment Method: ${invoice.paymentMethod}</p>
                    <p>Transaction ID: ${invoice.transactionId}</p>
                </div>
                
                <p style="margin-top: 40px; text-align: center; color: #666;">
                    Thank you for choosing VisionAI Pro Studio!
                </p>
            </body>
            </html>
        `
  }
}

// Add payment simulation styles
const paymentStyles = document.createElement("style")
paymentStyles.textContent = `
    .payment-simulation {
        text-align: center;
        padding: 2rem;
        max-width: 400px;
    }

    .payment-header {
        margin-bottom: 2rem;
    }

    .payment-header .material-icons {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .payment-header h3 {
        color: var(--text-primary);
        margin: 0;
    }

    .payment-details {
        background: var(--surface-elevated);
        border-radius: var(--radius-md);
        padding: 1rem;
        margin: 1rem 0;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        margin: 0.5rem 0;
        padding: 0.25rem 0;
        border-bottom: 1px solid var(--border);
    }

    .detail-row:last-child {
        border-bottom: none;
        font-weight: 600;
    }

    .payment-progress {
        margin-top: 2rem;
    }

    .payment-progress .progress-bar {
        width: 100%;
        height: 6px;
        background: var(--border);
        border-radius: 3px;
        overflow: hidden;
        margin: 1rem 0;
    }

    .payment-progress .progress-fill {
        height: 100%;
        background: var(--gradient-primary);
        border-radius: 3px;
        transition: width 0.3s ease;
        animation: progressPulse 2s infinite;
    }

    .payment-progress p {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        margin: 0;
    }
`
document.head.appendChild(paymentStyles)

// Initialize payment handler
window.paymentHandler = new PaymentHandler()
