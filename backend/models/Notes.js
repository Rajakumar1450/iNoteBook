const db = require("../config/db");

const Notes = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tag VARCHAR(50) DEFAULT 'General',
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
      `);
    console.log("Notes Table Created!");
  } catch (error) {
    console.log(`Error in Creating Notes Table ${error}`);
  }
};

module.exports = Notes;
