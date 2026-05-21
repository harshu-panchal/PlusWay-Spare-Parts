import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const migrateOrderStatus = async () => {
  try {
    await connectDB();
    console.log('Migrating order statuses...');

    const result = await Order.updateMany(
      { status: { $exists: false } },
      [
        {
          $set: {
            status: {
              $cond: {
                if: { $eq: ['$isDelivered', true] },
                then: 'Delivered',
                else: 'Pending'
              }
            }
          }
        }
      ]
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} orders.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOrderStatus();
