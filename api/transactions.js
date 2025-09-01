const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/user");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authorize, authorizeAdmin } = require("../middleware/authorizeAdmin");

// Multer setup for storing uploaded screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ----- Deposit Request -----
router.post(
  "/create-deposit-request",
  upload.single("screenshot"),
  async (req, res) => {
    const { userId, amount } = req.body;
    if (!userId || !amount)
      return res.status(400).json({ error: "Missing userId or amount" });

    try {
      const qrCodeImageUrl =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGkRHl46An8tDL2By7orMyTeL_uxrjC7wbAMbm8Q541anximZkE1orvKDjp5CFcuK2c3w&usqp=CAU";

      const transaction = await Transaction.create({
        userId: mongoose.Types.ObjectId(userId),
        amount: parseFloat(amount),
        qrCodeImage: qrCodeImageUrl,
        screenshot: req.file ? req.file.filename : null,
        type: "deposit",
        status: "pending",
      });

      res.json({
        message: "Deposit request created",
        transactionId: transaction._id,
        qrCodeImage: transaction.qrCodeImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ----- Withdraw Request -----
router.post("/create-withdraw-request", async (req, res) => {
  const { userId, amount, accountNumber, bankName, ifscCode, accountHolderName, upiId } = req.body;

  if (!userId || !amount)
    return res.status(400).json({ error: "Missing userId or amount" });

  if ((!upiId || upiId.trim() === "") && (!accountNumber || !bankName || !ifscCode || !accountHolderName)) {
    return res.status(400).json({ error: "Provide either UPI ID or complete bank details" });
  }

  try {
    const transactionData = {
      userId: mongoose.Types.ObjectId(userId),
      amount,
      type: "withdraw",
      status: "pending",
      accountNumber: accountNumber || null,
      bankName: bankName || null,
      ifscCode: ifscCode || null,
      accountHolderName: accountHolderName || null,
      upiId: upiId || null,
    };

    const transaction = await Transaction.create(transactionData);

    res.json({
      message: "Withdraw request created",
      transactionId: transaction._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Admin: Get pending deposits -----
router.get("/admin/deposits", authorize, authorizeAdmin, async (req, res) => {
  try {
    const deposits = await Transaction.find({ type: "deposit", status: "pending" })
      .populate("userId", "name email balance cash date isAdmin");
    res.json(deposits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Admin: Get pending withdraws -----
router.get("/admin/withdraws", authorize, authorizeAdmin, async (req, res) => {
  try {
    const withdraws = await Transaction.find({ type: "withdraw", status: "pending" })
      .populate("userId", "name email balance cash date isAdmin");
    res.json(withdraws);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Approve Deposit (delete screenshot after approval) -----
router.post("/admin/deposit/approve/:id", authorize, authorizeAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "completed";
    await transaction.save();

    const user = await User.findById(transaction.userId);
    user.balance += transaction.amount;
    await user.save();

    // Delete screenshot if exists
    if (transaction.screenshot) {
      const filePath = path.join(__dirname, "..", "uploads", transaction.screenshot);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting screenshot:", err);
      });
    }

    res.json({ message: "Deposit approved and screenshot deleted", balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Approve Withdraw -----
router.post("/admin/withdraw/approve/:id", authorize, authorizeAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    const user = await User.findById(transaction.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < transaction.amount)
      return res.status(400).json({ error: "Insufficient balance for this withdrawal" });

    transaction.status = "completed";
    await transaction.save();

    user.balance -= transaction.amount;
    await user.save();

    // Delete screenshot if any (optional for withdraws)
    if (transaction.screenshot) {
      const filePath = path.join(__dirname, "..", "uploads", transaction.screenshot);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting screenshot:", err);
      });
    }

    res.json({ message: "Withdraw approved", balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Delete Transaction (also delete screenshot if exists) -----
router.delete("/admin/transaction/:id", authorize, authorizeAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    if (transaction.screenshot) {
      const filePath = path.join(__dirname, "..", "uploads", transaction.screenshot);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting screenshot:", err);
      });
    }

    await transaction.remove();
    res.json({ message: "Transaction deleted and screenshot removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Admin: User Management -----
router.get("/admin/users", authorize, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select("name email balance cash date history isAdmin");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/toggle/:id", authorize, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/:id", authorize, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.remove();
    res.json({ message: "User deleted successfully", userId: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Admin: Update QR Code -----
const qrStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "static");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("📂 Created static folder for QR code");
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, "qr.png"),
});
const qrUpload = multer({ storage: qrStorage });

router.post(
  "/admin/update-qr",
  authorize,
  authorizeAdmin,
  qrUpload.single("qr"),
  (req, res) => {
    console.log("🔎 Reached /admin/update-qr");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File received:", req.file);

    if (!req.file) {
      console.error("❌ No file uploaded!");
      return res
        .status(400)
        .json({ error: "No file uploaded. Field name must be 'qr'" });
    }

    const qrCodeUrl = "/static/qr.png";
    console.log("✅ QR code saved:", qrCodeUrl);

    return res.json({
      message: "QR code updated successfully",
      qrCodeUrl,
    });
  }
);


module.exports = router;

