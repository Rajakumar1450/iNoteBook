const db = require("./config/db");
const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;
db.connect(() => {
  console.log("connected!");
});

app.get("/", (req, res) => {
  res.send("hii");
});
app.listen(PORT, () => {
  console.log(`listening on the port ${PORT}`);
});
