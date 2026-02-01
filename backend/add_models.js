import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import Brand from './src/models/Brand.js';
import Model from './src/models/Model.js';
import connectDB from './src/config/db.js';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE_DIR = 'd:\\AppZeto\\plusway spare parts\\scraped_images';

const cleanModelName = (dirName, brandName) => {
    // Example: Acer_Acerone_Liquid_S162E4 -> Acerone Liquid S162E4
    // Replace underscores with spaces
    let name = dirName.replace(/_/g, ' ');

    // Ensure it starts with brand name
    if (!name.toLowerCase().startsWith(brandName.toLowerCase())) {
        name = `${brandName} ${name}`;
    }

    return name.trim();
};

const addModels = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        if (!fs.existsSync(SOURCE_DIR)) {
            console.error(`Source directory not found: ${SOURCE_DIR}`);
            process.exit(1);
        }

        const brandDirs = fs.readdirSync(SOURCE_DIR);
        // Process top 30 brands or all if less
        // User asked to "add 10-10 models for each brand there are 30 brands on this website"
        // We will process all brands found in the folder folder that exist in DB.

        for (const brandDirName of brandDirs) {
            const brandPath = path.join(SOURCE_DIR, brandDirName);
            if (!fs.lstatSync(brandPath).isDirectory()) continue;

            // Find Brand in DB
            // Brand folder names in scraped_images match the brand names we imported (mostly)
            // But we might need to handle some differences like underscores vs spaces.
            // Our import script replaced _ with space.
            let dbBrandName = brandDirName.replace(/_/g, ' ');

            // Special handling for edge cases if any (e.g. Sony_Ericsson -> Sony Ericsson)

            const brand = await Brand.findOne({
                name: { $regex: new RegExp(`^${dbBrandName}$`, 'i') }
            });

            if (!brand) {
                console.log(`Brand not found in DB: ${dbBrandName} (Skipping...)`);
                continue;
            }

            console.log(`Processing Brand: ${brand.name}`);

            const modelDirs = fs.readdirSync(brandPath);
            let count = 0;

            for (const modelDirName of modelDirs) {
                if (count >= 10) break; // Limit to 10 models per brand

                const modelPath = path.join(brandPath, modelDirName);
                if (!fs.lstatSync(modelPath).isDirectory()) continue;

                const imagePath = path.join(modelPath, 'model.jpeg');
                if (!fs.existsSync(imagePath)) {
                    console.log(`  No image found for ${modelDirName} (Skipping)`);
                    continue;
                }

                const modelName = cleanModelName(modelDirName, brand.name);

                // Check if model exists
                const existingModel = await Model.findOne({ brand: brand._id, name: modelName });
                if (existingModel) {
                    console.log(`  Model exists: ${modelName} (Skipping)`);
                    count++;
                    continue;
                }

                try {
                    console.log(`  Uploading image for ${modelName}...`);
                    const result = await cloudinary.v2.uploader.upload(imagePath, {
                        folder: "plusway_spare_parts/models",
                        use_filename: true,
                    });

                    await Model.create({
                        name: modelName,
                        brand: brand._id,
                        image: result.secure_url,
                    });
                    console.log(`  Created Model: ${modelName}`);
                    count++;
                } catch (err) {
                    console.error(`  Failed to add model ${modelName}:`, err.message);
                }
            }
        }

        console.log('All models processed!');
        process.exit();

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addModels();
