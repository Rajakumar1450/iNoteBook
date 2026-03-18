iNoteBook is a secure, full-stack, enterprise-grade cloud notebook application built with the MERN/PERN stack principles (React, Node.js, Express, and MySQL). It allows users to securely store, manage, and access their personal notes from anywhere.

Currently in active development, this project focuses heavily on backend logic optimization, enterprise-level security, and efficient database querying.

✨ Key Features
🔐 Authentication & Authorization
Custom JWT Authentication: Secure user signup and login using JSON Web Tokens (JWT).

Google OAuth 2.0 Integration: Seamless "Sign in with Google" implementation. The backend verifies Google tokens directly using google-auth-library to prevent forged logins.

OTP Verification: Additional layer of security using time-sensitive One-Time Passwords (OTPs) for user verification.

Protected Routes: Custom fetchuser middleware ensures only verified users can access or modify their notes.

📝 Advanced Note Management (CRUD)
Create & Read: Add detailed notes (Title, Description, Tags) and fetch all notes instantly.

Update: Edit existing notes with real-time database reflection.

Enterprise Bulk Actions: * Bulk Fetch: Fetch specific groups of notes dynamically via URL query parameters (?ids=...).

Bulk Delete: Delete multiple selected notes in a single database request by passing an array of IDs in the request body, avoiding server overload.

Data Isolation: Strict SQL logic ensures users can only read, edit, or delete notes where the user_id matches their verified token.

💻 Tech Stack

Frontend 
Frontend Library: React.js (Hooks: useState, useEffect)

Routing: React Router DOM (v6+) — Utilizing HashRouter for seamless deployment on GitHub Pages.

Styling: CSS3 & Bootstrap (Responsive Design)

Language: JavaScript (ES6+)


Backend
Node.js & Express.js - Server environment and REST API framework.

MySQL - Relational Database for structured, scalable data storage.

mysql2 - Promise-based Node.js driver for database connections.

Security & Utilities
helmet - Secures the Express app by setting strict, industry-standard HTTP response headers.

morgan - HTTP request logger middleware for monitoring API traffic and debugging.

node-cron - Task scheduler used for automated database cleanup.

express-rate-limit - Implements DDoS and brute-force protection to prevent server overload.

jsonwebtoken (JWT) - For generating stateless, secure user sessions.

google-auth-library - Backend verification of Google OAuth tokens.

CORS - Configured to securely bridge frontend and backend.

### 🔐 Environment Configuration
We use strict environment variable validation to prevent runtime errors. 
* **Config Loader:** `custom-env` loads `.env.dev`, `.env.test`, or `.env` depending on your `APP_STAGE`.
* **Validation:** Variables are strictly validated via `Zod` in `config/env.js`. If you are missing required keys (e.g., `DATABASE`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`) or provide invalid data types, the application will throw a detailed error and exit immediately.
* ### Environment Setup
Environment variables are validated strictly using `Zod`. To run the app locally, create a `.env.dev` file in the root directory. If any required variables are missing or invalid, the app will fail to start. 

Here are the required variables you must include in your `.env.dev`:
APP_STAGE=dev
DATABASE=your_database_name
JWT_SECRET=your_secret_must_be_at_least_10_chars
SMTP_MAIL=your_email@example.com
SMTP_PASSWORD=your_smtp_password
GOOGLE_CLIENT_ID=your_google_client_id`


🛡️ Security Best Practices Implemented
HTTP Header Security: Integrated Helmet.js to protect against well-known web vulnerabilities like Cross-Site Scripting (XSS), clickjacking, and sniffing attacks.

DDoS & Brute-Force Mitigation: API rate limiting is implemented to block excessive continuous requests from a single IP address, protecting the server from being overwhelmed.

Data Minimization: Automated Cron Jobs actively delete expired OTPs every minute, ensuring sensitive temporary data is not stored in the database longer than necessary.


SQL Injection Prevention: All database queries utilize Prepared Statements (e.g., db.execute("... WHERE id = ?", [id])) to strictly prevent malicious SQL injection attacks.

Stateless Authentication: Passwords are not stored for Google users, and JWT handles sessions without needing server memory.

Data Ownership Verification: Every update and delete operation strictly checks WHERE user_id = ? AND id = ?, ensuring malicious users cannot manipulate URL parameters to delete other users' data.

🚀 Local Setup Instructions
Follow these instructions to run the application on your local machine.

Prerequisites
Node.js installed.

A local MySQL server running.

A Google Cloud Project with an OAuth 2.0 Client ID.

1. Clone the Repository
Bash
git clone https://github.com/Rajakumar1450/iNoteBook.git
cd iNoteBook

2. Google Cloud Console Configuration (Crucial Step)
When setting up your OAuth Credentials in the Google Cloud Console, you must whitelist the Frontend Port, not the backend port.

Go to Authorized JavaScript origins.

Add your frontend URL: http://localhost:3000 (Make sure there is no trailing slash /).

Note: Google checks the browser's URL (Frontend), so the backend port (5000) is not needed here.
3. Backend Setup
Bash
cd backend
npm install
Create a .env file in the backend folder:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inotebook_db
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

Start the backend server:

Bash
nodemon server.js

4. Frontend Setup
Open a new terminal window:

Bash
cd frontend
npm install
Create a .env.local file in the frontend folder:

REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

Start the React app:

Bash
npm start

The frontend will run on http://localhost:3000 and communicate with the backend securely on http://localhost:5000.

🔮 Future Scope
Cloud Deployment: Deploy the backend Node application to Google Cloud Run or Render, and host the MySQL Database on a cloud provider.

Frontend Hosting: Deploy the React application to Vercel or Netlify.

Rich Text Editor: Transition from standard text areas to a rich-text editor for formatting.
