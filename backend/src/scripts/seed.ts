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
            const table = await Table.create({ tableNumber: i, capacity: i <= 4 ? 2 : 4, qrCodeUrl: '', qrCodeData: '' });
            const { url, data } = await generateTableQRCode(table._id.toString());
            table.qrCodeUrl = url;
            table.qrCodeData = data;
            await table.save();
        }
        console.log('🪑 Created 8 tables with QR codes');

        const menuItems = [
            // ☕ Hot Coffee
            { name: 'Espresso', description: 'Rich and bold single shot of pure coffee', category: 'Hot Coffee', price: 120, imageUrl: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', tags: ['bestseller', 'veg'], preparationTime: 5 },
            { name: 'Americano', description: 'Espresso with hot water for smooth flavor', category: 'Hot Coffee', price: 140, imageUrl: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=400', tags: ['veg'], preparationTime: 5 },
            { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', category: 'Hot Coffee', price: 180, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', tags: ['bestseller', 'veg'], preparationTime: 7 },
            { name: 'Latte', description: 'Creamy espresso with steamed milk', category: 'Hot Coffee', price: 190, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', tags: ['veg'], preparationTime: 7 },
            { name: 'Mocha', description: 'Espresso with chocolate and steamed milk', category: 'Hot Coffee', price: 220, imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', tags: ['veg'], preparationTime: 8 },
            { name: 'Flat White', description: 'Velvety micro-foam with double espresso', category: 'Hot Coffee', price: 200, imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400', tags: ['veg'], preparationTime: 7 },
            { name: 'Caramel Macchiato', description: 'Vanilla, milk, espresso, caramel drizzle', category: 'Hot Coffee', price: 240, imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', tags: ['bestseller', 'veg'], preparationTime: 8 },

            // 🧊 Cold Coffee
            { name: 'Iced Americano', description: 'Chilled espresso with cold water', category: 'Cold Coffee', price: 160, imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', tags: ['veg'], preparationTime: 5 },
            { name: 'Iced Latte', description: 'Cold milk with espresso over ice', category: 'Cold Coffee', price: 200, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', tags: ['bestseller', 'veg'], preparationTime: 6 },
            { name: 'Cold Brew', description: 'Slow-steeped for 20 hours, smooth and bold', category: 'Cold Coffee', price: 220, imageUrl: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400', tags: ['veg'], preparationTime: 3 },
            { name: 'Frappuccino', description: 'Blended iced coffee with whipped cream', category: 'Cold Coffee', price: 260, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', tags: ['bestseller', 'veg'], preparationTime: 8 },
            { name: 'Iced Mocha', description: 'Chocolate, espresso, milk over ice', category: 'Cold Coffee', price: 240, imageUrl: 'https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400', tags: ['veg'], preparationTime: 7 },

            // 🍵 Tea & More
            { name: 'English Breakfast Tea', description: 'Classic black tea blend', category: 'Tea', price: 100, imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', tags: ['veg'], preparationTime: 5 },
            { name: 'Green Tea', description: 'Light and refreshing antioxidant-rich tea', category: 'Tea', price: 110, imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400', tags: ['veg'], preparationTime: 5 },
            { name: 'Chai Latte', description: 'Spiced tea with steamed milk', category: 'Tea', price: 160, imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', tags: ['veg'], preparationTime: 7 },
            { name: 'Matcha Latte', description: 'Japanese green tea with creamy milk', category: 'Tea', price: 200, imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', tags: ['veg'], preparationTime: 7 },
            { name: 'Hot Chocolate', description: 'Rich cocoa with steamed milk and cream', category: 'Tea', price: 180, imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400', tags: ['veg'], preparationTime: 6 },

            // 🥐 Pastries & Bakery
            { name: 'Butter Croissant', description: 'Flaky, buttery French pastry', category: 'Bakery', price: 120, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', tags: ['veg', 'bestseller'], preparationTime: 3 },
            { name: 'Chocolate Croissant', description: 'Croissant filled with dark chocolate', category: 'Bakery', price: 150, imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400', tags: ['veg'], preparationTime: 3 },
            { name: 'Blueberry Muffin', description: 'Soft muffin loaded with blueberries', category: 'Bakery', price: 130, imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', tags: ['veg'], preparationTime: 3 },
            { name: 'Chocolate Chip Cookie', description: 'Freshly baked chunky cookie', category: 'Bakery', price: 80, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', tags: ['veg'], preparationTime: 2 },
            { name: 'Cinnamon Roll', description: 'Warm roll with cinnamon and icing', category: 'Bakery', price: 160, imageUrl: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400', tags: ['veg'], preparationTime: 5 },
            { name: 'Banana Bread', description: 'Moist homemade banana bread slice', category: 'Bakery', price: 140, imageUrl: 'https://images.unsplash.com/photo-1605090930509-8cb32c09f1be?w=400', tags: ['veg'], preparationTime: 3 },

            // 🥪 Sandwiches & Snacks
            { name: 'Grilled Cheese Sandwich', description: 'Melted cheddar on toasted sourdough', category: 'Snacks', price: 180, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', tags: ['veg'], preparationTime: 10 },
            { name: 'Chicken Club Sandwich', description: 'Grilled chicken, bacon, lettuce, tomato', category: 'Snacks', price: 280, imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400', tags: ['nonveg', 'bestseller'], preparationTime: 12 },
            { name: 'Avocado Toast', description: 'Smashed avocado on multigrain bread', category: 'Snacks', price: 220, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400', tags: ['veg'], preparationTime: 8 },
            { name: 'Panini Caprese', description: 'Mozzarella, tomato, basil, pesto', category: 'Snacks', price: 240, imageUrl: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400', tags: ['veg'], preparationTime: 10 },
            { name: 'Chicken Wrap', description: 'Grilled chicken with veggies in tortilla', category: 'Snacks', price: 260, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', tags: ['nonveg'], preparationTime: 10 },

            // 🍰 Desserts
            { name: 'New York Cheesecake', description: 'Creamy classic cheesecake slice', category: 'Desserts', price: 220, imageUrl: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400', tags: ['veg', 'bestseller'], preparationTime: 3 },
            { name: 'Chocolate Brownie', description: 'Fudgy brownie with walnuts', category: 'Desserts', price: 160, imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400', tags: ['veg'], preparationTime: 3 },
            { name: 'Tiramisu', description: 'Italian coffee-flavored layered dessert', category: 'Desserts', price: 250, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', tags: ['veg'], preparationTime: 3 },
            { name: 'Red Velvet Cake', description: 'Slice of cream cheese frosted cake', category: 'Desserts', price: 200, imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400', tags: ['veg'], preparationTime: 3 },
        ];

        await MenuItem.insertMany(menuItems);
        console.log(`☕ Created ${menuItems.length} coffee cafe menu items with photos`);

        console.log(`
✅ Seed completed successfully!
================================
☕ ServeX Coffee Cafe
================================
Admin: admin@servex.com / admin123
Kitchen: kitchen@servex.com / kitchen123
Tables: 1-8 created with QR codes
Menu: ${menuItems.length} items with images
================================`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
