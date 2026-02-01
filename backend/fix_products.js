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

async function fixProducts() {
    await connectDB();

    const oldModelId = '697c7943962ffaff39986814'; // Frontend ID (Correct)
    const newModelId = '697d0c20d17cf56bff23c597'; // Imported ID (Duplicate)

    const oldModel = await Model.findById(oldModelId);
    const newModel = await Model.findById(newModelId);

    if (!oldModel || !newModel) {
        console.error("One of the models not found. Aborting.");
        process.exit(1);
    }

    console.log(`Migrating products from '${newModel.name}' (${newModel._id}) to '${oldModel.name}' (${oldModel._id})...`);

    const result = await Product.updateMany(
        { model: newModelId },
        { $set: { model: oldModelId } }
    );

    console.log(`Moved ${result.modifiedCount} products.`);

    console.log(`Deleting duplicate model '${newModel.name}'...`);
    await Model.findByIdAndDelete(newModelId);

    console.log("Fix Complete.");
    process.exit(0);
}

fixProducts();
