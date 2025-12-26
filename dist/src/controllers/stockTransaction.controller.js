import { stockTransactionService } from '../services/stockTransaction.service.js';
/**
 * Stock-In: Add inventory to stock
 * POST /api/stock-transactions/in
 */
export const stockIn = async (req, res) => {
    try {
        const { inventoryItemId, quantity, reason, referenceId, userId, notes } = req.body;
        if (!inventoryItemId || !quantity) {
            return res.status(400).json({
                success: false,
                error: 'inventoryItemId and quantity are required',
            });
        }
        const result = await stockTransactionService.stockIn({
            inventoryItemId,
            quantity: parseFloat(quantity),
            reason: reason || 'PURCHASE',
            referenceId,
            userId,
            notes,
        });
        res.status(200).json({
            success: true,
            data: result,
            message: result.warning || 'Stock added successfully',
        });
    }
    catch (error) {
        console.error('Stock-in error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to add stock',
        });
    }
};
/**
 * Stock-Out: Remove inventory from stock
 * POST /api/stock-transactions/out
 */
export const stockOut = async (req, res) => {
    try {
        const { inventoryItemId, quantity, reason, referenceId, userId, notes } = req.body;
        if (!inventoryItemId || !quantity || !reason) {
            return res.status(400).json({
                success: false,
                error: 'inventoryItemId, quantity, and reason are required',
            });
        }
        const result = await stockTransactionService.stockOut({
            inventoryItemId,
            quantity: parseFloat(quantity),
            reason,
            referenceId,
            userId,
            notes,
        });
        res.status(200).json({
            success: true,
            data: result,
            message: 'Stock removed successfully',
        });
    }
    catch (error) {
        console.error('Stock-out error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to remove stock',
        });
    }
};
/**
 * Adjust Stock: Manual stock adjustment
 * POST /api/stock-transactions/adjust
 */
export const adjustStock = async (req, res) => {
    try {
        const { inventoryItemId, newStock, userId, notes } = req.body;
        if (!inventoryItemId || newStock === undefined) {
            return res.status(400).json({
                success: false,
                error: 'inventoryItemId and newStock are required',
            });
        }
        const result = await stockTransactionService.adjustStock({
            inventoryItemId,
            newStock: parseFloat(newStock),
            userId,
            notes,
        });
        res.status(200).json({
            success: true,
            data: result,
            message: `Stock adjusted by ${result.difference >= 0 ? '+' : ''}${result.difference}`,
        });
    }
    catch (error) {
        console.error('Stock adjustment error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to adjust stock',
        });
    }
};
/**
 * Get transaction history for an inventory item
 * GET /api/stock-transactions/history/:inventoryItemId
 */
export const getTransactionHistory = async (req, res) => {
    try {
        const { inventoryItemId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const transactions = await stockTransactionService.getTransactionHistory(inventoryItemId, limit);
        res.status(200).json({
            success: true,
            data: transactions,
        });
    }
    catch (error) {
        console.error('Get transaction history error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get transaction history',
        });
    }
};
/**
 * Get all transactions with filters
 * GET /api/stock-transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const { type, reason, startDate, endDate, limit } = req.query;
        const filters = {};
        if (type)
            filters.type = type;
        if (reason)
            filters.reason = reason;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (limit)
            filters.limit = parseInt(limit);
        const transactions = await stockTransactionService.getAllTransactions(filters);
        res.status(200).json({
            success: true,
            data: transactions,
        });
    }
    catch (error) {
        console.error('Get all transactions error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get transactions',
        });
    }
};
