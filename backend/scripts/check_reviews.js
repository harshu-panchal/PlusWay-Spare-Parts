
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("Connecting to DB:", process.env.MONGODB_URI);

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

const checkReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const count = await Review.countDocuments();
        console.log(`Total Reviews in DB: ${count}`);

        if (count > 0) {
            const reviews = await Review.find().limit(5);
            console.log("Sample Reviews:", JSON.stringify(reviews, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

checkReviews();
