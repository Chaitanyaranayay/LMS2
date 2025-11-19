#!/usr/bin/env node
// simulate_webhook.js
// Usage:
//   node simulate_webhook.js <ngrok_url> <webhook_secret>
// Example:
//   node simulate_webhook.js https://abc123.ngrok.io my_webhook_secret

import crypto from 'crypto'
import { fileURLToPath } from 'url'

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node simulate_webhook.js <ngrok_url> <webhook_secret>')
  process.exit(1)
}

const [ngrokUrl, webhookSecret] = args
const target = new URL('/api/payment/webhook', ngrokUrl).toString()

const payload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: `pay_sim_${Date.now()}`,
        order_id: `order_sim_${Date.now()}`,
        amount: 100,
        currency: 'INR',
        status: 'captured'
      }
    }
  }
}

const body = JSON.stringify(payload)
const signature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')

console.log('Sending simulated webhook to', target)
console.log('Payload:', body)

const fetchOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature
  },
  body
}

// Use global fetch (Node 18+). If unavailable, node-fetch would be required.
try {
  const res = await fetch(target, fetchOptions)
  const text = await res.text()
  console.log('Response status:', res.status)
  console.log('Response body:', text)
} catch (err) {
  console.error('Error sending webhook:', err)
  process.exit(1)
}
