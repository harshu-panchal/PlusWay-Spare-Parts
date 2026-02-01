
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Product from './src/models/Product.js';
import Brand from './src/models/Brand.js';
import Model from './src/models/Model.js';
import Category from './src/models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SCRAPED_DIR = path.resolve(__dirname, '../../scraped_data/ONE_8_T4-82L');
const BRAND_NAME = 'Acer';
const MODEL_NAME = 'One 8 T4-82L';

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath, folder) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            use_filename: true,
            unique_filename: true,
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Cloudinary upload failed for ${filePath}:`, error.message);
        return null;
    }
}

async function getOrCreateCategory(title) {
    let categoryName = 'Spare Parts';
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('display') || lowerTitle.includes('lcd') || lowerTitle.includes('screen') || lowerTitle.includes('touch')) {
        categoryName = 'Display & Touch';
    } else if (lowerTitle.includes('battery')) {
        categoryName = 'Battery';
    } else if (lowerTitle.includes('cover') || lowerTitle.includes('housing') || lowerTitle.includes('body')) {
        categoryName = 'Back Housing & Cover';
    } else if (lowerTitle.includes('camera')) {
        categoryName = 'Camera';
    } else if (lowerTitle.includes('charger') || lowerTitle.includes('adapter') || lowerTitle.includes('usb')) {
        categoryName = 'Charger & Cable';
    } else if (lowerTitle.includes('speaker') || lowerTitle.includes('mic') || lowerTitle.includes('buzzer')) {
        categoryName = 'Speaker & Mic';
    }

    let category = await Category.findOne({ name: categoryName });
    if (!category) {
        category = new Category({
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            image: '',
        });
        await category.save();
        console.log(`Created Category: ${categoryName}`);
    }
    return category._id;
}

async function importData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get/Create Brand
        let brand = await Brand.findOne({ name: BRAND_NAME });
        if (!brand) {
            brand = new Brand({
                name: BRAND_NAME,
                slug: BRAND_NAME.toLowerCase(),
                image: ''
            });
            await brand.save();
            console.log(`Created Brand: ${BRAND_NAME}`);
        }

        // 2. Get/Create Model
        let model = await Model.findOne({ name: MODEL_NAME, brand: brand._id });
        if (!model) {
            model = new Model({
                name: MODEL_NAME,
                brand: brand._id,
                released: '2020', // Default/Assume
                displaySize: '8.00 inches'
            });
            await model.save();
            console.log(`Created Model: ${MODEL_NAME}`);
        }

        // 3. Process Products
        if (!fs.existsSync(SCRAPED_DIR)) {
            console.log("Scraped directory not found!");
            process.exit(1);
        }

        const productFolders = fs.readdirSync(SCRAPED_DIR);
        for (const folder of productFolders) {
            const folderPath = path.join(SCRAPED_DIR, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const detailsPath = path.join(folderPath, 'details.json');
            if (!fs.existsSync(detailsPath)) continue;

            const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

            // Check if exists
            const exists = await Product.findOne({ name: details.title, model: model._id });
            if (exists) {
                console.log(`Skipping existing: ${details.title}`);
                continue;
            }

            const categoryId = await getOrCreateCategory(details.title);

            // Upload Images
            const imageUrls = [];
            const files = fs.readdirSync(folderPath).filter(f => f.startsWith('image_'));
            // Limit to 5 images
            const imagesToUpload = files.slice(0, 5);

            for (const imgFile of imagesToUpload) {
                const url = await uploadToCloudinary(path.join(folderPath, imgFile), `plusway_spare_parts/ACER_T4_82L`);
                if (url) imageUrls.push(url);
            }

            // Parse Price
            let price = 0;
            if (details.price) {
                price = parseFloat(details.price.replace(/[^0-9.]/g, ''));
            }

            const product = new Product({
                name: details.title,
                slug: (details.title + '-' + Math.random().toString(36).substring(7)).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: details.description,
                price: price,
                mrp: price * 1.2, // Fake MRP
                brand: brand._id,
                model: model._id,
                category: categoryId,
                images: imageUrls,
                countInStock: 10,
                details: {
                    specs: details.features,
                }
            });

            await product.save();
            console.log(`Imported: ${details.title}`);
        }

        console.log("Import Completed");
        process.exit(0);

    } catch (error) {
        console.error("Import Error:", error);
        process.exit(1);
    }
}

importData();
