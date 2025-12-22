import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    razorpay_order_id: {
      type: String,
      required: true
    },
    razorpay_payment_id: {
      type: String
    },
    razorpay_signature: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "all"],
      default: "all"
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
