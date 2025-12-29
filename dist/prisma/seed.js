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
async function main() {
    console.log('Start seeding default users...');
    const defaultPassword = await bcrypt.hash('password123', 10);
    // Create Admin
    const admin = await prisma.users.upsert({
        where: { email: 'admin@beehive.com' },
        update: {},
        create: {
            id: `user-${Date.now()}-admin`,
            email: 'admin@beehive.com',
            password: defaultPassword,
            name: 'Admin User',
            role: 'ADMIN',
            phone: '+1234567800',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('Created admin:', admin.email);
    // Create Manager
    const manager = await prisma.users.upsert({
        where: { email: 'manager@beehive.com' },
        update: {},
        create: {
            id: `user-${Date.now()}-manager`,
            email: 'manager@beehive.com',
            password: defaultPassword,
            name: 'Manager User',
            role: 'MANAGER',
            phone: '+1234567890',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('Created manager:', manager.email);
    // Create Cashier
    const cashier = await prisma.users.upsert({
        where: { email: 'cashier@beehive.com' },
        update: {},
        create: {
            id: `user-${Date.now()}-cashier`,
            email: 'cashier@beehive.com',
            password: defaultPassword,
            name: 'Cashier User',
            role: 'CASHIER',
            phone: '+1234567891',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('Created cashier:', cashier.email);
    // Create Cook
    const cook = await prisma.users.upsert({
        where: { email: 'cook@beehive.com' },
        update: {},
        create: {
            id: `user-${Date.now()}-cook`,
            email: 'cook@beehive.com',
            password: defaultPassword,
            name: 'Cook User',
            role: 'COOK',
            phone: '+1234567892',
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('Created cook:', cook.email);
    // Create Customer
    const customer = await prisma.users.upsert({
        where: { email: 'customer@beehive.com' },
        update: {},
        create: {
            id: `user-${Date.now()}-customer`,
            email: 'customer@beehive.com',
            password: defaultPassword,
            name: 'Customer User',
            role: 'CUSTOMER',
            phone: '+1234567893',
            cardNumber: `BH${Date.now().toString().slice(-8)}`,
            loyaltyPoints: 0,
            isActive: true,
            updatedAt: new Date()
        }
    });
    console.log('Created customer:', customer.email);
    console.log('\n✅ Default users created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Admin: admin@beehive.com / password123');
    console.log('Manager: manager@beehive.com / password123');
    console.log('Cashier: cashier@beehive.com / password123');
    console.log('Cook: cook@beehive.com / password123');
    console.log('Customer: customer@beehive.com / password123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
