
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const verifySync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Get a review
        // We know we seeded one earlier
        const { default: Review } = await import("../src/models/Review.js");
        const { default: Product } = await import("../src/models/Product.js");

        const review = await Review.findOne();
        if (!review) {
            console.log("No review found.");
            process.exit(1);
        }
        console.log(`Found Review ID: ${review._id}, User: ${review.user}`);

        // 2. Simulate Admin Update (Update the Review Doc)
        review.adminReply = "This is a verified admin reply via script.";
        review.status = "Approved";
        await review.save();
        console.log("Updated Review Document.");

        // 3. Simulate Controller Sync Logic (Exact code from controller)
        const product = await Product.findById(review.product);
        if (product) {
            console.log(`Found Product: ${product.name}`);

            // The logic we implemented: match by user ID
            const pReview = product.reviews.find(r => r.user.toString() === review.user.toString());

            if (pReview) {
                console.log("Found embedded review in Product. Syncing...");
                pReview.status = review.status;
                pReview.adminReply = review.adminReply; // This requires the schema update to be in effect
                await product.save();
                console.log("Product saved.");
            } else {
                console.log("Could NOT find embedded review by user ID.");
            }

            // 4. Verification Check
            const updatedProduct = await Product.findById(review.product);
            const verifiedReview = updatedProduct.reviews.find(r => r.user.toString() === review.user.toString());

            if (verifiedReview && verifiedReview.adminReply === "This is a verified admin reply via script.") {
                console.log("SUCCESS: Admin reply is present in Product document!");
            } else {
                console.log("FAILURE: Admin reply NOT found in Product document.");
                console.log("Value found:", verifiedReview ? verifiedReview.adminReply : "Review not found");
            }

        } else {
            console.log("Product not found.");
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error("Error:", error);
    }
};

verifySync();
