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

async function inspect() {
    await connectDB();
    const id = '697c7943962ffaff39986814'; // ID from screenshot
    const model = await Model.findById(id);
    if (!model) {
        console.log(`Model with ID ${id} NOT FOUND.`);
    } else {
        console.log(`Model Found:`);
        console.log(`Name: ${model.name}`);
        console.log(`ID: ${model._id}`);
    }
    process.exit(0);
}

inspect();
