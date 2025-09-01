const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["deposit", "withdraw"], default: "deposit" },
  qrCodeImage: { type: String },
  screenshot: { type: String },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },

  // Bank details for withdrawal
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  accountHolderName: { type: String },

  // Optional UPI ID
  upiId: { type: String },
});

const Transaction = mongoose.model("transaction", TransactionSchema);
module.exports = Transaction;
