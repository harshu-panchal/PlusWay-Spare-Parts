import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './src/models/Brand.js';
import connectDB from './src/config/db.js';

dotenv.config();

const cleanup = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        const res1 = await Brand.deleteMany({ name: { $regex: 'Maxbhi' } });
        console.log(`Deleted Maxbhi entries: ${res1.deletedCount}`);

        const res2 = await Brand.deleteMany({ name: 'TEST Brand' });
        console.log(`Deleted TEST Brand entries: ${res2.deletedCount}`);

        // Also check for any other suspiciously long names or names with underscores that shouldn't be there
        // But for now, just the known bad ones.

        console.log('Cleanup complete');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

cleanup();
