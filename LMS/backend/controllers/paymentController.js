import Razorpay from "razorpay"
import Course from "../models/courseModel.js"
import Order from "../models/orderModel.js"
import User from "../models/userModel.js"
import crypto from "crypto" // Built-in Node.js module for security verification

// Initialize Razorpay with your API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ========================================
// STEP 1: CREATE PAYMENT ORDER
// ========================================
// When user clicks "Buy Course", this creates a Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId // From authentication middleware
    const { courseId, method } = req.body
    
    // Find the course
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: "Course not found" })

    // Calculate amount (Razorpay needs paisa, not rupees)
    const amountINPaisa = Math.round((course.price || 0) * 100)
    if (amountINPaisa <= 0) return res.status(400).json({ message: "Invalid amount" })

    // Create Razorpay order
    const rpOrder = await razorpay.orders.create({
      amount: amountINPaisa,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment when successful
    })

    // Save order in our database
    const order = await Order.create({
      course: course._id,
      student: userId,
      razorpay_order_id: rpOrder.id,
      amount: amountINPaisa,
      currency: "INR",
      isPaid: false,
      method: method || "all",
    })

    // Send order details to frontend
    const mode = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "test" : "live"
    return res.status(201).json({ 
      key: process.env.RAZORPAY_KEY_ID, 
      order: rpOrder, 
      localOrderId: order._id, 
      mode, 
      method: method || "all" 
    })
  } catch (err) {
    console.error("Create order error:", err)
    return res.status(500).json({ message: "Server error" })
  }
}

// ========================================
// HELPER: ENROLL USER IN COURSE
// ========================================
// This adds the course to user's enrolled list and vice versa
const enrollUserInCourse = async (courseId, userId) => {
  try {
    // Add student to course's enrolled list
    await Course.updateOne(
      { _id: courseId }, 
      { $addToSet: { enrolledStudents: userId } }
    )
    
    // Add course to user's enrolled list
    await User.updateOne(
      { _id: userId }, 
      { $addToSet: { enrolledCourses: courseId } }
    )
  } catch (err) {
    console.error("Enrollment error:", err)
  }
}

// ========================================
// STEP 2: VERIFY PAYMENT (Frontend calls this)
// ========================================
// After payment, frontend sends payment details here for verification
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // SECURITY CHECK: Verify this payment is genuine
    // Create a signature using Razorpay's secret key
    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // HMAC = Hash-based Message Authentication Code
      .update(`${razorpay_order_id}|${razorpay_payment_id}`) // Combine order ID and payment ID
      .digest("hex") // Convert to hexadecimal string

    // Compare signatures - if they don't match, payment is fake!
    if (expected_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature - Payment verification failed" })
    }

    // Find the order
    const order = await Order.findOne({ razorpay_order_id })
    if (!order) return res.status(404).json({ message: "Order not found" })
    if (order.isPaid) return res.status(400).json({ message: "Order already paid" })

    // Mark order as paid
    order.razorpay_payment_id = razorpay_payment_id
    order.razorpay_signature = razorpay_signature
    order.isPaid = true
    order.paidAt = new Date()
    await order.save()

    // Enroll user in the course
    await enrollUserInCourse(order.course, order.student)

    return res.status(200).json({ message: "Payment verified! Course enrolled successfully" })
  } catch (err) {
    console.error("Payment verification error:", err)
    return res.status(500).json({ message: "Server error" })
  }
}

// ========================================
// STEP 3: WEBHOOK (Razorpay calls this automatically)
// ========================================
// Razorpay sends payment updates to this endpoint for extra security
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.headers['x-razorpay-signature']

    // If webhook secret not configured, skip
    if (!webhookSecret) {
      console.warn('Webhook secret not configured')
      return res.status(501).json({ message: 'Webhook not configured' })
    }

    // SECURITY CHECK: Verify webhook is from Razorpay
    const rawBody = req.body // Raw request body (Buffer)
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expected !== signature) {
      console.warn('Invalid webhook signature')
      return res.status(400).json({ message: 'Invalid signature' })
    }

    // Parse webhook data
    const payload = JSON.parse(rawBody.toString())
    const event = payload.event
    console.log('Razorpay webhook event:', event)

    // Handle payment success events
    if (event === 'payment.captured' || event === 'payment.authorized') {
      const paymentEntity = payload.payload?.payment?.entity
      const razorpay_order_id = paymentEntity?.order_id
      const razorpay_payment_id = paymentEntity?.id

      if (razorpay_order_id && razorpay_payment_id) {
        const order = await Order.findOne({ razorpay_order_id })
        
        // Update order and enroll user
        if (order && !order.isPaid) {
          order.razorpay_payment_id = razorpay_payment_id
          order.isPaid = true
          order.paidAt = new Date()
          await order.save()

          // Enroll user in course
          await enrollUserInCourse(order.course, order.student)
        }
      }
    }

    return res.status(200).json({ status: 'ok' })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
