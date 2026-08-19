import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = express.Router();

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const sql = `
        SELECT user_id, name, email, password, role
        FROM users
        WHERE email = ?
    `;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Login database error:", err);

      return res.status(500).json({
        error: "Login failed",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});

export default router;
