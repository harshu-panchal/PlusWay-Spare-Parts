import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "./src/models/Admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    const email = "admin@gmail.com";
    const password = "123456";

    let admin = await Admin.findOne({ email });

    if (admin) {
      console.log(`Admin already exists with email ${email}, updating password.`);
      admin.password = password;
      await admin.save();
    } else {
      admin = await Admin.create({
        name: "Super Admin",
        email,
        mobile: "9999999999",
        password,
      });
      console.log(`Admin created with email ${email}`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
}

seedAdmin();

