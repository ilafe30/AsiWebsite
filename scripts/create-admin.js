const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const authDbPath = path.join(__dirname, '..', 'unified_extraction.db');

async function createAdmin() {
  const adminData = {
    startup_name: "ASI Admin",
    email: "admin@asi.dz",
    password: "Admin@123", // Change this to your desired password
  };

  console.log("Creating admin account...");
  console.log("Email:", adminData.email);
  console.log("Password:", adminData.password);
  console.log("");

  try {
    const db = new Database(authDbPath);

    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        email_verified INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add role column if it doesn't exist (for existing tables)
    try {
      db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Check if admin already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminData.email);
    if (existing) {
      console.log("❌ Admin account already exists with this email!");
      console.log("Use a different email or delete the existing user first.");
      db.close();
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Create user
    const stmt = db.prepare(
      'INSERT INTO users (startup_name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(adminData.startup_name, adminData.email, passwordHash, 'admin', 1);

    db.close();

    console.log("✅ Admin account created successfully!");
    console.log("");
    console.log("Login credentials:");
    console.log("==================");
    console.log("Email:   ", adminData.email);
    console.log("Password:", adminData.password);
    console.log("");
    console.log("You can now login at: http://localhost:3000/login");
    console.log("");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
