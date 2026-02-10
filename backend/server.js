const express = require("express");
const pool = require("./config/db");
const cors = require("cors");
const initCronJobs = require("./Jobs/cronJob");
const helmet = require("helmet");
const { env, isTestEnv } = require("./env");
const morgan = require("morgan");
initCronJobs();
const app = express();
app.use(helmet());
//helmet hide our tech stack and set secure HTTP Headers
const rateLimit = require("express-rate-limit");
const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions)); // allow only 'http://localhost:3000' to access our api server;
// Only allow JSON bodies up to 10kb
app.use(express.json({ limit: "10kb" }));

// Only allow URL-encoded bodies up to 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
//this is middleware function which is necessary for getting any request object in backend on some end point

app.use(
  morgan("dev", {
    skip: () => {
      isTestEnv();
    },
  }),
);
const PORT = env.BACKENDPORT;
//this is port for the express server and we can't run the express and the database on the same port
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "To many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);
async function startServer() {
  //since we are using the promise and pool then we have to make a syncronised function to createconneection we can't simply put pool.getConnection;
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database on port 3307");
    connection.release();
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    // 1. Headers Timeout: Stop "Slowloris" attacks
    // If headers aren't received within 60s, kill it.
    server.headersTimeout = 10000;
    // 2. Request Timeout: Stop hanging logic
    // If the app takes more than 2 minutes to respond, close the connection.
    server.requestTimeout = 120000;
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

startServer();
app.get("/", (req, res) => {
  res.send("Server is running!");
});

const notes = require("./routes/notesRouter");
const auth = require("./routes/authRouter");
app.use("/api/notes", notes);
app.use("/api/auth", auth);
// app.use("/",webRoute);
