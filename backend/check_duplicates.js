import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Model from './src/models/Model.js';

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

async function checkDuplicates() {
    await connectDB();
    const regex = /S272E4/i;
    const models = await Model.find({ name: regex });

    console.log(`Found ${models.length} models matching 'S272E4':`);
    models.forEach(m => {
        console.log(`- Name: "${m.name}", ID: ${m._id}`);
    });

    process.exit(0);
}

checkDuplicates();
