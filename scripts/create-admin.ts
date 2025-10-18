import { AuthDatabaseService } from "../lib/database.js";
import bcrypt from "bcryptjs";

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
    const authDb = new AuthDatabaseService();

    // Check if admin already exists
    const existing = authDb.getUserByEmail(adminData.email);
    if (existing) {
      console.log("❌ Admin account already exists with this email!");
      console.log("Use a different email or delete the existing user first.");
      authDb.close();
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Create user
    const userId = authDb.createUser({
      startup_name: adminData.startup_name,
      email: adminData.email,
      password_hash: passwordHash,
    });

    // Set as admin
    authDb.updateUser(userId, { role: "admin" });

    // Mark email as verified
    authDb.markEmailVerified(userId);

    authDb.close();

    console.log("✅ Admin account created successfully!");
    console.log("");
    console.log("Login credentials:");
    console.log("==================");
    console.log("Email:   ", adminData.email);
    console.log("Password:", adminData.password);
    console.log("");
    console.log("You can now login at: http://localhost:3000/login");
    console.log("");
  } catch (error: any) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
