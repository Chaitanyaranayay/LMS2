import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { 
  getStudentInvoices, 
  getInvoiceById, 
  getStudentSubscriptions,
  getEducatorRevenue 
} from "../controllers/invoiceController.js";

const invoiceRouter = express.Router();

// Student routes
invoiceRouter.get("/my-invoices", isAuth, getStudentInvoices);
invoiceRouter.get("/my-subscriptions", isAuth, getStudentSubscriptions);
invoiceRouter.get("/:invoiceId", isAuth, getInvoiceById);

// Educator routes
invoiceRouter.get("/educator/revenue", isAuth, getEducatorRevenue);

export default invoiceRouter;
