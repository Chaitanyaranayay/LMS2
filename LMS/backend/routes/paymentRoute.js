import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createRazorpayOrder, verifyPayment } from "../controllers/paymentController.js"

const router = express.Router()

router.post("/create-order", isAuth, createRazorpayOrder)
router.post("/verify", isAuth, verifyPayment)

export default router
