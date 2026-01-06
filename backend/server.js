const express = require("express");
const pool = require("./config/db");
const app = express();
app.use(express.json()); //this is middleware function which is necessary for getting any request object in backend on some end point

const PORT = 5000;
//this is port for the express server and we can't run the express and the database on the same port
async function startServer() {
  //since we are using the promise and pool then we have to make a syncronised function to createconneection we can't simply put pool.getConnection;
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database on port 3307");
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

startServer();
app.get("/", (req, res) => {
  res.send("Server is running!");
});

const notes = require("./routes/notes");
const auth = require("./routes/auth");
app.use("/api/notes", notes);
app.use("/api/auth", auth);
