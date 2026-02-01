import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import Brand from './src/models/Brand.js';
import connectDB from './src/config/db.js';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE_DIR = 'd:\\AppZeto\\plusway spare parts\\frontend\\src\\assets\\scraped_images\\brands\\logos';

const extractBrandName = (filename) => {
    // Example: Acer_by_Maxbhi.com_Acer_by_maxbhi.jpeg -> Acer
    // Example: Apple_by_Maxbhi.com_Apple_by_maxbhi.jpeg -> Apple
    // Strategy: Take the first part before "_by_Maxbhi"
    const namePart = filename.split('_by_Maxbhi')[0];
    // Replace underscores with spaces if needed? Usually brands are single words or properly separated.
    // For now, let's just capitalize first letter if needed, but the filenames seem to be capitalized (Apple, Acer).
    // Some might have underscores like "Sony_Ericsson".
    return namePart.replace(/_/g, ' ');

    // Special case handling if needed (e.g. "LG" -> "LG")
};

const importBrands = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        if (!fs.existsSync(SOURCE_DIR)) {
            console.error(`Source directory not found: ${SOURCE_DIR}`);
            process.exit(1);
        }

        const files = fs.readdirSync(SOURCE_DIR);

        for (const file of files) {
            // FILTER: Skip spare parts images
            if (file.toLowerCase().includes('spare_parts')) {
                console.log(`Skipping product image: ${file}`);
                continue;
            }

            const brandName = extractBrandName(file);

            // Skip if generic or unwanted files
            if (!brandName) continue;

            console.log(`Processing Brand: ${brandName} (File: ${file})`);

            // Check if brand exists to avoid re-uploading if not forced
            // For this task, we want to ensure images are on Cloudinary.
            // We'll check if the current image is already a cloudinary URL.
            const existingBrand = await Brand.findOne({ name: brandName });

            // If brand exists and has a cloudinary image, skip re-upload to save bandwidth/time
            if (existingBrand && existingBrand.logo && existingBrand.logo.includes('cloudinary')) {
                console.log(`Brand ${brandName} already has Cloudinary logo. Skipping upload.`);
                continue;
            }

            const sourcePath = path.join(SOURCE_DIR, file);
            let logoUrl = '';

            try {
                console.log(`Uploading ${file} to Cloudinary...`);
                const result = await cloudinary.v2.uploader.upload(sourcePath, {
                    folder: "plusway_spare_parts/brands",
                    use_filename: true,
                    unique_filename: false,
                });
                logoUrl = result.secure_url;
                console.log(`Uploaded: ${logoUrl}`);
            } catch (uploadErr) {
                console.error(`Cloudinary Upload Failed for ${brandName}:`, uploadErr.message);
                continue; // Skip db update if upload fails
            }

            if (existingBrand) {
                existingBrand.logo = logoUrl;
                await existingBrand.save();
                console.log(`Updated brand: ${brandName}`);
            } else {
                await Brand.create({
                    name: brandName,
                    logo: logoUrl,
                });
                console.log(`Created brand: ${brandName}`);
            }
        }

        console.log('All brands processed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importBrands();
