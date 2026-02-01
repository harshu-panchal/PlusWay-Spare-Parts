
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const reviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        name: String,
        rating: Number,
        comment: String,
        status: String,
        adminReply: String,
    },
    { timestamps: true }
);
const Review = mongoose.model("Review", reviewSchema);

// Minimal schemas for referencing
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema);

const userSchema = new mongoose.Schema({}, { strict: false });
const Customer = mongoose.model("Customer", userSchema);

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const product = await Product.findOne();
        const user = await Customer.findOne();

        if (!product || !user) {
            console.error("Need at least one product and one user to seed reviews.");
            process.exit(1);
        }

        const review = new Review({
            product: product._id,
            user: user._id,
            name: "Test User",
            rating: 5,
            comment: "This is a seeded review to test the Admin Panel display.",
            status: "Pending",
        });

        await review.save();
        console.log("Seeded Review:", review);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

seedReviews();
