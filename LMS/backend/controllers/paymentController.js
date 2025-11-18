import Razorpay from "razorpay"
import Course from "../models/courseModel.js"
import Order from "../models/orderModel.js"
import User from "../models/userModel.js"
import crypto from "crypto"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId // requires isAuth
    const { courseId } = req.body
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: "Course not found" })

    const amountINPaisa = Math.round((course.price || 0) * 100)
    if (amountINPaisa <= 0) return res.status(400).json({ message: "Invalid amount" })

    const options = {
      amount: amountINPaisa,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture
    }

    const rpOrder = await razorpay.orders.create(options)

    const order = await Order.create({
      course: course._id,
      student: userId,
      razorpay_order_id: rpOrder.id,
      amount: amountINPaisa,
      currency: "INR",
      isPaid: false,
    })

    return res.status(201).json({ key: process.env.RAZORPAY_KEY_ID, order: rpOrder, localOrderId: order._id })
  } catch (err) {
    console.error("createRazorpayOrder error:", err)
    return res.status(500).json({ message: "Server error" })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expected_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" })
    }

    const order = await Order.findOne({ razorpay_order_id })
    if (!order) return res.status(404).json({ message: "Order not found" })
    if (order.isPaid) return res.status(400).json({ message: "Order already paid" })

    order.razorpay_payment_id = razorpay_payment_id
    order.razorpay_signature = razorpay_signature
    order.isPaid = true
    order.paidAt = new Date()
    await order.save()

    // Enroll user idempotently using atomic updates to avoid triggering full document validation
    // (some Course documents in the DB may have invalid enum values which cause save() to fail)
    const courseId = order.course
    const userId = order.student
    if (courseId && userId) {
      try {
        // addToSet avoids duplicates and doesn't load the full document (so it avoids validation errors)
        await Course.updateOne({ _id: courseId }, { $addToSet: { enrolledStudents: userId } }).exec()
        await User.updateOne({ _id: userId }, { $addToSet: { enrolledCourses: courseId } }).exec()
      } catch (updateErr) {
        console.error('verifyPayment enrollment update error:', updateErr)
      }
    }

    return res.status(200).json({ message: "Payment verified and enrolled" })
  } catch (err) {
    console.error("verifyPayment error:", err)
    return res.status(500).json({ message: "Server error" })
  }
}
