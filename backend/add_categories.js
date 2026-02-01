import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import Category from './src/models/Category.js';
import connectDB from './src/config/db.js';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE_DIR = 'd:\\AppZeto\\plusway spare parts\\Catagory';

const categories = [
    // Repair Tools
    { name: 'Mobile Tool Kits', image: 'icon_tools.JPG' },
    { name: 'Screw Driver', image: 'icon_jackly-6032.jpg' },
    { name: 'Glue', image: 'icon_ET-TOOLS-GLUE-01.JPG' },
    { name: 'Touch Changing Machine', image: 'icon_958-8-LCD-Touch-Screen-Vacuum-Separator-Cellphone-Repair-Machine-220V_600x600.jpg' },
    { name: 'Opening Tool Set', image: 'icon_opening_tool_kit_for_infocus_m810_with_screwdriver_set_by_maxbhi.com_33445.jpg' },

    // Solar & LED
    { name: 'Solar, Lighting & Essentials', image: 'icon_solar-panels-250x250.jpg' },
    { name: 'Street Light Fixtures', image: 'icon_solar-led-street-light-500x500.jpg' },
    { name: 'Solar Panels', image: 'icon_solar-panels.jpg' },
    { name: 'Indoor LED Lighting', image: 'icon_indoor-led-light.jpg' },

    // Spare Parts
    { name: 'Mobile Spare Parts', image: 'icon_s-l300.jpg' },
    { name: 'Display Screen', image: 'icon_lcd_with_touch_screen_for_samsung_galaxy_s7_edge_cdma_black_by_maxbhi.com_62135.jpg' },
    { name: 'Touch Screen', image: 'icon_lcd_with_touch_screen_for_samsung_galaxy_s7_edge_cdma_black_by_maxbhi.com_62135.jpg' },
    { name: 'LCD', image: 'icon_lcd_screen_for_samsung_galaxy_j7_replacement_display_by_maxbhi.com_68069.jpg' },
    { name: 'Housing', image: 'icon_full_body_housing_for_apple_iphone_8_plus_silver_maxbhi_com_62079.jpg' },

    // Accessories
    { name: 'Mobile Accessories', image: 'icon_flip-cover-for-samsung-galaxy-j7-gold-maxbhi-1-1-1.jpg', isAccessory: true },
    { name: 'Battery', image: 'icon_battery_for_lava_iris_x1_by_maxbhi_com_3831.jpg', isAccessory: true },
    { name: 'Cases & Covers', image: 'icon_flip-cover-for-samsung-galaxy-j7-gold-maxbhi-1-1-1.jpg', isAccessory: true },
    { name: 'Protective Films and Glasses', image: 'icon_gorilla-glass-for-samsung-galaxy-s3-i9300-with-tool-kit-maxbhi-1-7-1.jpg', isAccessory: true },
    { name: 'Chargers', image: 'icon_charger-for-letv-le-1s-usb-mobile-phone-wall-charger-maxbhi-5-0-1.jpg', isAccessory: true },
];

const createSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const importCategories = async () => {
    try {
        await connectDB();

        console.log('Connected to database...');

        for (const cat of categories) {
            const slug = createSlug(cat.name);

            // Check if category exists
            let existing = await Category.findOne({ slug });

            let imagePath = existing ? existing.image : '';

            if (cat.image) {
                const sourcePath = path.join(SOURCE_DIR, cat.image);
                if (fs.existsSync(sourcePath)) {
                    // Check if already on cloudinary (simple check)
                    if (existing && existing.image && existing.image.includes('cloudinary')) {
                        console.log(`Category ${cat.name} already has Cloudinary image. Skipping upload.`);
                        imagePath = existing.image;
                    } else {
                        try {
                            console.log(`Uploading ${cat.image} to Cloudinary...`);
                            const result = await cloudinary.v2.uploader.upload(sourcePath, {
                                folder: "plusway_spare_parts/categories",
                                use_filename: true,
                                unique_filename: false,
                            });
                            imagePath = result.secure_url;
                            console.log(`Uploaded: ${imagePath}`);
                        } catch (uploadErr) {
                            console.error(`Cloudinary Upload Failed for ${cat.name}:`, uploadErr.message);
                        }
                    }
                } else {
                    console.warn(`Warning: Source image not found for ${cat.name}: ${sourcePath}`);
                }
            }

            if (existing) {
                existing.image = imagePath;
                if (cat.isAccessory !== undefined) existing.isAccessory = cat.isAccessory;
                await existing.save();
                console.log(`Updated category: ${cat.name}`);
            } else {
                await Category.create({
                    name: cat.name,
                    slug: slug,
                    image: imagePath,
                    isAccessory: cat.isAccessory || false,
                });
                console.log(`Created category: ${cat.name}`);
            }
        }

        console.log('All categories processed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importCategories();
