import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

async function clearMoodStats() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL! 
  });
  
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🔄 Clearing moodOrderStats column...\n');

    // Update all menu items to set moodOrderStats to null
    const result = await prisma.menu_items.updateMany({
      data: {
        moodOrderStats: null,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Successfully cleared moodOrderStats for ${result.count} menu items\n`);
    console.log('💡 Fresh tracking will start from the next customer mood selection!');
    
  } catch (error) {
    console.error('❌ Failed to clear moodOrderStats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

clearMoodStats();
