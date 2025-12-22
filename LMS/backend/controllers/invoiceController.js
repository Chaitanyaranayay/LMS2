import Invoice from "../models/invoiceModel.js";
import Subscription from "../models/subscriptionModel.js";
import Order from "../models/orderModel.js";

// Get all invoices for a student
export const getStudentInvoices = async (req, res) => {
  try {
    const userId = req.userId;
    
    const invoices = await Invoice.find({ student: userId })
      .populate('course', 'title thumbnail')
      .populate('order')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(invoices);
  } catch (err) {
    console.error("Get invoices error:", err);
    return res.status(500).json({ message: "Failed to get invoices" });
  }
};

// Get single invoice details
export const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.userId;
    
    const invoice = await Invoice.findById(invoiceId)
      .populate('course', 'title thumbnail price')
      .populate('student', 'name email')
      .populate('order')
      .populate('subscription');
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    // Check if user owns this invoice
    if (invoice.student._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    return res.status(200).json(invoice);
  } catch (err) {
    console.error("Get invoice error:", err);
    return res.status(500).json({ message: "Failed to get invoice" });
  }
};

// Get all subscriptions for a student
export const getStudentSubscriptions = async (req, res) => {
  try {
    const userId = req.userId;
    
    const subscriptions = await Subscription.find({ student: userId })
      .populate('course', 'title thumbnail price')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(subscriptions);
  } catch (err) {
    console.error("Get subscriptions error:", err);
    return res.status(500).json({ message: "Failed to get subscriptions" });
  }
};

// Get educator's revenue and invoices
export const getEducatorRevenue = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all invoices for courses created by this educator
    const invoices = await Invoice.find({ status: "paid" })
      .populate({
        path: 'course',
        match: { creator: userId },
        select: 'title price creator'
      })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    
    // Filter out null courses (courses not created by this educator)
    const educatorInvoices = invoices.filter(inv => inv.course !== null);
    
    const totalRevenue = educatorInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    return res.status(200).json({
      invoices: educatorInvoices,
      totalRevenue,
      count: educatorInvoices.length
    });
  } catch (err) {
    console.error("Get educator revenue error:", err);
    return res.status(500).json({ message: "Failed to get revenue data" });
  }
};
