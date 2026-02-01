import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './src/models/Brand.js';
import Model from './src/models/Model.js';
import connectDB from './src/config/db.js';

dotenv.config();

const migrateModelNames = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        const models = await Model.find({}).populate('brand');
        console.log(`Found ${models.length} models to process.`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const model of models) {
            try {
                if (!model.brand) {
                    console.log(`Skipping model ${model._id}: No brand assigned.`);
                    skippedCount++;
                    continue;
                }

                const brandName = model.brand.name;
                if (!model.name.toLowerCase().startsWith(brandName.toLowerCase())) {
                    const oldName = model.name;
                    model.name = `${brandName} ${model.name}`;
                    await model.save();
                    console.log(`Updated: "${oldName}" -> "${model.name}"`);
                    updatedCount++;
                } else {
                    console.log(`Skipping: "${model.name}" already starts with "${brandName}"`);
                    skippedCount++;
                }
            } catch (err) {
                console.error(`Failed to update model ${model._id}:`, err.message);
                skippedCount++;
            }
        }

        console.log('\nMigration Summary:');
        console.log(`Total Models: ${models.length}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateModelNames();
