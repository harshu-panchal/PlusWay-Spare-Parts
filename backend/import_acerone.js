import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Brand from './src/models/Brand.js';
import Model from './src/models/Model.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(filePath) {
    try {
        const result = await cloudinary.v2.uploader.upload(filePath, {
            folder: "plusway_spare_parts/ACERONE_S162E4",
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Cloudinary Upload Error for ${filePath}:`, error.message);
        return null;
    }
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Remove "Rs.", commas, spaces
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

async function importData() {
    await connectDB();

    try {
        // 1. Get/Create Brand
        let brand = await Brand.findOne({ name: 'Acer' });
        if (!brand) {
            console.log("Creating Brand 'Acer'...");
            brand = await Brand.create({ name: 'Acer' });
        } else {
            console.log("Brand 'Acer' found.");
        }

        // 2. Get/Create Model
        let model = await Model.findOne({ name: 'Acer ACERONE LIQUID S162E4' });
        if (!model) {
            console.log("Creating Model 'Acer ACERONE LIQUID S162E4'...");
            model = await Model.create({
                name: 'Acer ACERONE LIQUID S162E4',
                brand: brand._id,
                released: 'May 2025', // From verified HTML
                displaySize: '6.52 inches'
            });
        } else {
            console.log("Model 'ACERONE LIQUID S162E4' found.");
        }

        // 3. Get/Create Category
        let category = await Category.findOne({ name: 'Spare Parts' });
        if (!category) {
            console.log("Creating Category 'Spare Parts'...");
            category = await Category.create({
                name: 'Spare Parts',
                slug: 'spare-parts'
            });
        } else {
            console.log("Category 'Spare Parts' found.");
        }

        // 4. Iterate Scraped Data
        // Path adjusted: backend (dirname) -> up 2 levels -> scraped_data
        const scrapedBaseDir = path.resolve(__dirname, '../../scraped_data/ACERONE_LIQUID_S162E4');

        if (!fs.existsSync(scrapedBaseDir)) {
            console.error(`Scraped data directory not found: ${scrapedBaseDir}`);
            process.exit(1);
        }

        const productFolders = fs.readdirSync(scrapedBaseDir).filter(f => fs.lstatSync(path.join(scrapedBaseDir, f)).isDirectory());
        console.log(`Found ${productFolders.length} products to import.`);

        for (const folder of productFolders) {
            const folderPath = path.join(scrapedBaseDir, folder);
            const detailsPath = path.join(folderPath, 'details.json');

            if (!fs.existsSync(detailsPath)) {
                console.warn(`Skipping ${folder}: details.json missing`);
                continue;
            }

            const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

            // Check if product exists
            const existingProduct = await Product.findOne({ name: details.title });
            if (existingProduct) {
                console.log(`Product already exists: ${details.title}. Skipping.`);
                continue;
            }

            // Upload Images
            const imageUrls = [];
            const imageFiles = fs.readdirSync(folderPath).filter(f => f.startsWith('image_') && /\.(jpg|jpeg|png)$/i.test(f));

            console.log(`Uploading ${imageFiles.length} images for: ${details.title}`);
            for (const imgFile of imageFiles) {
                const url = await uploadImage(path.join(folderPath, imgFile));
                if (url) imageUrls.push(url);
            }

            // Prepare Data
            const price = parsePrice(details.price);
            const description = details.description || `High quality ${details.title}. 100% genuine spare part.`;

            // Generate Slug (ensure unique)
            let slug = slugify(details.title);
            const duplicateSlug = await Product.findOne({ slug });
            if (duplicateSlug) {
                slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            }

            // Generate unique code
            const code = `ACER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            // Specs
            const specs = details.features.map(f => ({ key: f.key, value: f.value }));
            const inTheBox = details.features.find(f => f.key.toLowerCase().includes('package'))?.value || '';

            // Create Product
            await Product.create({
                name: details.title,
                slug: slug,
                code: code,
                description: description,
                price: price,
                mrp: price * 1.5, // Heuristic
                images: imageUrls,
                brand: brand._id,
                model: model._id,
                category: category._id,
                countInStock: 20,
                rating: 0,
                numReviews: 0,
                details: {
                    specs,
                    inTheBox
                },
                productType: 'Spare Part'
            });

            console.log(`Imported: ${details.title}`);
        }

        console.log("Import Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Import Failed:", error);
        process.exit(1);
    }
}

importData();
