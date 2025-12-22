import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "yearly", "lifetime"],
      default: "lifetime"
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "paused"],
      default: "active"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    renewalDate: {
      type: Date
    },
    amount: {
      type: Number,
      required: true
    },
    razorpay_subscription_id: {
      type: String
    },
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
