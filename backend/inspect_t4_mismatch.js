
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Model from './src/models/Model.js';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const frontendId = '697c7945962ffaff3998681a';

        // 1. Check if model with frontendId exists
        const modelByFrontendId = await Model.findById(frontendId);
        console.log('Model found by Frontend ID:', modelByFrontendId ? modelByFrontendId.name : 'NOT FOUND');

        // 2. Find the model I created
        const models = await Model.find({ name: /One 10/i });
        console.log('Models matching "One 10":', models.map(m => ({ id: m._id, name: m.name })));

        // 3. Count products for each model found
        for (const m of models) {
            const count = await Product.countDocuments({ model: m._id });
            console.log(`Product count for model ${m._id} (${m.name}):`, count);
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug Error:', error);
        process.exit(1);
    }
}

debug();
