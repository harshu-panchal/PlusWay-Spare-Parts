
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('products');

        // 1. Check indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        // 2. Unset null codes
        const result = await collection.updateMany({ code: null }, { $unset: { code: "" } });
        console.log(`Unset null codes for ${result.modifiedCount} documents`);

        // 3. Drop index if it's not sparse or if it's problematic
        try {
            await collection.dropIndex('code_1');
            console.log('Dropped code_1 index');
        } catch (e) {
            console.log('Index code_1 not found or error dropping:', e.message);
        }

        console.log('Done. Mongoose will recreate the index with sparse: true on next connection.');
        process.exit(0);
    } catch (error) {
        console.error('Fix Error:', error);
        process.exit(1);
    }
}

fix();
