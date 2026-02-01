
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';
import Model from './src/models/Model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function del() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const model = await Model.findOne({ name: 'One 10 T4-129L' });
        if (!model) {
            console.log('Model not found');
            process.exit(0);
        }

        const result = await Product.deleteMany({ model: model._id });
        console.log(`Deleted ${result.deletedCount} products for model ${model.name}`);

        process.exit(0);
    } catch (error) {
        console.error('Delete Error:', error);
        process.exit(1);
    }
}

del();
