import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function seedUsers() {
    console.log('\n🔐 Seeding users...');
    const defaultPassword = await bcrypt.hash('password123', 10);
    // Create Admin
    await prisma.users.upsert({
        where: { email: 'admin@beehive.com' },
        update: {},
        create: {
            id: `user-admin-${Date.now()}`,
            email: 'admin@beehive.com',
            password: defaultPassword,
            name: 'Admin User',
            role: 'ADMIN',
            phone: '+1234567800',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('✅ Created admin: admin@beehive.com');
    // Create Manager
    await prisma.users.upsert({
        where: { email: 'manager@beehive.com' },
        update: {},
        create: {
            id: `user-manager-${Date.now()}`,
            email: 'manager@beehive.com',
            password: defaultPassword,
            name: 'Manager User',
            role: 'MANAGER',
            phone: '+1234567890',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('✅ Created manager: manager@beehive.com');
    // Create Cashier
    await prisma.users.upsert({
        where: { email: 'cashier@beehive.com' },
        update: {},
        create: {
            id: `user-cashier-${Date.now()}`,
            email: 'cashier@beehive.com',
            password: defaultPassword,
            name: 'Cashier User',
            role: 'CASHIER',
            phone: '+1234567891',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('✅ Created cashier: cashier@beehive.com');
    // Create Cook
    await prisma.users.upsert({
        where: { email: 'cook@beehive.com' },
        update: {},
        create: {
            id: `user-cook-${Date.now()}`,
            email: 'cook@beehive.com',
            password: defaultPassword,
            name: 'Cook User',
            role: 'COOK',
            phone: '+1234567892',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('✅ Created cook: cook@beehive.com');
    // Create Customer
    await prisma.users.upsert({
        where: { email: 'customer@beehive.com' },
        update: {},
        create: {
            id: `user-customer-${Date.now()}`,
            email: 'customer@beehive.com',
            password: defaultPassword,
            name: 'Customer User',
            role: 'CUSTOMER',
            phone: '+1234567893',
            cardNumber: `BH${Date.now().toString().slice(-8)}`,
            loyaltyPoints: 100,
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('✅ Created customer: customer@beehive.com');
}
async function seedInventory() {
    console.log('\n📦 Seeding inventory items...');
    const inventoryItems = [
        // Dairy & Cheese (INGREDIENTS)
        { name: 'Mozzarella Cheese', category: 'INGREDIENTS', currentStock: 50, minStock: 10, maxStock: 100, unit: 'kg', costPerUnit: 280, supplier: 'Dairy Fresh PH' },
        { name: 'Cheddar Cheese', category: 'INGREDIENTS', currentStock: 30, minStock: 8, maxStock: 60, unit: 'kg', costPerUnit: 320, supplier: 'Dairy Fresh PH' },
        { name: 'Parmesan Cheese', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 450, supplier: 'Dairy Fresh PH' },
        { name: 'Butter', category: 'INGREDIENTS', currentStock: 25, minStock: 8, maxStock: 50, unit: 'kg', costPerUnit: 180, supplier: 'Dairy Fresh PH' },
        { name: 'Fresh Milk', category: 'INGREDIENTS', currentStock: 40, minStock: 15, maxStock: 80, unit: 'L', costPerUnit: 85, supplier: 'Dairy Fresh PH' },
        { name: 'Cream', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'L', costPerUnit: 120, supplier: 'Dairy Fresh PH' },
        // Meat & Protein (INGREDIENTS)
        { name: 'Ground Beef', category: 'INGREDIENTS', currentStock: 40, minStock: 15, maxStock: 80, unit: 'kg', costPerUnit: 350, supplier: 'Meat Masters' },
        { name: 'Bacon', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'kg', costPerUnit: 420, supplier: 'Meat Masters' },
        { name: 'Pepperoni', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 380, supplier: 'Meat Masters' },
        { name: 'Ham', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'kg', costPerUnit: 320, supplier: 'Meat Masters' },
        { name: 'Chicken Breast', category: 'INGREDIENTS', currentStock: 35, minStock: 15, maxStock: 70, unit: 'kg', costPerUnit: 220, supplier: 'Meat Masters' },
        { name: 'Chicken Fillet', category: 'INGREDIENTS', currentStock: 30, minStock: 12, maxStock: 60, unit: 'kg', costPerUnit: 250, supplier: 'Meat Masters' },
        { name: 'Pork Liempo', category: 'INGREDIENTS', currentStock: 40, minStock: 15, maxStock: 80, unit: 'kg', costPerUnit: 280, supplier: 'Meat Masters' },
        { name: 'Pork Sisig Mix', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'kg', costPerUnit: 260, supplier: 'Meat Masters' },
        { name: 'Beef Tapa', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 380, supplier: 'Meat Masters' },
        { name: 'Hungarian Sausage', category: 'INGREDIENTS', currentStock: 30, minStock: 12, maxStock: 60, unit: 'pcs', costPerUnit: 45, supplier: 'Meat Masters' },
        { name: 'Burger Patty', category: 'INGREDIENTS', currentStock: 50, minStock: 20, maxStock: 100, unit: 'pcs', costPerUnit: 35, supplier: 'Meat Masters' },
        { name: 'Lumpia Wrapper', category: 'INGREDIENTS', currentStock: 100, minStock: 40, maxStock: 200, unit: 'pcs', costPerUnit: 2, supplier: 'Meat Masters' },
        { name: 'Lumpia Filling', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 180, supplier: 'Meat Masters' },
        { name: 'Fish Fillet', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'kg', costPerUnit: 280, supplier: 'Seafood Bay' },
        { name: 'Bangus (Milkfish)', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 220, supplier: 'Seafood Bay' },
        { name: 'Chicharon Bulaklak', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 350, supplier: 'Meat Masters' },
        { name: 'Spare Ribs', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 380, supplier: 'Meat Masters' },
        { name: 'Pork BBQ Cut', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'kg', costPerUnit: 260, supplier: 'Meat Masters' },
        // Vegetables & Produce (INGREDIENTS)
        { name: 'Tomatoes', category: 'INGREDIENTS', currentStock: 30, minStock: 10, maxStock: 60, unit: 'kg', costPerUnit: 80, supplier: 'Farm Fresh' },
        { name: 'Onions', category: 'INGREDIENTS', currentStock: 40, minStock: 15, maxStock: 80, unit: 'kg', costPerUnit: 65, supplier: 'Farm Fresh' },
        { name: 'Bell Peppers', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 120, supplier: 'Farm Fresh' },
        { name: 'Mushrooms', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 180, supplier: 'Farm Fresh' },
        { name: 'Spinach', category: 'INGREDIENTS', currentStock: 10, minStock: 4, maxStock: 20, unit: 'kg', costPerUnit: 150, supplier: 'Farm Fresh' },
        { name: 'Lettuce', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 120, supplier: 'Farm Fresh' },
        { name: 'Garlic', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 180, supplier: 'Farm Fresh' },
        { name: 'Ginger', category: 'INGREDIENTS', currentStock: 10, minStock: 4, maxStock: 20, unit: 'kg', costPerUnit: 150, supplier: 'Farm Fresh' },
        { name: 'Pineapple', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 60, supplier: 'Farm Fresh' },
        { name: 'Potatoes', category: 'INGREDIENTS', currentStock: 50, minStock: 20, maxStock: 100, unit: 'kg', costPerUnit: 55, supplier: 'Farm Fresh' },
        { name: 'Calamansi', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 80, supplier: 'Farm Fresh' },
        { name: 'Chili Peppers', category: 'INGREDIENTS', currentStock: 10, minStock: 4, maxStock: 20, unit: 'kg', costPerUnit: 120, supplier: 'Farm Fresh' },
        // Fruits for smoothies (INGREDIENTS)
        { name: 'Strawberries (Frozen)', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'kg', costPerUnit: 280, supplier: 'Fruit Valley' },
        { name: 'Blueberries (Frozen)', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 350, supplier: 'Fruit Valley' },
        { name: 'Bananas', category: 'INGREDIENTS', currentStock: 30, minStock: 10, maxStock: 60, unit: 'kg', costPerUnit: 50, supplier: 'Farm Fresh' },
        // Dry Goods & Staples (INGREDIENTS)
        { name: 'Pizza Dough', category: 'INGREDIENTS', currentStock: 100, minStock: 40, maxStock: 200, unit: 'pcs', costPerUnit: 25, supplier: 'Bakery Supplies PH' },
        { name: 'Flour', category: 'INGREDIENTS', currentStock: 50, minStock: 20, maxStock: 100, unit: 'kg', costPerUnit: 45, supplier: 'Bakery Supplies PH' },
        { name: 'Burger Buns', category: 'INGREDIENTS', currentStock: 80, minStock: 30, maxStock: 160, unit: 'pcs', costPerUnit: 12, supplier: 'Bakery Supplies PH' },
        { name: 'Pancit Canton Noodles', category: 'INGREDIENTS', currentStock: 60, minStock: 25, maxStock: 120, unit: 'packs', costPerUnit: 15, supplier: 'Asian Foods Supply' },
        { name: 'Rice', category: 'INGREDIENTS', currentStock: 100, minStock: 40, maxStock: 200, unit: 'kg', costPerUnit: 55, supplier: 'Grain Traders' },
        { name: 'Nacho Chips', category: 'INGREDIENTS', currentStock: 40, minStock: 15, maxStock: 80, unit: 'packs', costPerUnit: 85, supplier: 'Snack Distributors' },
        { name: 'French Fries (Frozen)', category: 'INGREDIENTS', currentStock: 60, minStock: 25, maxStock: 120, unit: 'kg', costPerUnit: 120, supplier: 'Frozen Foods PH' },
        // Sauces & Condiments (INGREDIENTS)
        { name: 'Pizza Sauce', category: 'INGREDIENTS', currentStock: 30, minStock: 10, maxStock: 60, unit: 'L', costPerUnit: 95, supplier: 'Sauce Masters' },
        { name: 'Ketchup', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'L', costPerUnit: 80, supplier: 'Sauce Masters' },
        { name: 'Mayonnaise', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'L', costPerUnit: 120, supplier: 'Sauce Masters' },
        { name: 'Soy Sauce', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'L', costPerUnit: 65, supplier: 'Sauce Masters' },
        { name: 'Vinegar', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'L', costPerUnit: 45, supplier: 'Sauce Masters' },
        { name: 'Hot Sauce', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'L', costPerUnit: 110, supplier: 'Sauce Masters' },
        { name: 'Chili Garlic Sauce', category: 'INGREDIENTS', currentStock: 15, minStock: 5, maxStock: 30, unit: 'L', costPerUnit: 95, supplier: 'Sauce Masters' },
        { name: 'Cheese Sauce', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'L', costPerUnit: 140, supplier: 'Sauce Masters' },
        { name: 'Caramel Syrup', category: 'BEVERAGES', currentStock: 15, minStock: 5, maxStock: 30, unit: 'L', costPerUnit: 180, supplier: 'Coffee Supplies' },
        { name: 'Chocolate Syrup', category: 'BEVERAGES', currentStock: 15, minStock: 5, maxStock: 30, unit: 'L', costPerUnit: 160, supplier: 'Coffee Supplies' },
        { name: 'Salted Caramel Syrup', category: 'BEVERAGES', currentStock: 10, minStock: 4, maxStock: 20, unit: 'L', costPerUnit: 200, supplier: 'Coffee Supplies' },
        // Beverages & Coffee (BEVERAGES)
        { name: 'Coffee Beans', category: 'BEVERAGES', currentStock: 30, minStock: 10, maxStock: 60, unit: 'kg', costPerUnit: 450, supplier: 'Coffee Traders PH' },
        { name: 'Matcha Powder', category: 'BEVERAGES', currentStock: 10, minStock: 3, maxStock: 20, unit: 'kg', costPerUnit: 850, supplier: 'Tea Suppliers' },
        { name: 'Cocoa Powder', category: 'BEVERAGES', currentStock: 15, minStock: 5, maxStock: 30, unit: 'kg', costPerUnit: 280, supplier: 'Coffee Supplies' },
        { name: 'Sugar', category: 'INGREDIENTS', currentStock: 50, minStock: 20, maxStock: 100, unit: 'kg', costPerUnit: 55, supplier: 'General Supplies' },
        { name: 'Brown Sugar', category: 'INGREDIENTS', currentStock: 25, minStock: 10, maxStock: 50, unit: 'kg', costPerUnit: 65, supplier: 'General Supplies' },
        { name: 'Ice', category: 'SUPPLIES', currentStock: 100, minStock: 40, maxStock: 200, unit: 'kg', costPerUnit: 15, supplier: 'Ice Factory' },
        { name: 'Yogurt', category: 'INGREDIENTS', currentStock: 20, minStock: 8, maxStock: 40, unit: 'L', costPerUnit: 120, supplier: 'Dairy Fresh PH' },
        // Packaging & Supplies (PACKAGING)
        { name: 'Pizza Boxes (Small)', category: 'PACKAGING', currentStock: 200, minStock: 80, maxStock: 400, unit: 'pcs', costPerUnit: 12, supplier: 'Packaging Pro' },
        { name: 'Pizza Boxes (Large)', category: 'PACKAGING', currentStock: 150, minStock: 60, maxStock: 300, unit: 'pcs', costPerUnit: 18, supplier: 'Packaging Pro' },
        { name: 'Paper Cups (Small)', category: 'PACKAGING', currentStock: 500, minStock: 200, maxStock: 1000, unit: 'pcs', costPerUnit: 3, supplier: 'Packaging Pro' },
        { name: 'Paper Cups (Large)', category: 'PACKAGING', currentStock: 400, minStock: 150, maxStock: 800, unit: 'pcs', costPerUnit: 5, supplier: 'Packaging Pro' },
        { name: 'Plastic Cups', category: 'PACKAGING', currentStock: 500, minStock: 200, maxStock: 1000, unit: 'pcs', costPerUnit: 4, supplier: 'Packaging Pro' },
        { name: 'Takeout Containers', category: 'PACKAGING', currentStock: 300, minStock: 120, maxStock: 600, unit: 'pcs', costPerUnit: 8, supplier: 'Packaging Pro' },
        { name: 'Paper Bags', category: 'PACKAGING', currentStock: 400, minStock: 150, maxStock: 800, unit: 'pcs', costPerUnit: 5, supplier: 'Packaging Pro' },
        { name: 'Straws', category: 'SUPPLIES', currentStock: 1000, minStock: 400, maxStock: 2000, unit: 'pcs', costPerUnit: 0.5, supplier: 'Packaging Pro' },
        { name: 'Napkins', category: 'SUPPLIES', currentStock: 2000, minStock: 800, maxStock: 4000, unit: 'pcs', costPerUnit: 0.3, supplier: 'Packaging Pro' },
        { name: 'Plastic Utensils Set', category: 'SUPPLIES', currentStock: 500, minStock: 200, maxStock: 1000, unit: 'sets', costPerUnit: 3, supplier: 'Packaging Pro' },
    ];
    for (const item of inventoryItems) {
        // Check if item exists by name first
        const existing = await prisma.inventory_items.findFirst({
            where: { name: item.name }
        });
        if (existing) {
            await prisma.inventory_items.update({
                where: { id: existing.id },
                data: {
                    currentStock: item.currentStock,
                    costPerUnit: item.costPerUnit,
                    updatedAt: new Date()
                }
            });
        }
        else {
            await prisma.inventory_items.create({
                data: {
                    id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: item.name,
                    category: item.category,
                    currentStock: item.currentStock,
                    minStock: item.minStock,
                    maxStock: item.maxStock,
                    unit: item.unit,
                    costPerUnit: item.costPerUnit,
                    supplier: item.supplier,
                    status: item.currentStock <= item.minStock ? 'LOW_STOCK' : 'IN_STOCK',
                    updatedAt: new Date()
                }
            });
        }
        console.log(`✅ Seeded: ${item.name}`);
    }
}
async function seedMoodSettings() {
    console.log('\n🎭 Seeding mood settings...');
    const moodSettings = [
        { mood: 'HAPPY', emoji: '😊', label: 'Happy', color: '#F9C900', description: 'Celebrate your joy!', preferredCategories: ['PIZZA', 'APPETIZER', 'SMOOTHIE'], preferredCategoryPoints: 10 },
        { mood: 'ENERGETIC', emoji: '⚡', label: 'Energetic', color: '#FF6B35', description: 'Fuel your energy!', preferredCategories: ['HOT_DRINKS', 'COLD_DRINKS', 'SMOOTHIE'], preferredCategoryPoints: 10 },
        { mood: 'RELAXED', emoji: '😌', label: 'Relaxed', color: '#95E1D3', description: 'Keep the good vibes', preferredCategories: ['SMOOTHIE', 'HOT_DRINKS', 'PLATTER'], preferredCategoryPoints: 10 },
        { mood: 'EXCITED', emoji: '🎉', label: 'Excited', color: '#F38181', description: 'Make it extra special!', preferredCategories: ['PIZZA', 'VALUE_MEAL', 'COLD_DRINKS'], preferredCategoryPoints: 10 },
        { mood: 'TIRED', emoji: '😴', label: 'Tired', color: '#AA96DA', description: 'Recharge yourself', preferredCategories: ['HOT_DRINKS', 'SAVERS', 'SMOOTHIE'], preferredCategoryPoints: 10 },
        { mood: 'STRESSED', emoji: '😰', label: 'Stressed', color: '#FCBAD3', description: 'Take a breather', preferredCategories: ['SMOOTHIE', 'HOT_DRINKS', 'APPETIZER'], preferredCategoryPoints: 10 },
        { mood: 'ANXIOUS', emoji: '😟', label: 'Anxious', color: '#A8D8EA', description: 'Find your calm', preferredCategories: ['HOT_DRINKS', 'SAVERS', 'APPETIZER'], excludeCategories: ['COLD_DRINKS'], preferredCategoryPoints: 10 },
        { mood: 'SAD', emoji: '😢', label: 'Sad', color: '#A8DADC', description: 'Let us brighten your day', preferredCategories: ['SMOOTHIE', 'PIZZA', 'VALUE_MEAL'], preferredCategoryPoints: 10 },
        { mood: 'DEPRESSED', emoji: '😔', label: 'Down', color: '#B8B8D1', description: 'We\'re here for you', preferredCategories: ['SMOOTHIE', 'SAVERS', 'APPETIZER'], preferredCategoryPoints: 10 },
        { mood: 'ANGRY', emoji: '😠', label: 'Angry', color: '#E63946', description: 'Cool down with us', preferredCategories: ['COLD_DRINKS', 'SMOOTHIE', 'APPETIZER'], excludeCategories: ['HOT_DRINKS'], preferredCategoryPoints: 10 },
    ];
    for (const setting of moodSettings) {
        await prisma.mood_settings.upsert({
            where: { mood: setting.mood },
            update: {
                emoji: setting.emoji,
                label: setting.label,
                color: setting.color,
                description: setting.description,
                preferredCategories: JSON.stringify(setting.preferredCategories),
                excludeCategories: setting.excludeCategories ? JSON.stringify(setting.excludeCategories) : null,
                preferredCategoryPoints: setting.preferredCategoryPoints,
                updatedAt: new Date()
            },
            create: {
                id: `mood-${setting.mood.toLowerCase()}-${Date.now()}`,
                mood: setting.mood,
                emoji: setting.emoji,
                label: setting.label,
                color: setting.color,
                description: setting.description,
                preferredCategories: JSON.stringify(setting.preferredCategories),
                excludeCategories: setting.excludeCategories ? JSON.stringify(setting.excludeCategories) : null,
                preferredCategoryPoints: setting.preferredCategoryPoints,
                isActive: true,
                updatedAt: new Date()
            }
        });
        console.log(`✅ Seeded mood: ${setting.label}`);
    }
    // Initialize mood order stats
    for (const setting of moodSettings) {
        await prisma.mood_order_stats.upsert({
            where: { mood: setting.mood },
            update: {},
            create: {
                id: `mood-stats-${setting.mood.toLowerCase()}-${Date.now()}`,
                mood: setting.mood,
                totalShown: 0,
                totalOrdered: 0,
                feedbackCount: 0,
                moodImproved: 0,
                moodSame: 0,
                moodWorse: 0,
                baselineReached: false,
                updatedAt: new Date()
            }
        });
    }
    console.log('✅ Initialized mood order stats');
    // Create default feedback config
    await prisma.mood_feedback_config.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            baselineThreshold: 50,
            feedbackEnabled: true,
            autoEnableFeedback: true,
            orderRateWeight: 0.6,
            feedbackRateWeight: 0.4,
            moodBenefitsWeight: 20,
            preferredCategoryWeight: 10,
            featuredItemWeight: 5,
            priceRangeWeight: 5,
            historicalDataWeight: 15,
            timeOfDayWeight: 5,
            showMoodReflection: true,
            reflectionDelayMinutes: 15,
            updatedAt: new Date()
        }
    });
    console.log('✅ Created feedback config');
}
async function seedMenuItems() {
    console.log('\n🍕 Seeding menu items...');
    const menuItems = [
        // PIZZA
        { name: 'Bacon Pepperoni', category: 'PIZZA', price: 299, cost: 120, description: 'Classic bacon and pepperoni pizza with mozzarella', featured: true, prepTime: 15 },
        { name: 'Beef Wagon', category: 'PIZZA', price: 329, cost: 140, description: 'Loaded beef pizza with special sauce', featured: false, prepTime: 15 },
        { name: 'Creamy Spinach', category: 'PIZZA', price: 279, cost: 100, description: 'Healthy spinach pizza with creamy sauce', featured: false, prepTime: 15 },
        { name: 'Ham & Cheese Hawaiian', category: 'PIZZA', price: 289, cost: 110, description: 'Hawaiian style with ham and pineapple', featured: true, prepTime: 15 },
        // APPETIZER
        { name: 'Beef Burger', category: 'APPETIZER', price: 129, cost: 55, description: 'Juicy beef burger with special sauce', featured: true, prepTime: 10 },
        { name: 'Chicken Burger', category: 'APPETIZER', price: 119, cost: 50, description: 'Crispy chicken burger', featured: false, prepTime: 10 },
        { name: 'Burger w/ Fries', category: 'APPETIZER', price: 159, cost: 70, description: 'Burger combo with crispy fries', featured: false, prepTime: 12 },
        { name: 'Cheesy Fries', category: 'APPETIZER', price: 89, cost: 35, description: 'Crispy fries with melted cheese', featured: true, prepTime: 8 },
        { name: 'Chili Fries', category: 'APPETIZER', price: 99, cost: 40, description: 'Fries with spicy chili topping', featured: false, prepTime: 8 },
        { name: 'Meaty Chili Fries', category: 'APPETIZER', price: 129, cost: 55, description: 'Loaded fries with meat and chili', featured: false, prepTime: 10 },
        { name: 'Meaty Fries', category: 'APPETIZER', price: 119, cost: 50, description: 'Fries topped with seasoned meat', featured: false, prepTime: 10 },
        { name: 'Nacho Fries', category: 'APPETIZER', price: 109, cost: 45, description: 'Fries with nacho cheese and toppings', featured: false, prepTime: 8 },
        { name: 'Nachos', category: 'APPETIZER', price: 99, cost: 40, description: 'Classic nachos with cheese and salsa', featured: false, prepTime: 8 },
        { name: 'Lumpia Shanghai', category: 'APPETIZER', price: 79, cost: 30, description: 'Crispy Filipino spring rolls', featured: true, prepTime: 10 },
        { name: 'Pancit Canton Chili Mansi', category: 'APPETIZER', price: 89, cost: 35, description: 'Stir-fried noodles with chili calamansi', featured: false, prepTime: 10 },
        { name: 'Pancit Canton Extra Hot', category: 'APPETIZER', price: 99, cost: 40, description: 'Extra spicy stir-fried noodles', featured: false, prepTime: 10 },
        // HOT_DRINKS
        { name: 'Hot Coffee', category: 'HOT_DRINKS', price: 59, cost: 15, description: 'Freshly brewed hot coffee', featured: true, prepTime: 3 },
        { name: 'Hot Coffee with Milk', category: 'HOT_DRINKS', price: 69, cost: 20, description: 'Hot coffee with creamy milk', featured: false, prepTime: 3 },
        { name: 'Hot Chocolate', category: 'HOT_DRINKS', price: 79, cost: 25, description: 'Rich and creamy hot chocolate', featured: true, prepTime: 3 },
        { name: 'Hot Matcha', category: 'HOT_DRINKS', price: 89, cost: 35, description: 'Premium hot matcha latte', featured: false, prepTime: 4 },
        { name: 'Caramel Macchiato', category: 'HOT_DRINKS', price: 99, cost: 40, description: 'Espresso with vanilla and caramel', featured: true, prepTime: 4 },
        // COLD_DRINKS
        { name: 'Caramel Matcha', category: 'COLD_DRINKS', price: 109, cost: 45, description: 'Iced matcha with caramel drizzle', featured: false, prepTime: 4 },
        { name: 'Dirty Matcha Latte', category: 'COLD_DRINKS', price: 119, cost: 50, description: 'Matcha with espresso shot', featured: true, prepTime: 5 },
        { name: 'Iced Americano', category: 'COLD_DRINKS', price: 79, cost: 25, description: 'Classic iced americano', featured: true, prepTime: 3 },
        { name: 'Iced Caramel Milk', category: 'COLD_DRINKS', price: 89, cost: 30, description: 'Caramel flavored iced milk', featured: false, prepTime: 3 },
        { name: 'Iced Chocolate', category: 'COLD_DRINKS', price: 89, cost: 30, description: 'Refreshing iced chocolate', featured: false, prepTime: 3 },
        { name: 'Iced Coffee', category: 'COLD_DRINKS', price: 69, cost: 20, description: 'Classic iced coffee', featured: true, prepTime: 3 },
        { name: 'Iced Matcha', category: 'COLD_DRINKS', price: 99, cost: 40, description: 'Refreshing iced matcha', featured: false, prepTime: 4 },
        { name: 'Salted Caramel', category: 'COLD_DRINKS', price: 99, cost: 40, description: 'Salted caramel iced latte', featured: true, prepTime: 4 },
        { name: 'Spanish Latte', category: 'COLD_DRINKS', price: 99, cost: 40, description: 'Sweet condensed milk latte', featured: true, prepTime: 4 },
        // SMOOTHIE
        { name: 'Blueberry Smoothie', category: 'SMOOTHIE', price: 129, cost: 55, description: 'Fresh blueberry yogurt smoothie', featured: true, prepTime: 5 },
        { name: 'Strawberry Smoothie', category: 'SMOOTHIE', price: 129, cost: 55, description: 'Fresh strawberry yogurt smoothie', featured: true, prepTime: 5 },
        // PLATTER
        { name: 'Beef Tapa Platter', category: 'PLATTER', price: 189, cost: 80, description: 'Tender beef tapa with rice and egg', featured: true, prepTime: 12 },
        { name: 'Boneless Bangus Platter', category: 'PLATTER', price: 179, cost: 75, description: 'Crispy boneless milkfish with rice', featured: false, prepTime: 12 },
        { name: 'Chicharon Bulaklak Platter', category: 'PLATTER', price: 169, cost: 70, description: 'Crispy pork intestine with rice', featured: false, prepTime: 10 },
        { name: 'Hungarian Platter', category: 'PLATTER', price: 159, cost: 65, description: 'Hungarian sausage with rice and egg', featured: false, prepTime: 10 },
        { name: 'Hungarian w/ Fries Platter', category: 'PLATTER', price: 179, cost: 75, description: 'Hungarian sausage with fries', featured: false, prepTime: 12 },
        { name: 'Pork Sisig Platter', category: 'PLATTER', price: 179, cost: 75, description: 'Sizzling pork sisig with rice', featured: true, prepTime: 12 },
        // VALUE_MEAL
        { name: 'Beef Tapa Meal', category: 'VALUE_MEAL', price: 149, cost: 60, description: 'Budget beef tapa with rice', featured: false, prepTime: 10 },
        { name: 'Burger Steak Meal', category: 'VALUE_MEAL', price: 139, cost: 55, description: 'Burger steak with mushroom gravy', featured: true, prepTime: 10 },
        { name: 'Cheesy Hungarian Meal', category: 'VALUE_MEAL', price: 149, cost: 60, description: 'Cheese-topped hungarian with rice', featured: false, prepTime: 10 },
        { name: 'Chicken Fillet Meal', category: 'VALUE_MEAL', price: 139, cost: 55, description: 'Crispy chicken fillet with rice', featured: true, prepTime: 10 },
        { name: 'Fish Fillet Meal', category: 'VALUE_MEAL', price: 139, cost: 55, description: 'Crispy fish fillet with rice', featured: false, prepTime: 10 },
        { name: 'Fried Liempo Meal', category: 'VALUE_MEAL', price: 149, cost: 60, description: 'Crispy pork belly with rice', featured: false, prepTime: 12 },
        { name: 'Garlic Pepper Beef Meal', category: 'VALUE_MEAL', price: 159, cost: 65, description: 'Garlic beef strips with rice', featured: false, prepTime: 10 },
        { name: 'Grilled Liempo Meal', category: 'VALUE_MEAL', price: 159, cost: 65, description: 'Grilled pork belly with rice', featured: true, prepTime: 15 },
        { name: 'Pork Sisig Meal', category: 'VALUE_MEAL', price: 149, cost: 60, description: 'Sizzling sisig with rice', featured: false, prepTime: 12 },
        // SAVERS
        { name: 'Boneless Bangus Saver', category: 'SAVERS', price: 129, cost: 50, description: 'Budget milkfish with rice', featured: false, prepTime: 10 },
        { name: 'Chicharon Bulaklak Saver', category: 'SAVERS', price: 119, cost: 45, description: 'Budget crispy pork with rice', featured: false, prepTime: 8 },
        { name: 'Hungarian Saver', category: 'SAVERS', price: 109, cost: 40, description: 'Budget hungarian with rice', featured: true, prepTime: 8 },
        { name: 'Pork BBQ Grilled Saver', category: 'SAVERS', price: 119, cost: 45, description: 'Grilled pork BBQ with rice', featured: false, prepTime: 12 },
        { name: 'Spare Ribs Saver', category: 'SAVERS', price: 139, cost: 55, description: 'BBQ spare ribs with rice', featured: true, prepTime: 15 },
    ];
    for (const item of menuItems) {
        // Check if item exists by name first
        const existing = await prisma.menu_items.findFirst({
            where: { name: item.name }
        });
        if (existing) {
            await prisma.menu_items.update({
                where: { id: existing.id },
                data: {
                    price: item.price,
                    cost: item.cost,
                    description: item.description,
                    featured: item.featured,
                    prepTime: item.prepTime,
                    available: true,
                    updatedAt: new Date()
                }
            });
        }
        else {
            await prisma.menu_items.create({
                data: {
                    id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    cost: item.cost,
                    description: item.description,
                    featured: item.featured,
                    prepTime: item.prepTime,
                    available: true,
                    updatedAt: new Date()
                }
            });
        }
        console.log(`✅ Seeded: ${item.name}`);
    }
}
async function main() {
    console.log('🌱 Starting comprehensive database seed...\n');
    console.log('='.repeat(50));
    await seedUsers();
    await seedInventory();
    await seedMoodSettings();
    await seedMenuItems();
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All data seeded successfully!\n');
    console.log('📧 Login credentials:');
    console.log('Admin: admin@beehive.com / password123');
    console.log('Manager: manager@beehive.com / password123');
    console.log('Cashier: cashier@beehive.com / password123');
    console.log('Cook: cook@beehive.com / password123');
    console.log('Customer: customer@beehive.com / password123');
    console.log('\n📦 Inventory: 75+ items seeded');
    console.log('🍕 Menu Items: 52 products seeded');
    console.log('🎭 Mood Settings: 10 moods configured');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
