import express from "express";
import db from "../db.js";

const router = express.Router();

// Dashboard statistics
router.get("/stats", (req, res) => {
  const sql = `
        SELECT
            (SELECT COUNT(*) FROM books) AS total_books,
            (SELECT COUNT(*) FROM books WHERE status = 'available') AS available_books,
            (SELECT COUNT(*) FROM books WHERE status = 'issued') AS issued_books,
            (SELECT COUNT(*) FROM members) AS total_members
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching dashboard stats:", err);

      return res.status(500).json({
        error: "Failed to fetch dashboard statistics",
      });
    }

    res.json(results[0]);
  });
});

export default router;
