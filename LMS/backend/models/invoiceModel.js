import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription"
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    amount: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded"],
      default: "pending"
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date
    },
    paidAt: {
      type: Date
    },
    invoiceType: {
      type: String,
      enum: ["one-time", "subscription"],
      default: "one-time"
    }
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.models.Invoice.countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
