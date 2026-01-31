CREATE TABLE
  IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

use inotebook;

alter table users add image varchar(500) default null,
add is_admin int (1) default 0,
add is_verified int (1) default 0,
add token text default null,
add last_login timestamp default null,
add updated_at timestamp default current_timestamp;

CREATE TABLE
  IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tag VARCHAR(50) DEFAULT 'General',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

ALTER TABLE users MODIFY password VARCHAR(255) NULL;