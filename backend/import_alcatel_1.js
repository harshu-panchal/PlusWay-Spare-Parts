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

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(filePath) {
    try {
        const result = await cloudinary.v2.uploader.upload(filePath, {
            folder: "plusway_spare_parts/ALCATEL_1",
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Cloudinary Upload Error for ${filePath}:`, error.message);
        return null;
    }
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function importData() {
    await connectDB();

    try {
        let brand = await Brand.findOne({ name: 'Alcatel' });
        if (!brand) {
            brand = await Brand.create({ name: 'Alcatel' });
        }

        let model = await Model.findOne({ name: 'Alcatel 1' });
        if (!model) {
            console.log("Creating Model 'Alcatel 1'...");
            model = await Model.create({
                name: '1', // The pre-save hook will make it 'Alcatel 1'
                brand: brand._id,
                released: 'July 2018',
                displaySize: '5.00 inches'
            });
        }

        let category = await Category.findOne({ name: 'Spare Parts' });
        if (!category) {
            category = await Category.create({ name: 'Spare Parts', slug: 'spare-parts' });
        }

        const scrapedBaseDir = path.resolve(__dirname, '../../scraped_data/ALCATEL_1');

        if (!fs.existsSync(scrapedBaseDir)) {
            console.error(`Scraped directory not found: ${scrapedBaseDir}`);
            process.exit(1);
        }

        const productFolders = fs.readdirSync(scrapedBaseDir).filter(f => fs.lstatSync(path.join(scrapedBaseDir, f)).isDirectory());
        console.log(`Found ${productFolders.length} products to import.`);

        for (const folder of productFolders) {
            const folderPath = path.join(scrapedBaseDir, folder);
            const detailsPath = path.join(folderPath, 'details.json');

            if (!fs.existsSync(detailsPath)) continue;

            const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

            const existingProduct = await Product.findOne({ name: details.title });
            if (existingProduct) {
                console.log(`Skipping existing: ${details.title}`);
                continue;
            }

            const imageUrls = [];
            const imageFiles = fs.readdirSync(folderPath).filter(f => f.startsWith('image_') && /\.(jpg|jpeg|png)$/i.test(f));

            console.log(`Uploading ${imageFiles.length} images for: ${details.title}`);
            for (const imgFile of imageFiles) {
                const url = await uploadImage(path.join(folderPath, imgFile));
                if (url) imageUrls.push(url);
            }

            const price = parsePrice(details.price);
            const wholesaleMinQty = 10;
            const wholesalePrice = price ? price * 0.8 : 0;
            const description = details.description || `High quality ${details.title}.`;

            let slug = slugify(details.title);
            if (await Product.findOne({ slug })) {
                slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            }

            const code = `ALCA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const specs = details.features.map(f => ({ key: f.key, value: f.value }));
            const inTheBox = details.features.find(f => f.key.toLowerCase().includes('package'))?.value || '';

            await Product.create({
                name: details.title,
                slug: slug,
                code: code,
                description: description,
                price: price,
                wholesalePrice,
                wholesaleMinQty,
                mrp: price * 1.5,
                images: imageUrls,
                brand: brand._id,
                model: model._id,
                category: category._id,
                countInStock: 20,
                rating: 0,
                numReviews: 0,
                details: { specs, inTheBox },
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
