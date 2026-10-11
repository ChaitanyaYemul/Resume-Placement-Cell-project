require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/v1/health", (req, res) => res.json({ success: true, message: "API running" }));
app.use("/api/v1/resumes", require("./routes/resumeRoutes"));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found", errors: [] }));
app.use(require("./middleware/errorMiddleware"));

module.exports = app;
