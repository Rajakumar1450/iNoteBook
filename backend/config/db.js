const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inotebook",
});
// we use createconnection but it doesn't handle the multi user at a time so we can use pool like createpool function
module.exports = connection;
