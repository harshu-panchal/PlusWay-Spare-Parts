import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Public (or Private/Admin depending on needs)
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "plusway_spare_parts",
        });

        // Remove file from local uploads folder
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error removing file:", err);
        });

        res.json({
            message: "Image uploaded",
            url: result.secure_url,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
