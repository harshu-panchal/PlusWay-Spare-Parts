import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

        console.log(`\n--- RECENT ORDERS (${orders.length}) ---`);
        if (orders.length === 0) {
            console.log("No orders found in database.");
        } else {
            orders.forEach(order => {
                console.log(`Order ID: ${order._id}`);
                console.log(`User ID: ${order.customer}`);
                console.log(`Total Price: ${order.totalPrice}`);
                console.log(`Created At: ${order.createdAt}`);
                console.log(`Is Paid: ${order.isPaid}`);
                console.log('-------------------------');
            });
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrders();
