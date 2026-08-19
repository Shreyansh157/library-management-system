import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import booksRouter from "./routes/books.js";
import membersRouter from "./routes/members.js";
import transactionsRouter from "./routes/transactions.js";
import authRouter from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use("/api/books", booksRouter);
app.use("/api/members", membersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
