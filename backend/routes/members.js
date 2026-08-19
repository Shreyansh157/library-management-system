import express from "express";
import db from "../db.js";

const router = express.Router();

// Add a new member
router.post("/", (req, res) => {
  const { name, phone, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      error: "Name and phone are required",
    });
  }

  const sql = `
        INSERT INTO members (name, phone, address)
        VALUES (?, ?, ?)
    `;

  db.query(sql, [name, phone, address || null], (err, result) => {
    if (err) {
      console.error("Error adding member:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "A member with this phone number already exists",
        });
      }

      return res.status(500).json({
        error: "Failed to add member",
      });
    }

    res.status(201).json({
      message: "Member added successfully",
      member_id: result.insertId,
    });
  });
});

// Get all members
router.get("/", (req, res) => {
  const sql = "SELECT * FROM members";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching members:", err);

      return res.status(500).json({
        error: "Failed to fetch members",
      });
    }

    res.json(results);
  });
});

// Get a single member
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM members WHERE member_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching member:", err);

      return res.status(500).json({
        error: "Failed to fetch member",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Member not found",
      });
    }

    res.json(results[0]);
  });
});

// Update a member
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      error: "Name and phone are required",
    });
  }

  const sql = `
        UPDATE members
        SET name = ?, phone = ?, address = ?
        WHERE member_id = ?
    `;

  db.query(sql, [name, phone, address || null, id], (err, result) => {
    if (err) {
      console.error("Error updating member:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "A member with this phone number already exists",
        });
      }

      return res.status(500).json({
        error: "Failed to update member",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Member not found",
      });
    }

    res.json({
      message: "Member updated successfully",
    });
  });
});

// Delete a member
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM members WHERE member_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting member:", err);

      return res.status(500).json({
        error: "Failed to delete member",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Member not found",
      });
    }

    res.json({
      message: "Member deleted successfully",
    });
  });
});

export default router;
