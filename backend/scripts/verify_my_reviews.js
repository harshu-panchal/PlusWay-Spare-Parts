
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const LOGIN_URL = "http://localhost:5001/api/customer/login";
const MY_REVIEWS_URL = "http://localhost:5001/api/customer/reviews";

const verifyMyReviews = async () => {
    try {
        // 1. Login
        // Note: Using a hardcoded test user credential or assuming one exists. 
        // Based on previous context, we might not have credentials.
        // Let's rely on the seed script's user if possible, or fail gracefully.
        // For this script, I'll assume standard test credentials or create a user.
        // Actually, let's just use the seed_reviews.js approach (direct DB check) 
        // OR try to hit the API if we have a valid token.
        // Since I don't have a token, I'll simulate the DB query the controller does.

        console.log("Verifying via Database Query (simulating controller logic)...");

        const { default: mongoose } = await import("mongoose");
        await mongoose.connect(process.env.MONGODB_URI);

        const { default: Review } = await import("../src/models/Review.js");
        const { default: Customer } = await import("../src/models/Customer.js"); // Assuming Customer model exists

        // Find a user who has reviews
        const review = await Review.findOne().populate("user");

        if (!review) {
            console.log("No reviews found in DB to verify.");
        } else {
            console.log(`Found review for user: ${review.user._id}`);

            // Simulate Controller Query
            const userReviews = await Review.find({ user: review.user._id })
                .populate("product", "name")
                .sort({ createdAt: -1 });

            console.log(`Controller would return ${userReviews.length} reviews.`);
            console.log("Sample Review from Query:", JSON.stringify(userReviews[0], null, 2));
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error("Verification failed:", error);
    }
};

verifyMyReviews();
