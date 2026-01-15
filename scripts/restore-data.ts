import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BACKUP_DIR = path.join(__dirname, '../backups/2026-01-10T10-09-09-518Z');

async function restoreData() {
  console.log('Starting data restoration...');
  console.log('Backup directory:', BACKUP_DIR);

  try {
    // Read backup files
    const usersData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'users.json'), 'utf-8'));
    const categoriesData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'categories.json'), 'utf-8'));
    const menuItemsData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'menu_items.json'), 'utf-8'));
    const inventoryItemsData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'inventory_items.json'), 'utf-8'));
    const menuItemIngredientsData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'menu_item_ingredients.json'), 'utf-8'));
    const expensesData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'expenses.json'), 'utf-8'));
    const moodSettingsData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'mood_settings.json'), 'utf-8'));
    const moodOrderStatsData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'mood_order_stats.json'), 'utf-8'));
    const menuItemMoodStatsData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'menu_item_mood_stats.json'), 'utf-8'));
    const moodFeedbackConfigData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'mood_feedback_config.json'), 'utf-8'));

    // 1. Restore Users
    console.log(`\nRestoring ${usersData.length} users...`);
    for (const user of usersData) {
      try {
        await prisma.users.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            phone: user.phone,
            loyaltyPoints: user.loyaltyPoints,
            cardNumber: user.cardNumber,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
          },
          update: {
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            phone: user.phone,
            loyaltyPoints: user.loyaltyPoints,
            cardNumber: user.cardNumber,
            isActive: user.isActive,
            updatedAt: new Date(user.updatedAt),
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
          },
        });
        console.log(`  ✓ User: ${user.email}`);
      } catch (err: any) {
        console.error(`  ✗ User ${user.email}: ${err.message}`);
      }
    }

    // 2. Restore Categories
    console.log(`\nRestoring ${categoriesData.length} categories...`);
    for (const category of categoriesData) {
      try {
        await prisma.categories.upsert({
          where: { id: category.id },
          create: {
            id: category.id,
            name: category.name,
            displayName: category.displayName,
            description: category.description,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
          },
          update: {
            name: category.name,
            displayName: category.displayName,
            description: category.description,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            updatedAt: new Date(category.updatedAt),
          },
        });
        console.log(`  ✓ Category: ${category.displayName}`);
      } catch (err: any) {
        console.error(`  ✗ Category ${category.displayName}: ${err.message}`);
      }
    }

    // 3. Restore Menu Items
    console.log(`\nRestoring ${menuItemsData.length} menu items...`);
    for (const item of menuItemsData) {
      try {
        // Parse moodBenefits if it's a string
        let moodBenefits = null;
        if (item.moodBenefits) {
          try {
            moodBenefits = typeof item.moodBenefits === 'string' 
              ? item.moodBenefits 
              : JSON.stringify(item.moodBenefits);
          } catch {
            moodBenefits = null;
          }
        }

        await prisma.menu_items.upsert({
          where: { id: item.id },
          create: {
            id: item.id,
            name: item.name,
            price: item.price,
            cost: item.cost,
            image: item.image,
            description: item.description,
            available: item.available,
            featured: item.featured,
            prepTime: item.prepTime,
            nutrients: item.nutrients,
            moodBenefits: moodBenefits,
            categoryId: item.categoryId,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          },
          update: {
            name: item.name,
            price: item.price,
            cost: item.cost,
            image: item.image,
            description: item.description,
            available: item.available,
            featured: item.featured,
            prepTime: item.prepTime,
            nutrients: item.nutrients,
            moodBenefits: moodBenefits,
            categoryId: item.categoryId,
            updatedAt: new Date(item.updatedAt),
          },
        });
        console.log(`  ✓ Menu Item: ${item.name}`);
      } catch (err: any) {
        console.error(`  ✗ Menu Item ${item.name}: ${err.message}`);
      }
    }

    // 4. Restore Inventory Items
    console.log(`\nRestoring ${inventoryItemsData.length} inventory items...`);
    for (const item of inventoryItemsData) {
      try {
        await prisma.inventory_items.upsert({
          where: { id: item.id },
          create: {
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
            lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : null,
            restockFrequencyDays: item.restockFrequencyDays,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          },
          update: {
            name: item.name,
            category: item.category,
            currentStock: item.currentStock,
            minStock: item.minStock,
            maxStock: item.maxStock,
            unit: item.unit,
            costPerUnit: item.costPerUnit,
            supplier: item.supplier,
            status: item.status,
            lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : null,
            restockFrequencyDays: item.restockFrequencyDays,
            updatedAt: new Date(item.updatedAt),
          },
        });
        console.log(`  ✓ Inventory Item: ${item.name}`);
      } catch (err: any) {
        console.error(`  ✗ Inventory Item ${item.name}: ${err.message}`);
      }
    }

    // 5. Restore Menu Item Ingredients (recipes)
    console.log(`\nRestoring ${menuItemIngredientsData.length} menu item ingredients...`);
    for (const ingredient of menuItemIngredientsData) {
      try {
        await prisma.menu_item_ingredients.upsert({
          where: { id: ingredient.id },
          create: {
            id: ingredient.id,
            menuItemId: ingredient.menuItemId,
            inventoryItemId: ingredient.inventoryItemId,
            quantity: ingredient.quantity,
            variantId: ingredient.variantId || null,
            createdAt: new Date(ingredient.createdAt),
            updatedAt: new Date(ingredient.updatedAt),
          },
          update: {
            menuItemId: ingredient.menuItemId,
            inventoryItemId: ingredient.inventoryItemId,
            quantity: ingredient.quantity,
            variantId: ingredient.variantId || null,
            updatedAt: new Date(ingredient.updatedAt),
          },
        });
        console.log(`  ✓ Menu Item Ingredient: ${ingredient.id}`);
      } catch (err: any) {
        console.error(`  ✗ Menu Item Ingredient ${ingredient.id}: ${err.message}`);
      }
    }

    // 6. Restore Expenses
    console.log(`\nRestoring ${expensesData.length} expenses...`);
    for (const expense of expensesData) {
      try {
        await prisma.expenses.upsert({
          where: { id: expense.id },
          create: {
            id: expense.id,
            category: expense.category,
            date: new Date(expense.date),
            amount: expense.amount,
            description: expense.description,
            frequency: expense.frequency,
            attachment: expense.attachment,
            createdAt: new Date(expense.createdAt),
            updatedAt: new Date(expense.updatedAt),
          },
          update: {
            category: expense.category,
            date: new Date(expense.date),
            amount: expense.amount,
            description: expense.description,
            frequency: expense.frequency,
            attachment: expense.attachment,
            updatedAt: new Date(expense.updatedAt),
          },
        });
        console.log(`  ✓ Expense: ${expense.id}`);
      } catch (err: any) {
        console.error(`  ✗ Expense ${expense.id}: ${err.message}`);
      }
    }

    // 7. Restore Mood Settings
    console.log(`\nRestoring ${moodSettingsData.length} mood settings...`);
    for (const setting of moodSettingsData) {
      try {
        await prisma.mood_settings.upsert({
          where: { id: setting.id },
          create: {
            id: setting.id,
            mood: setting.mood,
            emoji: setting.emoji,
            label: setting.label,
            color: setting.color,
            description: setting.description,
            supportMessage: setting.supportMessage,
            scientificExplanation: setting.scientificExplanation,
            beneficialNutrients: setting.beneficialNutrients,
            preferredCategories: setting.preferredCategories,
            excludeCategories: setting.excludeCategories,
            preferredCategoryPoints: setting.preferredCategoryPoints,
            isActive: setting.isActive,
            createdAt: new Date(setting.createdAt),
            updatedAt: new Date(setting.updatedAt),
          },
          update: {
            mood: setting.mood,
            emoji: setting.emoji,
            label: setting.label,
            color: setting.color,
            description: setting.description,
            supportMessage: setting.supportMessage,
            scientificExplanation: setting.scientificExplanation,
            beneficialNutrients: setting.beneficialNutrients,
            preferredCategories: setting.preferredCategories,
            excludeCategories: setting.excludeCategories,
            preferredCategoryPoints: setting.preferredCategoryPoints,
            isActive: setting.isActive,
            updatedAt: new Date(setting.updatedAt),
          },
        });
        console.log(`  ✓ Mood Setting: ${setting.mood}`);
      } catch (err: any) {
        console.error(`  ✗ Mood Setting ${setting.mood}: ${err.message}`);
      }
    }

    // 8. Restore Mood Order Stats
    console.log(`\nRestoring ${moodOrderStatsData.length} mood order stats...`);
    for (const stat of moodOrderStatsData) {
      try {
        await prisma.mood_order_stats.upsert({
          where: { id: stat.id },
          create: {
            id: stat.id,
            mood: stat.mood,
            totalShown: stat.totalShown,
            totalOrdered: stat.totalOrdered,
            feedbackCount: stat.feedbackCount,
            moodImproved: stat.moodImproved,
            moodSame: stat.moodSame,
            moodWorse: stat.moodWorse,
            baselineReached: stat.baselineReached,
            createdAt: new Date(stat.createdAt),
            updatedAt: new Date(stat.updatedAt),
          },
          update: {
            mood: stat.mood,
            totalShown: stat.totalShown,
            totalOrdered: stat.totalOrdered,
            feedbackCount: stat.feedbackCount,
            moodImproved: stat.moodImproved,
            moodSame: stat.moodSame,
            moodWorse: stat.moodWorse,
            baselineReached: stat.baselineReached,
            updatedAt: new Date(stat.updatedAt),
          },
        });
        console.log(`  ✓ Mood Order Stat: ${stat.mood}`);
      } catch (err: any) {
        console.error(`  ✗ Mood Order Stat ${stat.mood}: ${err.message}`);
      }
    }

    // 9. Restore Menu Item Mood Stats
    console.log(`\nRestoring ${menuItemMoodStatsData.length} menu item mood stats...`);
    for (const stat of menuItemMoodStatsData) {
      try {
        await prisma.menu_item_mood_stats.upsert({
          where: { id: stat.id },
          create: {
            id: stat.id,
            menuItemId: stat.menuItemId,
            mood: stat.mood,
            timesShown: stat.timesShown,
            timesOrdered: stat.timesOrdered,
            feedbackCount: stat.feedbackCount,
            moodImproved: stat.moodImproved,
            moodSame: stat.moodSame,
            moodWorse: stat.moodWorse,
            createdAt: new Date(stat.createdAt),
            updatedAt: new Date(stat.updatedAt),
          },
          update: {
            menuItemId: stat.menuItemId,
            mood: stat.mood,
            timesShown: stat.timesShown,
            timesOrdered: stat.timesOrdered,
            feedbackCount: stat.feedbackCount,
            moodImproved: stat.moodImproved,
            moodSame: stat.moodSame,
            moodWorse: stat.moodWorse,
            updatedAt: new Date(stat.updatedAt),
          },
        });
        console.log(`  ✓ Menu Item Mood Stat: ${stat.id}`);
      } catch (err: any) {
        console.error(`  ✗ Menu Item Mood Stat ${stat.id}: ${err.message}`);
      }
    }

    // 10. Restore Mood Feedback Config
    console.log(`\nRestoring ${moodFeedbackConfigData.length} mood feedback config...`);
    for (const config of moodFeedbackConfigData) {
      try {
        await prisma.mood_feedback_config.upsert({
          where: { id: config.id },
          create: {
            id: config.id,
            baselineThreshold: config.baselineThreshold,
            feedbackEnabled: config.feedbackEnabled,
            autoEnableFeedback: config.autoEnableFeedback,
            orderRateWeight: config.orderRateWeight,
            feedbackRateWeight: config.feedbackRateWeight,
            moodBenefitsWeight: config.moodBenefitsWeight,
            preferredCategoryWeight: config.preferredCategoryWeight,
            featuredItemWeight: config.featuredItemWeight,
            priceRangeWeight: config.priceRangeWeight,
            historicalDataWeight: config.historicalDataWeight,
            timeOfDayWeight: config.timeOfDayWeight,
            showMoodReflection: config.showMoodReflection,
            reflectionDelayMinutes: config.reflectionDelayMinutes,
            afternoonCategories: config.afternoonCategories,
            afternoonEndHour: config.afternoonEndHour,
            eveningCategories: config.eveningCategories,
            morningCategories: config.morningCategories,
            morningEndHour: config.morningEndHour,
            morningStartHour: config.morningStartHour,
            explorationBonusWeight: config.explorationBonusWeight,
            minimumOrdersThreshold: config.minimumOrdersThreshold,
            excludedCategoryPenalty: config.excludedCategoryPenalty,
            day0PositionShuffle: config.day0PositionShuffle,
            showRankingNumbers: config.showRankingNumbers,
            createdAt: new Date(config.createdAt),
            updatedAt: new Date(config.updatedAt),
          },
          update: {
            baselineThreshold: config.baselineThreshold,
            feedbackEnabled: config.feedbackEnabled,
            autoEnableFeedback: config.autoEnableFeedback,
            orderRateWeight: config.orderRateWeight,
            feedbackRateWeight: config.feedbackRateWeight,
            moodBenefitsWeight: config.moodBenefitsWeight,
            preferredCategoryWeight: config.preferredCategoryWeight,
            featuredItemWeight: config.featuredItemWeight,
            priceRangeWeight: config.priceRangeWeight,
            historicalDataWeight: config.historicalDataWeight,
            timeOfDayWeight: config.timeOfDayWeight,
            showMoodReflection: config.showMoodReflection,
            reflectionDelayMinutes: config.reflectionDelayMinutes,
            afternoonCategories: config.afternoonCategories,
            afternoonEndHour: config.afternoonEndHour,
            eveningCategories: config.eveningCategories,
            morningCategories: config.morningCategories,
            morningEndHour: config.morningEndHour,
            morningStartHour: config.morningStartHour,
            explorationBonusWeight: config.explorationBonusWeight,
            minimumOrdersThreshold: config.minimumOrdersThreshold,
            excludedCategoryPenalty: config.excludedCategoryPenalty,
            day0PositionShuffle: config.day0PositionShuffle,
            showRankingNumbers: config.showRankingNumbers,
            updatedAt: new Date(config.updatedAt),
          },
        });
        console.log(`  ✓ Mood Feedback Config: ${config.id}`);
      } catch (err: any) {
        console.error(`  ✗ Mood Feedback Config ${config.id}: ${err.message}`);
      }
    }

    console.log('\n✅ Data restoration complete!');
    console.log(`  - Users: ${usersData.length}`);
    console.log(`  - Categories: ${categoriesData.length}`);
    console.log(`  - Menu Items: ${menuItemsData.length}`);
    console.log(`  - Inventory Items: ${inventoryItemsData.length}`);
    console.log(`  - Menu Item Ingredients: ${menuItemIngredientsData.length}`);
    console.log(`  - Expenses: ${expensesData.length}`);
    console.log(`  - Mood Settings: ${moodSettingsData.length}`);
    console.log(`  - Mood Order Stats: ${moodOrderStatsData.length}`);
    console.log(`  - Menu Item Mood Stats: ${menuItemMoodStatsData.length}`);
    console.log(`  - Mood Feedback Config: ${moodFeedbackConfigData.length}`);

  } catch (error: any) {
    console.error('Error during restoration:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

restoreData();
