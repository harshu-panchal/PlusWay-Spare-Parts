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
      folder: 'plusway_spare_parts/ALCATEL_3_2025',
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
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function getOrCreateCategoryFromTitle(title) {
  let categoryName = 'Spare Parts';
  const lowerTitle = (title || '').toLowerCase();

  if (
    lowerTitle.includes('display') ||
    lowerTitle.includes('lcd') ||
    lowerTitle.includes('screen') ||
    lowerTitle.includes('touch')
  ) {
    categoryName = 'Display & Touch';
  } else if (lowerTitle.includes('battery')) {
    categoryName = 'Battery';
  } else if (
    lowerTitle.includes('back panel') ||
    lowerTitle.includes('back cover') ||
    lowerTitle.includes('panel cover') ||
    lowerTitle.includes('housing') ||
    lowerTitle.includes('body')
  ) {
    categoryName = 'Back Housing & Cover';
  } else if (lowerTitle.includes('charger') || lowerTitle.includes('charging')) {
    categoryName = 'Charger & Cable';
  } else if (
    lowerTitle.includes('earphone') ||
    lowerTitle.includes('ear speaker') ||
    lowerTitle.includes('loud speaker') ||
    lowerTitle.includes('ringer') ||
    lowerTitle.includes('speaker')
  ) {
    categoryName = 'Speaker & Mic';
  } else if (
    lowerTitle.includes('flip cover') ||
    lowerTitle.includes('tempered glass') ||
    lowerTitle.includes('fitness band') ||
    lowerTitle.includes('keyboard')
  ) {
    categoryName = 'Accessories';
  }

  let category = await Category.findOne({ name: categoryName });
  if (!category) {
    category = await Category.create({
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    });
    console.log(`Created Category: ${categoryName}`);
  }

  return category._id;
}

async function importData() {
  await connectDB();

  try {
    let brand = await Brand.findOne({ name: 'Alcatel' });
    if (!brand) {
      brand = await Brand.create({ name: 'Alcatel' });
      console.log("Created Brand 'Alcatel'");
    }

    let model = await Model.findOne({ name: 'Alcatel 3 2025' });
    if (!model) {
      console.log("Creating Model 'Alcatel 3 2025'...");
      model = await Model.create({
        name: '3 2025',
        brand: brand._id,
        released: '2025',
        displaySize: '6.00 inches',
      });
    }

    const scrapedBaseDir = path.resolve(__dirname, '../scraped_data/ALCATEL_3_2025');
    if (!fs.existsSync(scrapedBaseDir)) {
      console.error(`Scraped directory not found: ${scrapedBaseDir}`);
      process.exit(1);
    }

    const productFolders = fs
      .readdirSync(scrapedBaseDir)
      .filter((f) => fs.lstatSync(path.join(scrapedBaseDir, f)).isDirectory());

    console.log(`Found ${productFolders.length} products to import for Alcatel 3 2025.`);

    for (const folder of productFolders) {
      const folderPath = path.join(scrapedBaseDir, folder);
      const detailsPath = path.join(folderPath, 'details.json');

      if (!fs.existsSync(detailsPath)) continue;

      const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

      const existingProduct = await Product.findOne({
        name: details.title,
        model: model._id,
      });
      if (existingProduct) {
        console.log(`Skipping existing: ${details.title}`);
        continue;
      }

      const imageUrls = [];
      const imageFiles = fs
        .readdirSync(folderPath)
        .filter((f) => f.startsWith('image_') && /\.(jpg|jpeg|png|webp)$/i.test(f));

      console.log(`Uploading ${imageFiles.length} images for: ${details.title}`);
      for (const imgFile of imageFiles) {
        const url = await uploadImage(path.join(folderPath, imgFile));
        if (url) imageUrls.push(url);
      }

      const price = parsePrice(details.price);
      const wholesaleMinQty = 10;
      const wholesalePrice = price ? price * 0.8 : 0;
      const description =
        details.description || `High quality ${details.title} spare part for Alcatel 3 2025.`;

      let slug = slugify(details.title);
      if (await Product.findOne({ slug })) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      const code = `ALC3-25-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const specs =
        Array.isArray(details.features) && details.features.length
          ? details.features.map((f) =>
              typeof f === 'string'
                ? { key: 'Feature', value: f }
                : { key: f.key, value: f.value }
            )
          : [];

      const categoryId = await getOrCreateCategoryFromTitle(details.title);

      await Product.create({
        name: details.title,
        slug,
        code,
        description,
        price,
        wholesalePrice,
        wholesaleMinQty,
        mrp: price ? price * 1.5 : 0,
        images: imageUrls,
        brand: brand._id,
        model: model._id,
        category: categoryId,
        countInStock: 20,
        rating: 0,
        numReviews: 0,
        details: { specs },
        productType: 'Spare Part',
      });

      console.log(`Imported: ${details.title}`);
    }

    console.log('Alcatel 3 2025 import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Alcatel 3 2025 import failed:', error);
    process.exit(1);
  }
}

importData();

