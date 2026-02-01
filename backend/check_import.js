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
    const model = await Model.findOne({ name: 'ACERONE LIQUID S162E4' });
    if (!model) {
        console.log("Model not found!");
        process.exit(1);
    }
    console.log(`Model ID in DB: ${model._id}`);

    const count = await Product.countDocuments({ model: model._id });
    console.log(`Total Products for ACERONE LIQUID S162E4: ${count}`);
    process.exit(0);
}

checkImport();
