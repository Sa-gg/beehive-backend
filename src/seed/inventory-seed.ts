import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import { randomUUID } from 'crypto';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const inventoryData = [
  {
    id: randomUUID(),
    name: 'Pizza Dough',
    category: 'INGREDIENTS',
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
    unit: 'kg',
    costPerUnit: 80,
    supplier: 'Manila Flour Co.',
    status: 'IN_STOCK',
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'Mozzarella Cheese',
    category: 'INGREDIENTS',
    currentStock: 15,
    minStock: 20,
    maxStock: 80,
    unit: 'kg',
    costPerUnit: 450,
    supplier: 'Dairy Fresh Supplies',
    status: 'LOW_STOCK',
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'Coffee Beans',
    category: 'BEVERAGES',
    currentStock: 25,
    minStock: 15,
    maxStock: 60,
    unit: 'kg',
    costPerUnit: 650,
    supplier: 'Premium Coffee Traders',
    status: 'IN_STOCK',
    lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'Pepperoni',
    category: 'INGREDIENTS',
    currentStock: 0,
    minStock: 10,
    maxStock: 40,
    unit: 'kg',
    costPerUnit: 380,
    supplier: 'Meat Masters Inc.',
    status: 'OUT_OF_STOCK',
    lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'French Fries',
    category: 'INGREDIENTS',
    currentStock: 30,
    minStock: 25,
    maxStock: 100,
    unit: 'kg',
    costPerUnit: 120,
    supplier: 'Potato Paradise',
    status: 'IN_STOCK',
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'Milk',
    category: 'BEVERAGES',
    currentStock: 18,
    minStock: 20,
    maxStock: 80,
    unit: 'liters',
    costPerUnit: 85,
    supplier: 'Dairy Fresh Supplies',
    status: 'LOW_STOCK',
    lastRestocked: new Date(Date.now() - 4 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'Matcha Powder',
    category: 'BEVERAGES',
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    unit: 'kg',
    costPerUnit: 1200,
    supplier: 'Premium Coffee Traders',
    status: 'IN_STOCK',
    lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60000),
  },
  {
    id: randomUUID(),
    name: 'Beef',
    category: 'INGREDIENTS',
    currentStock: 22,
    minStock: 15,
    maxStock: 50,
    unit: 'kg',
    costPerUnit: 420,
    supplier: 'Meat Masters Inc.',
    status: 'IN_STOCK',
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60000),
  },
];

async function main() {
  console.log('🌱 Seeding inventory data...');
  
  for (const item of inventoryData) {
    // @ts-ignore
    await prisma.inventory_items.create({
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        supplier: item.supplier,
        status: item.status,
        lastRestocked: item.lastRestocked,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`✓ Created: ${item.name}`);
  }
  
  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
