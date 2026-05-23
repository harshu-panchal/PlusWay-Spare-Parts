import fs from "fs";
import path from "path";

// @desc    Upload image to local server
// @route   POST /api/upload
// @access  Public (or Private/Admin depending on needs)
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // The file is already saved locally by Multer in the 'uploads/' folder.
        // We construct an absolute URL so the frontend doesn't need to change.
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            message: "Image uploaded locally",
            url: fileUrl,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
