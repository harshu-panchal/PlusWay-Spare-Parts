import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import Product from "../src/models/Product.js";

dotenv.config();

const migrateDeviceTypes = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    const result = await Product.updateMany(
      {},
      { $set: { deviceType: ["Spare Parts"] } }
    );

    console.log(`Successfully updated ${result.modifiedCount || result.nModified || 0} products to deviceType: ["Spare Parts"].`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateDeviceTypes();
