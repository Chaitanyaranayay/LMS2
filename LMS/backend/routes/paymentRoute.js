import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createRazorpayOrder, verifyPayment, handleRazorpayWebhook } from "../controllers/paymentController.js"

const router = express.Router()

router.post("/create-order", isAuth, createRazorpayOrder)
router.post("/verify", isAuth, verifyPayment)

// webhook endpoint - Razorpay will POST raw body and signature header
// note: this route intentionally uses express.raw on the body so signature verification can use the raw payload
router.post('/webhook', express.raw({ type: '*/*' }), handleRazorpayWebhook)

export default router
