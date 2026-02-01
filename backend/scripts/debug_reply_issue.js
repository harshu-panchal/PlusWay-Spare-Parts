
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const debugReplyValues = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const { default: Product } = await import("../src/models/Product.js");
        const { default: Review } = await import("../src/models/Review.js");

        // Search for the review seen in screenshot "best productt"
        const specificReview = await Review.findOne({ comment: "best productt" });

        if (!specificReview) {
            console.log("Could NOT find independent review with comment 'best productt'.");
            // Fallback: search any review with adminReply
            const anyReplied = await Review.findOne({ adminReply: { $exists: true, $ne: "" } });
            if (anyReplied) {
                console.log("Found another review with reply:", anyReplied._id);
            } else {
                console.log("No reviews with admin replies found in independent collection.");
            }
        } else {
            console.log("\n1. Independent Review (Admin Panel View):");
            console.log(`- ID: ${specificReview._id}`);
            console.log(`- User: ${specificReview.user}`);
            console.log(`- Product ID: ${specificReview.product}`);
            console.log(`- Comment: "${specificReview.comment}"`);
            console.log(`- AdminReply: "${specificReview.adminReply}"`);
            console.log(`- Status: "${specificReview.status}"`);

            // Check Product
            const product = await Product.findById(specificReview.product);
            if (!product) {
                console.log("Product not found!");
            } else {
                console.log("\n2. Embedded Product Review (Customer Page View):");
                console.log(`- Product Name: ${product.name}`);

                // Find matching embedded review
                const embeddedRev = product.reviews.find(r =>
                    r.comment === "best productt" || // Try comment match
                    r.user.toString() === specificReview.user.toString() // Try user ID match
                );

                if (embeddedRev) {
                    console.log(`- Embedded Review Found!`);
                    console.log(`  - Embedded ID: ${embeddedRev._id}`);
                    console.log(`  - User: ${embeddedRev.user}`);
                    console.log(`  - Comment: "${embeddedRev.comment}"`);
                    console.log(`  - AdminReply: "${embeddedRev.adminReply}" <--- CHECK THIS VALUE`);
                    console.log(`  - Status: "${embeddedRev.status}"`);

                    if (!embeddedRev.adminReply) {
                        console.log("\n[DIAGNOSIS]: AdminReply is MISSING in Product document. Sync failed or wasn't triggered.");
                    } else {
                        console.log("\n[DIAGNOSIS]: AdminReply IS present in DB. Issue likely Frontend.");
                    }
                } else {
                    console.log("- No matching embedded review found in Product.");
                }
            }
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error("Error:", error);
    }
};

debugReplyValues();
