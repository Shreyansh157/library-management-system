import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin@123",
  database: "library_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }

  console.log("MySQL database connected successfully!");
});

export default db;
