const db = require("../config/db");

const UserSchema = async () => {
  try {
    // 1. Fixed "CREATE" typo
    // 2. Standardized DATE type (SQL usually handles formatting on retrieval)
    await db.query(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    console.log("User table checked/created successfully");
  } catch (error) {
    console.error("Error creating user table:", error);
  }
};

module.exports = UserSchema;
