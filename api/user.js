require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Transaction = require("../models/Transaction");

// POST /api/user/ - Register Users
router.post("/", (req, res) => {
  const { name, email, password,phone} = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({ name, email, password,phone });

    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;

      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;

        newUser.save().then(async user => {
          // Fetch initial transactions (will be empty for new user)
          const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });

          jwt.sign(
            { id: user._id, name: user.name },
            process.env.jwtSecret,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;

              res.json({
                token,
                user: {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone,   // ✅ include phone
                  balance: user.balance || 0,
                  transactions, // send transactions
                  date: user.date
                }
              });
            }
          );
        });
      });
    });
  });
});

// POST /api/user/data - Get user data with transactions
router.post("/data", async (req, res) => {
  const userId = req.body.id;

  if (!userId) {
    return res.status(400).json({ success: false, msg: "User ID missing from request" });
  }

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

    res.json({
      ...user.toObject(),
      transactions
    });
  } catch (err) {
    console.error("Error in /api/user/data:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// DELETE /api/user/:id - Delete user
router.delete("/:id", (req, res) => {
  User.findById(req.params.id)
    .then(user => user.remove().then(() => res.json({ success: true })))
    .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;


