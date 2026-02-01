import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Model from './src/models/Model.js';
import Product from './src/models/Product.js';

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

async function checkImport() {
    await connectDB();
    const modelName = 'ACERONE LIQUID S272E4';
    let model = await Model.findOne({ name: modelName });

    if (!model) {
        // Try title case
        const altName = 'Acerone Liquid S272E4';
        model = await Model.findOne({ name: altName });
        if (model) console.log(`Found model with alternative name: ${altName}`);
    } else {
        console.log(`Found model with name: ${modelName}`);
    }

    if (!model) {
        console.log("Model not found!");
        process.exit(1);
    }
    console.log(`Model ID: ${model._id}`);

    const count = await Product.countDocuments({ model: model._id });
    console.log(`Total Products for ${model.name}: ${count}`);
    process.exit(0);
}

checkImport();
