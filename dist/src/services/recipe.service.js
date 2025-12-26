import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export class RecipeService {
    /**
     * Add an ingredient to a menu item recipe
     */
    async addIngredient(data) {
        // Validate quantity
        if (data.quantity <= 0) {
            throw new Error('Ingredient quantity must be greater than 0');
        }
        // Check if menu item exists
        const menuItem = await prisma.menu_items.findUnique({
            where: { id: data.menuItemId },
        });
        if (!menuItem) {
            throw new Error(`Menu item ${data.menuItemId} not found`);
        }
        // Check if inventory item exists
        const inventoryItem = await prisma.inventory_items.findUnique({
            where: { id: data.inventoryItemId },
        });
        if (!inventoryItem) {
            throw new Error(`Inventory item ${data.inventoryItemId} not found`);
        }
        // Create or update ingredient
        return prisma.menu_item_ingredients.upsert({
            where: {
                menuItemId_inventoryItemId: {
                    menuItemId: data.menuItemId,
                    inventoryItemId: data.inventoryItemId,
                },
            },
            create: {
                id: `mii_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                menuItemId: data.menuItemId,
                inventoryItemId: data.inventoryItemId,
                quantity: data.quantity,
                updatedAt: new Date(),
            },
            update: {
                quantity: data.quantity,
                updatedAt: new Date(),
            },
            include: {
                menu_item: {
                    select: {
                        name: true,
                        category: true,
                    },
                },
                inventory_item: {
                    select: {
                        name: true,
                        unit: true,
                        currentStock: true,
                    },
                },
            },
        });
    }
    /**
     * Remove an ingredient from a menu item recipe
     */
    async removeIngredient(menuItemId, inventoryItemId) {
        await prisma.menu_item_ingredients.delete({
            where: {
                menuItemId_inventoryItemId: {
                    menuItemId,
                    inventoryItemId,
                },
            },
        });
    }
    /**
     * Get all ingredients for a menu item
     */
    async getRecipe(menuItemId) {
        return prisma.menu_item_ingredients.findMany({
            where: { menuItemId },
            include: {
                inventory_item: {
                    select: {
                        id: true,
                        name: true,
                        unit: true,
                        currentStock: true,
                        minStock: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                inventory_item: {
                    name: 'asc',
                },
            },
        });
    }
    /**
     * Get all menu items that use a specific inventory item
     */
    async getMenuItemsUsingIngredient(inventoryItemId) {
        return prisma.menu_item_ingredients.findMany({
            where: { inventoryItemId },
            include: {
                menu_item: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        available: true,
                    },
                },
            },
            orderBy: {
                menu_item: {
                    name: 'asc',
                },
            },
        });
    }
    /**
     * Check if a menu item can be prepared based on current inventory
     */
    async checkMenuItemAvailability(menuItemId) {
        const ingredients = await prisma.menu_item_ingredients.findMany({
            where: { menuItemId },
            include: {
                inventory_item: true,
            },
        });
        const missingIngredients = [];
        for (const ingredient of ingredients) {
            if (ingredient.inventory_item.currentStock < ingredient.quantity) {
                missingIngredients.push({
                    name: ingredient.inventory_item.name,
                    required: ingredient.quantity,
                    available: ingredient.inventory_item.currentStock,
                    unit: ingredient.inventory_item.unit,
                });
            }
        }
        return {
            available: missingIngredients.length === 0,
            missingIngredients,
        };
    }
    /**
     * Calculate total cost of ingredients for a menu item
     */
    async calculateMenuItemCost(menuItemId) {
        const ingredients = await prisma.menu_item_ingredients.findMany({
            where: { menuItemId },
            include: {
                inventory_item: {
                    select: {
                        costPerUnit: true,
                    },
                },
            },
        });
        return ingredients.reduce((total, ingredient) => {
            return total + ingredient.quantity * ingredient.inventory_item.costPerUnit;
        }, 0);
    }
    /**
     * Bulk update recipe (replace all ingredients)
     */
    async updateRecipe(menuItemId, ingredients) {
        return prisma.$transaction(async (tx) => {
            // Delete existing ingredients
            await tx.menu_item_ingredients.deleteMany({
                where: { menuItemId },
            });
            // Add new ingredients
            const createdIngredients = await Promise.all(ingredients.map((ing) => tx.menu_item_ingredients.create({
                data: {
                    id: `mii_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    menuItemId,
                    inventoryItemId: ing.inventoryItemId,
                    quantity: ing.quantity,
                    updatedAt: new Date(),
                },
                include: {
                    inventory_item: {
                        select: {
                            name: true,
                            unit: true,
                        },
                    },
                },
            })));
            return createdIngredients;
        });
    }
    /**
     * Get menu items with low stock ingredients
     */
    async getMenuItemsWithLowStockIngredients() {
        const menuItemsWithLowStock = await prisma.menu_item_ingredients.findMany({
            where: {
                inventory_item: {
                    OR: [{ status: 'LOW_STOCK' }, { status: 'OUT_OF_STOCK' }],
                },
            },
            include: {
                menu_item: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        available: true,
                    },
                },
                inventory_item: {
                    select: {
                        name: true,
                        currentStock: true,
                        minStock: true,
                        unit: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                menu_item: {
                    name: 'asc',
                },
            },
        });
        // Group by menu item
        const groupedByMenuItem = menuItemsWithLowStock.reduce((acc, item) => {
            const menuItemId = item.menu_item.id;
            if (!acc[menuItemId]) {
                acc[menuItemId] = {
                    menuItem: item.menu_item,
                    lowStockIngredients: [],
                };
            }
            acc[menuItemId].lowStockIngredients.push({
                name: item.inventory_item.name,
                currentStock: item.inventory_item.currentStock,
                minStock: item.inventory_item.minStock,
                unit: item.inventory_item.unit,
                status: item.inventory_item.status,
            });
            return acc;
        }, {});
        return Object.values(groupedByMenuItem);
    }
}
export const recipeService = new RecipeService();
