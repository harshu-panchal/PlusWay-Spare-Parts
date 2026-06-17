import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Model from './src/models/Model.js';
import Brand from './src/models/Brand.js';
import Banner from './src/models/Banner.js';

dotenv.config();

const newBaseUrl = 'https://plusway.in/uploads/';

const replaceUrl = (url) => {
  if (!url) return url;
  if (url.includes('api.zoomsoo.com')) {
    return url.replace(/https?:\/\/api\.zoomsoo\.com\/uploads\//g, newBaseUrl)
              .replace(/https?:\/\/api\.zoomsoo\.com/g, 'https://plusway.in');
  }
  return url;
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const updateData = async () => {
  await connectDB();

  console.log('Updating Products...');
  const products = await Product.find({});
  let productUpdates = 0;
  for (const product of products) {
    let changed = false;

    if (product.images && product.images.length > 0) {
      const newImages = product.images.map(img => {
        const newImg = replaceUrl(img);
        if (newImg !== img) changed = true;
        return newImg;
      });
      product.images = newImages;
    }

    if (product.colorVariants && product.colorVariants.length > 0) {
      product.colorVariants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          const newVarImages = variant.images.map(img => {
            const newImg = replaceUrl(img);
            if (newImg !== img) changed = true;
            return newImg;
          });
          variant.images = newVarImages;
        }
      });
    }

    if (changed) {
      await product.save();
      productUpdates++;
    }
  }
  console.log(`Updated ${productUpdates} products.`);

  console.log('Updating Categories...');
  const categories = await Category.find({});
  let categoryUpdates = 0;
  for (const category of categories) {
    if (category.image && category.image.includes('api.zoomsoo.com')) {
      category.image = replaceUrl(category.image);
      await category.save();
      categoryUpdates++;
    }
  }
  console.log(`Updated ${categoryUpdates} categories.`);

  console.log('Updating Models...');
  const models = await Model.find({});
  let modelUpdates = 0;
  for (const model of models) {
    if (model.image && model.image.includes('api.zoomsoo.com')) {
      model.image = replaceUrl(model.image);
      await model.save();
      modelUpdates++;
    }
  }
  console.log(`Updated ${modelUpdates} models.`);

  console.log('Updating Brands...');
  const brands = await Brand.find({});
  let brandUpdates = 0;
  for (const brand of brands) {
    if (brand.logo && brand.logo.includes('api.zoomsoo.com')) {
      brand.logo = replaceUrl(brand.logo);
      await brand.save();
      brandUpdates++;
    }
  }
  console.log(`Updated ${brandUpdates} brands.`);

  console.log('Updating Banners...');
  const banners = await Banner.find({});
  let bannerUpdates = 0;
  for (const banner of banners) {
    if (banner.image && banner.image.includes('api.zoomsoo.com')) {
      banner.image = replaceUrl(banner.image);
      await banner.save();
      bannerUpdates++;
    }
  }
  console.log(`Updated ${bannerUpdates} banners.`);

  console.log('Data Update Complete');
  process.exit();
};

updateData();
