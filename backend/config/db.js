const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "Raja@2007",
  database: "inotebook",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// we use createConnection but that doesn't handle multi user in better way but this handles more efficiently and promise function is only there in the mysql2 not in the mysql here we define the port for our database that is 3307 and we can't run our database and the express server on the same port 
const promisePool = pool.promise();

// Test connection

module.exports = promisePool;
