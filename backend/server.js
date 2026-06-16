const express = require("express");
const pool = require("./config/db");
const cors = require("cors");
const initCronJobs = require("./Jobs/cronJob");
const helmet = require("helmet");
const { env, isTestEnv } = require("./config/env");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// 1. GLOBAL SECURITY & UTILITY MIDDLEWARE
app.use(helmet());

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
  morgan("dev", {
    skip: () => isTestEnv(), // ✅ Fixed: Correct implicit return
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes", // ✅ Fixed: Typo
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 2. ROUTE REGISTRATION (Must happen before server boots)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

const notes = require("./routes/notesRouter");
const auth = require("./routes/authRouter");
const errorRoutes = require("./routes/errorRouter");
const imageRoutes = require("./routes/imageUploadRouter");

app.use("/api/notes", notes);
app.use("/api/auth", auth);
app.use("/api/image", imageRoutes);

// Global Error Handler (Must be the last app.use)
app.use(errorRoutes);

// 3. SERVER BOOTSTRAPPER
const PORT = env.BACKENDPORT;

async function startServer() {
  try {
    // Verify database connection first
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database successfully.");
    connection.release();

    // Start background jobs safely after DB is verified
    initCronJobs();

    // Start listening for HTTP requests
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Timeouts for Slowloris and hanging requests
    server.headersTimeout = 10000;
    server.requestTimeout = 120000;
  } catch (err) {
    console.error(
      "Database connection failed. Server shutting down:",
      err.message,
    );
    process.exit(1); // Exit process if the core database cannot be reached
  }
}

// Start everything safely
startServer();
