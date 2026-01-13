import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Table, MenuItem } from '../models/index.js';
import { generateTableQRCode } from '../services/index.js';

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        await Promise.all([User.deleteMany({}), Table.deleteMany({}), MenuItem.deleteMany({})]);
        console.log('🗑️ Cleared existing data');

        await User.create({ email: 'admin@servex.com', password: 'admin123', name: 'Admin User', role: 'admin' });
        console.log('👤 Created admin user: admin@servex.com');

        await User.create({ email: 'kitchen@servex.com', password: 'kitchen123', name: 'Kitchen Staff', role: 'kitchen' });
        console.log('👨‍🍳 Created kitchen user: kitchen@servex.com');

        for (let i = 1; i <= 8; i++) {
            const table = await Table.create({ tableNumber: i, capacity: i <= 4 ? 4 : 6, qrCodeUrl: '', qrCodeData: '' });
            const { url, data } = await generateTableQRCode(table._id.toString());
            table.qrCodeUrl = url;
            table.qrCodeData = data;
            await table.save();
        }
        console.log('🪑 Created 8 tables with QR codes');

        const menuItems = [
            { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', category: 'Main Course', price: 350, tags: ['bestseller', 'nonveg'] },
            { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', category: 'Starters', price: 280, tags: ['veg', 'bestseller'] },
            { name: 'Dal Makhani', description: 'Black lentils cooked in cream', category: 'Main Course', price: 220, tags: ['veg'] },
            { name: 'Biryani', description: 'Aromatic rice with spices and meat', category: 'Main Course', price: 320, tags: ['nonveg', 'bestseller'] },
            { name: 'Naan', description: 'Soft leavened bread', category: 'Breads', price: 50, tags: ['veg'] },
            { name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', category: 'Desserts', price: 120, tags: ['veg'] },
            { name: 'Masala Dosa', description: 'Crispy crepe with potato filling', category: 'South Indian', price: 180, tags: ['veg'] },
            { name: 'Mango Lassi', description: 'Sweet mango yogurt drink', category: 'Beverages', price: 90, tags: ['veg'] },
            { name: 'Samosa', description: 'Crispy fried pastry with potato', category: 'Starters', price: 60, tags: ['veg'] },
            { name: 'Tandoori Chicken', description: 'Spiced chicken roasted in clay oven', category: 'Starters', price: 320, tags: ['nonveg'] },
            { name: 'Palak Paneer', description: 'Spinach curry with cottage cheese', category: 'Main Course', price: 260, tags: ['veg'] },
            { name: 'Fish Curry', description: 'Coastal style fish in coconut gravy', category: 'Main Course', price: 380, tags: ['nonveg'] },
            { name: 'Raita', description: 'Yogurt with cucumber and spices', category: 'Accompaniments', price: 60, tags: ['veg'] },
            { name: 'Kulfi', description: 'Traditional Indian ice cream', category: 'Desserts', price: 100, tags: ['veg'] },
            { name: 'Chai', description: 'Indian spiced tea', category: 'Beverages', price: 40, tags: ['veg'] },
            { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', category: 'Beverages', price: 120, tags: ['veg'] },
            { name: 'Garlic Naan', description: 'Naan with garlic butter', category: 'Breads', price: 70, tags: ['veg'] },
            { name: 'Chicken Tikka', description: 'Grilled spiced chicken pieces', category: 'Starters', price: 300, tags: ['nonveg'] },
            { name: 'Veg Biryani', description: 'Aromatic rice with vegetables', category: 'Main Course', price: 250, tags: ['veg'] },
            { name: 'Rasmalai', description: 'Cottage cheese in sweet milk', category: 'Desserts', price: 140, tags: ['veg'] },
        ];
        await MenuItem.insertMany(menuItems);
        console.log('🍽️ Created 20 menu items');

        console.log(`
✅ Seed completed successfully!
================================
Admin: admin@servex.com / admin123
Kitchen: kitchen@servex.com / kitchen123
Tables: 1-8 created with QR codes
================================`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
