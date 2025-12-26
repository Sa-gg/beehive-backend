import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export class StockTransactionService {
    /**
     * Stock-In: Add inventory to stock
     * - Creates IN transaction
     * - Increases currentStock
     * - Warns if exceeding maxStock
     * - Updates lastRestocked date
     */
    async stockIn(params) {
        const { inventoryItemId, quantity, reason = 'PURCHASE', referenceId, userId, notes } = params;
        // Validate quantity
        if (quantity <= 0) {
            throw new Error('Stock-in quantity must be greater than 0');
        }
        // Use Prisma transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Get current inventory item
            const inventoryItem = await tx.inventory_items.findUnique({
                where: { id: inventoryItemId },
            });
            if (!inventoryItem) {
                throw new Error(`Inventory item ${inventoryItemId} not found`);
            }
            // Calculate new stock
            const newStock = inventoryItem.currentStock + quantity;
            let warning;
            // Check if exceeding max stock
            if (newStock > inventoryItem.maxStock) {
                warning = `Warning: New stock (${newStock} ${inventoryItem.unit}) exceeds maximum stock (${inventoryItem.maxStock} ${inventoryItem.unit})`;
            }
            // Create stock transaction
            const transaction = await tx.stock_transactions.create({
                data: {
                    id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    inventoryItemId,
                    type: 'IN',
                    reason,
                    quantity,
                    referenceId,
                    userId,
                    notes: warning ? (notes ? `${notes}\n${warning}` : warning) : notes,
                },
            });
            // Determine new status based on stock levels
            let newStatus = 'IN_STOCK';
            if (newStock <= 0) {
                newStatus = 'OUT_OF_STOCK';
            }
            else if (newStock <= inventoryItem.minStock) {
                newStatus = 'LOW_STOCK';
            }
            // Update inventory item
            const updatedItem = await tx.inventory_items.update({
                where: { id: inventoryItemId },
                data: {
                    currentStock: newStock,
                    status: newStatus,
                    lastRestocked: new Date(),
                    updatedAt: new Date(),
                },
            });
            return { transaction, inventoryItem: updatedItem, warning };
        });
        return result;
    }
    /**
     * Stock-Out: Remove inventory from stock
     * - Creates OUT transaction
     * - Decreases currentStock
     * - Prevents negative stock
     * - Updates inventory status automatically
     */
    async stockOut(params) {
        const { inventoryItemId, quantity, reason, referenceId, userId, notes } = params;
        // Validate quantity
        if (quantity <= 0) {
            throw new Error('Stock-out quantity must be greater than 0');
        }
        // Use Prisma transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Get current inventory item
            const inventoryItem = await tx.inventory_items.findUnique({
                where: { id: inventoryItemId },
            });
            if (!inventoryItem) {
                throw new Error(`Inventory item ${inventoryItemId} not found`);
            }
            // Calculate new stock
            const newStock = inventoryItem.currentStock - quantity;
            // Prevent negative stock
            if (newStock < 0) {
                throw new Error(`Insufficient stock for ${inventoryItem.name}. ` +
                    `Available: ${inventoryItem.currentStock} ${inventoryItem.unit}, ` +
                    `Requested: ${quantity} ${inventoryItem.unit}`);
            }
            // Create stock transaction
            const transaction = await tx.stock_transactions.create({
                data: {
                    id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    inventoryItemId,
                    type: 'OUT',
                    reason,
                    quantity,
                    referenceId,
                    userId,
                    notes,
                },
            });
            // Determine new status based on stock levels
            let newStatus = 'IN_STOCK';
            if (newStock <= 0) {
                newStatus = 'OUT_OF_STOCK';
            }
            else if (newStock <= inventoryItem.minStock) {
                newStatus = 'LOW_STOCK';
            }
            // Update inventory item
            const updatedItem = await tx.inventory_items.update({
                where: { id: inventoryItemId },
                data: {
                    currentStock: newStock,
                    status: newStatus,
                    updatedAt: new Date(),
                },
            });
            return { transaction, inventoryItem: updatedItem };
        });
        return result;
    }
    /**
     * Get transaction history for an inventory item
     */
    async getTransactionHistory(inventoryItemId, limit = 50) {
        return prisma.stock_transactions.findMany({
            where: { inventoryItemId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                inventory_item: {
                    select: {
                        name: true,
                        unit: true,
                    },
                },
            },
        });
    }
    /**
     * Get all transactions with filters
     */
    async getAllTransactions(filters) {
        const { type, reason, startDate, endDate, limit = 100 } = filters || {};
        return prisma.stock_transactions.findMany({
            where: {
                ...(type && { type }),
                ...(reason && { reason }),
                ...(startDate || endDate
                    ? {
                        createdAt: {
                            ...(startDate && { gte: startDate }),
                            ...(endDate && { lte: endDate }),
                        },
                    }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                inventory_item: {
                    select: {
                        name: true,
                        unit: true,
                        category: true,
                    },
                },
            },
        });
    }
    /**
     * Check if a reference ID has already been processed (for idempotency)
     */
    async isReferenceProcessed(referenceId) {
        const count = await prisma.stock_transactions.count({
            where: { referenceId },
        });
        return count > 0;
    }
    /**
     * Adjust stock (for manual corrections)
     * - Calculates difference automatically
     * - Creates ADJUSTMENT transaction
     */
    async adjustStock(params) {
        const { inventoryItemId, newStock, userId, notes } = params;
        if (newStock < 0) {
            throw new Error('Adjusted stock cannot be negative');
        }
        const result = await prisma.$transaction(async (tx) => {
            // Get current inventory item
            const inventoryItem = await tx.inventory_items.findUnique({
                where: { id: inventoryItemId },
            });
            if (!inventoryItem) {
                throw new Error(`Inventory item ${inventoryItemId} not found`);
            }
            // Calculate difference
            const difference = newStock - inventoryItem.currentStock;
            const adjustmentType = difference >= 0 ? 'IN' : 'OUT';
            const adjustmentQuantity = Math.abs(difference);
            // Create adjustment transaction if there's a difference
            let transaction = null;
            if (difference !== 0) {
                transaction = await tx.stock_transactions.create({
                    data: {
                        id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        inventoryItemId,
                        type: adjustmentType,
                        reason: 'ADJUSTMENT',
                        quantity: adjustmentQuantity,
                        userId,
                        notes: notes || `Manual adjustment: ${inventoryItem.currentStock} → ${newStock} ${inventoryItem.unit}`,
                    },
                });
            }
            // Determine new status
            let newStatus = 'IN_STOCK';
            if (newStock <= 0) {
                newStatus = 'OUT_OF_STOCK';
            }
            else if (newStock <= inventoryItem.minStock) {
                newStatus = 'LOW_STOCK';
            }
            // Update inventory item
            const updatedItem = await tx.inventory_items.update({
                where: { id: inventoryItemId },
                data: {
                    currentStock: newStock,
                    status: newStatus,
                    updatedAt: new Date(),
                },
            });
            return { transaction, inventoryItem: updatedItem, difference };
        });
        return result;
    }
}
export const stockTransactionService = new StockTransactionService();
