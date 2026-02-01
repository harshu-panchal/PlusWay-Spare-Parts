import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './src/models/Brand.js';
import connectDB from './src/config/db.js';

dotenv.config();

const checkBrands = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        const suspiciousNames = ['Mobile Tool Kits', 'Screw Driver', 'Glue', 'Touch Changing Machine', 'Opening Tool Set'];

        const found = await Brand.find({ name: { $in: suspiciousNames } });

        console.log('Found suspicious brands:', found);

        const allBrands = await Brand.find({}, 'name');
        console.log('Total brands:', allBrands.length);
        // console.log('All brand names:', allBrands.map(b => b.name));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkBrands();
