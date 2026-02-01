
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const forceFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { default: Product } = await import("../src/models/Product.js");

        // Find the product containing the review "best productt"
        // (Using match from previous run or generic match)
        const products = await Product.find({ "reviews.comment": "best productt" });

        if (products.length === 0) {
            console.log("Product with review 'best productt' not found.");
            return;
        }

        const product = products[0];
        console.log(`Found Product: ${product.name} (${product._id})`);

        const review = product.reviews.find(r => r.comment === "best productt");
        console.log("Current Embedded Review:", JSON.stringify(review, null, 2));

        // Attempt Update
        review.adminReply = "Forced Admin Reply for Debugging";
        review.status = "Approved"; // Ensure it's approved

        const result = await product.save();
        console.log("Saved Product.");

        // Verify
        const updatedProduct = await Product.findById(product._id);
        const updatedReview = updatedProduct.reviews.find(r => r._id.toString() === review._id.toString());

        console.log("Updated Embedded Review:", JSON.stringify(updatedReview, null, 2));

        if (updatedReview.adminReply === "Forced Admin Reply for Debugging") {
            console.log("SUCCESS: Schema supports adminReply and save worked.");
        } else {
            console.log("FAILURE: Save apparently worked but field is missing. Schema issue?");
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error("Error:", error);
    }
};

forceFix();
