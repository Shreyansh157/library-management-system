import bcrypt from "bcrypt";
import db from "./backend/db.js";

const name = "Library Admin";
const email = "admin@library.com";
const password = "admin123";

const hashedPassword = await bcrypt.hash(password, 10);

const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, 'admin')
`;

db.query(sql, [name, email, hashedPassword], (err, result) => {
  if (err) {
    console.error("Failed to create admin:", err);
    process.exit(1);
  }

  console.log("Admin created successfully!");
  console.log("User ID:", result.insertId);
  console.log("Email:", email);
  console.log("Password:", password);

  db.end();
});
