import { stockTransactionService } from './stockTransaction.service.js';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export class OrderService {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async getAllOrders() {
        return this.orderRepository.findAll();
    }
    async getOrderById(id) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }
    async getOrderByOrderNumber(orderNumber) {
        const order = await this.orderRepository.findByOrderNumber(orderNumber);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }
    async getOrdersByDeviceId(deviceId, limit = 20) {
        return this.orderRepository.findByDeviceId(deviceId, limit);
    }
    async createOrder(data) {
        // Validate items
        if (!data.items || data.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }
        // Validate quantities
        for (const item of data.items) {
            if (item.quantity <= 0) {
                throw new Error('Item quantity must be greater than 0');
            }
        }
        return this.orderRepository.create(data);
    }
    async updateOrder(id, data) {
        // Check if order exists
        await this.getOrderById(id);
        return this.orderRepository.update(id, data);
    }
    async deleteOrder(id) {
        await this.getOrderById(id);
        return this.orderRepository.delete(id);
    }
    async getOrdersByStatus(status) {
        const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid order status');
        }
        return this.orderRepository.findByStatus(status);
    }
    async updateOrderStatus(id, status, processedBy) {
        const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid order status');
        }
        // Get the order to check if status is changing to COMPLETED
        const order = await this.getOrderById(id);
        const isCompletingOrder = status === 'COMPLETED' && order.status !== 'COMPLETED';
        // Prepare update data - set processedBy when order is marked as COMPLETED
        const updateData = { status: status };
        if (isCompletingOrder && processedBy) {
            updateData.processedBy = processedBy;
        }
        // Update the order status
        const updatedOrder = await this.orderRepository.update(id, updateData);
        // If order is being moved to COMPLETED, deduct inventory (permanent deduction)
        if (isCompletingOrder) {
            await this.deductInventoryForCompletedOrder(id);
        }
        return updatedOrder;
    }
    async markOrderAsPaid(id, paymentMethod) {
        return this.orderRepository.update(id, {
            paymentStatus: 'PAID',
            paymentMethod
        });
    }
    async getLinkedOrders(orderId) {
        return this.orderRepository.findLinkedOrders(orderId);
    }
    /**
     * Automatically deduct inventory when an order moves to COMPLETED status
     * Uses menu item recipes to calculate required ingredients
     * Creates stock-out transactions for auditability
     * Ensures idempotency using order ID as reference
     */
    async deductInventoryForCompletedOrder(orderId) {
        // Check if inventory has already been deducted for this order (idempotency)
        const alreadyProcessed = await stockTransactionService.isReferenceProcessed(orderId);
        if (alreadyProcessed) {
            console.log(`Inventory already deducted for order ${orderId}, skipping...`);
            return;
        }
        // Get order with items
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                order_items: {
                    include: {
                        menu_items: true,
                    },
                },
            },
        });
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }
        // Get all menu item IDs from the order
        const menuItemIds = order.order_items.map((item) => item.menuItemId);
        // Get recipes for all menu items in the order
        const recipes = await prisma.menu_item_ingredients.findMany({
            where: {
                menuItemId: { in: menuItemIds },
            },
            include: {
                inventory_item: true,
                menu_item: true,
            },
        });
        // Group recipes by inventory item and calculate total required quantity
        const inventoryRequirements = new Map();
        for (const orderItem of order.order_items) {
            const menuItemRecipes = recipes.filter((recipe) => recipe.menuItemId === orderItem.menuItemId);
            for (const recipe of menuItemRecipes) {
                const key = recipe.inventoryItemId;
                const existingReq = inventoryRequirements.get(key);
                if (existingReq) {
                    existingReq.totalRequired += recipe.quantity * orderItem.quantity;
                }
                else {
                    inventoryRequirements.set(key, {
                        inventoryItemId: recipe.inventoryItemId,
                        inventoryItemName: recipe.inventory_item.name,
                        unit: recipe.inventory_item.unit,
                        totalRequired: recipe.quantity * orderItem.quantity,
                    });
                }
            }
        }
        // Deduct inventory for each required ingredient
        const deductionResults = [];
        for (const [_, requirement] of inventoryRequirements) {
            try {
                await stockTransactionService.stockOut({
                    inventoryItemId: requirement.inventoryItemId,
                    quantity: requirement.totalRequired,
                    reason: 'ORDER',
                    referenceId: orderId,
                    notes: `Auto-deducted for order ${order.orderNumber}`,
                });
                deductionResults.push({
                    success: true,
                    inventoryItem: requirement.inventoryItemName,
                    quantity: requirement.totalRequired,
                });
                console.log(`✓ Deducted ${requirement.totalRequired} ${requirement.unit} of ${requirement.inventoryItemName} for order ${order.orderNumber}`);
            }
            catch (error) {
                deductionResults.push({
                    success: false,
                    inventoryItem: requirement.inventoryItemName,
                    quantity: requirement.totalRequired,
                    error: error.message,
                });
                console.error(`✗ Failed to deduct ${requirement.inventoryItemName}: ${error.message}`);
            }
        }
        // Log summary
        const successCount = deductionResults.filter((r) => r.success).length;
        const failCount = deductionResults.filter((r) => !r.success).length;
        console.log(`Inventory deduction summary for order ${order.orderNumber}: ${successCount} successful, ${failCount} failed`);
        // If some deductions failed, you may want to handle this (e.g., notify admin)
        if (failCount > 0) {
            console.warn(`⚠️ Some inventory deductions failed for order ${order.orderNumber}`);
            // You could create a notification or alert here
        }
    }
    /**
     * Merge multiple orders into a single receipt/payment
     * Useful when customer orders multiple times but pays once
     * Returns merged order data for receipt printing
     */
    async mergeOrders(orderIds) {
        if (orderIds.length < 2) {
            throw new Error('At least 2 orders are required to merge');
        }
        // Fetch all orders
        const orders = await Promise.all(orderIds.map(id => this.getOrderById(id)));
        // Validate all orders can be merged
        for (const order of orders) {
            if (order.status === 'CANCELLED') {
                throw new Error(`Cannot merge cancelled order: ${order.orderNumber}`);
            }
            if (order.paymentStatus === 'PAID') {
                throw new Error(`Cannot merge already paid order: ${order.orderNumber}`);
            }
        }
        // Combine all items
        const allItems = [];
        for (const order of orders) {
            for (const item of order.order_items) {
                const existingItem = allItems.find(i => i.menuItemId === item.menuItemId);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                    existingItem.subtotal += item.subtotal;
                }
                else {
                    allItems.push({
                        menuItemId: item.menuItemId,
                        name: item.menu_items?.name || item.menuItemId,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.subtotal
                    });
                }
            }
        }
        // Calculate totals
        const subtotal = allItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.12;
        const totalAmount = subtotal + tax;
        // Get primary order info (use first order)
        const primaryOrder = orders[0];
        return {
            mergedOrderIds: orderIds,
            orderNumbers: orders.map(o => o.orderNumber),
            customerName: primaryOrder.customerName || orders.find(o => o.customerName)?.customerName,
            tableNumber: primaryOrder.tableNumber || orders.find(o => o.tableNumber)?.tableNumber,
            items: allItems,
            subtotal,
            tax,
            totalAmount,
            orderType: primaryOrder.orderType
        };
    }
    /**
     * Mark multiple orders as paid at once (for merged orders)
     */
    async markMergedOrdersAsPaid(orderIds, paymentMethod) {
        const results = await Promise.all(orderIds.map(id => this.orderRepository.update(id, {
            paymentStatus: 'PAID',
            paymentMethod
        })));
        return results;
    }
}
