import express from "express";
import db from "../db.js";

const router = express.Router();

// Add a new book
router.post("/", (req, res) => {
  const { title, author, category } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      error: "Title and author are required",
    });
  }

  const sql = `
        INSERT INTO books (title, author, category)
        VALUES (?, ?, ?)
    `;

  db.query(sql, [title, author, category || null], (err, result) => {
    if (err) {
      console.error("Error adding book:", err);
      return res.status(500).json({
        error: "Failed to add book",
      });
    }

    res.status(201).json({
      message: "Book added successfully",
      book_id: result.insertId,
    });
  });
});

// Get all books
router.get("/", (req, res) => {
  const sql = "SELECT * FROM books";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).json({
        error: "Failed to fetch books",
      });
    }

    res.json(results);
  });
});

// Get a single book by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM books WHERE book_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching book:", err);
      return res.status(500).json({
        error: "Failed to fetch book",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.json(results[0]);
  });
});

// Update a book
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, category, status } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      error: "Title and author are required",
    });
  }

  const sql = `
        UPDATE books
        SET title = ?, author = ?, category = ?, status = ?
        WHERE book_id = ?
    `;

  db.query(sql, [title, author, category || null, status || "available", id], (err, result) => {
    if (err) {
      console.error("Error updating book:", err);
      return res.status(500).json({
        error: "Failed to update book",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.json({
      message: "Book updated successfully",
    });
  });
});

// Delete a book
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM books WHERE book_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting book:", err);

      return res.status(500).json({
        error: "Failed to delete book",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.json({
      message: "Book deleted successfully",
    });
  });
});

export default router;
