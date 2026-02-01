
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';
import Model from './src/models/Model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const correctModelId = '697c7945962ffaff3998681a'; // One 10 T4-129L
        const wrongModelId = '697d14cdf3d429686859f95e';   // Acer One 10 T4-129L

        // 1. Update products
        const updateResult = await Product.updateMany(
            { model: wrongModelId },
            { $set: { model: correctModelId } }
        );
        console.log(`Migrated ${updateResult.modifiedCount} products to Model ${correctModelId}`);

        // 2. Delete the wrong model
        const deleteResult = await Model.deleteOne({ _id: wrongModelId });
        console.log(`Deleted duplicate model ${wrongModelId}:`, deleteResult.deletedCount);

        process.exit(0);
    } catch (error) {
        console.error('Fix Error:', error);
        process.exit(1);
    }
}

fix();
