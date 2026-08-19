import express from "express";
import db from "../db.js";

const router = express.Router();

// Issue a book
router.post("/issue", (req, res) => {
  const { member_id, book_id } = req.body;

  if (!member_id || !book_id) {
    return res.status(400).json({
      error: "Member ID and book ID are required",
    });
  }

  // First check that the member exists
  const memberSql = "SELECT * FROM members WHERE member_id = ?";

  db.query(memberSql, [member_id], (err, members) => {
    if (err) {
      console.error("Error checking member:", err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    if (members.length === 0) {
      return res.status(404).json({
        error: "Member not found",
      });
    }

    // Now check the book
    const bookSql = "SELECT * FROM books WHERE book_id = ?";

    db.query(bookSql, [book_id], (err, books) => {
      if (err) {
        console.error("Error checking book:", err);
        return res.status(500).json({
          error: "Database error",
        });
      }

      if (books.length === 0) {
        return res.status(404).json({
          error: "Book not found",
        });
      }

      const book = books[0];

      // Make sure the book isn't already issued
      if (book.status === "issued") {
        return res.status(400).json({
          error: "Book is already issued",
        });
      }

      // Create the transaction
      const transactionSql = `
                INSERT INTO transactions (member_id, book_id, issue_date)
                VALUES (?, ?, CURDATE())
            `;

      db.query(transactionSql, [member_id, book_id], (err, result) => {
        if (err) {
          console.error("Error creating transaction:", err);
          return res.status(500).json({
            error: "Failed to issue book",
          });
        }

        // Mark the book as issued
        const updateBookSql = `
                        UPDATE books
                        SET status = 'issued'
                        WHERE book_id = ?
                    `;

        db.query(updateBookSql, [book_id], (err) => {
          if (err) {
            console.error("Error updating book status:", err);

            return res.status(500).json({
              error: "Book issued but status update failed",
            });
          }

          res.status(201).json({
            message: "Book issued successfully",
            transaction_id: result.insertId,
          });
        });
      });
    });
  });
});

// Return a book
router.post("/return/:id", (req, res) => {
  const { id } = req.params;

  // Find the transaction
  const transactionSql = `
        SELECT * FROM transactions
        WHERE txn_id = ?
    `;

  db.query(transactionSql, [id], (err, transactions) => {
    if (err) {
      console.error("Error finding transaction:", err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    if (transactions.length === 0) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    const transaction = transactions[0];

    // Make sure it hasn't already been returned
    if (transaction.return_date !== null) {
      return res.status(400).json({
        error: "Book has already been returned",
      });
    }

    // Calculate the fine
    const fineSql = `
            SELECT
                DATEDIFF(CURDATE(), issue_date) AS days_borrowed
            FROM transactions
            WHERE txn_id = ?
        `;

    db.query(fineSql, [id], (err, fineResults) => {
      if (err) {
        console.error("Error calculating fine:", err);
        return res.status(500).json({
          error: "Failed to calculate fine",
        });
      }

      const daysBorrowed = fineResults[0].days_borrowed;

      const allowedDays = 7;
      const finePerDay = 5;

      const overdueDays = Math.max(0, daysBorrowed - allowedDays);

      const fine = overdueDays * finePerDay;

      // Update transaction
      const updateTransactionSql = `
                UPDATE transactions
                SET return_date = CURDATE(), fine = ?
                WHERE txn_id = ?
            `;

      db.query(updateTransactionSql, [fine, id], (err) => {
        if (err) {
          console.error("Error updating transaction:", err);

          return res.status(500).json({
            error: "Failed to return book",
          });
        }

        // Make the book available again
        const updateBookSql = `
                        UPDATE books
                        SET status = 'available'
                        WHERE book_id = ?
                    `;

        db.query(updateBookSql, [transaction.book_id], (err) => {
          if (err) {
            console.error("Error updating book status:", err);

            return res.status(500).json({
              error: "Book returned but status update failed",
            });
          }

          res.json({
            message: "Book returned successfully",
            fine: fine,
            overdue_days: overdueDays,
          });
        });
      });
    });
  });
});

// Get all transactions
router.get("/", (req, res) => {
  const sql = `
        SELECT
            t.txn_id,
            t.member_id,
            m.name AS member_name,
            t.book_id,
            b.title AS book_title,
            t.issue_date,
            t.return_date,
            t.fine
        FROM transactions t
        JOIN members m ON t.member_id = m.member_id
        JOIN books b ON t.book_id = b.book_id
        ORDER BY t.txn_id DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);

      return res.status(500).json({
        error: "Failed to fetch transactions",
      });
    }

    res.json(results);
  });
});

// Get currently issued books
router.get("/issued", (req, res) => {
  const sql = `
        SELECT
            t.txn_id,
            m.name AS member_name,
            b.title AS book_title,
            t.issue_date,
            t.fine
        FROM transactions t
        JOIN members m ON t.member_id = m.member_id
        JOIN books b ON t.book_id = b.book_id
        WHERE t.return_date IS NULL
        ORDER BY t.issue_date DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching issued books:", err);

      return res.status(500).json({
        error: "Failed to fetch issued books",
      });
    }

    res.json(results);
  });
});

export default router;
