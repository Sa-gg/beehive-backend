import { orderEventEmitter } from '../utils/eventEmitter.js';
export class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    async getAllOrders(req, res) {
        try {
            const { status, deviceId, limit } = req.query;
            let orders;
            // If deviceId is provided, get orders for that device (guest tracking)
            if (deviceId && typeof deviceId === 'string') {
                const limitNum = limit ? parseInt(limit, 10) : 20;
                orders = await this.orderService.getOrdersByDeviceId(deviceId, limitNum);
            }
            else if (status && typeof status === 'string') {
                orders = await this.orderService.getOrdersByStatus(status);
            }
            else {
                orders = await this.orderService.getAllOrders();
            }
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getOrderById(req, res) {
        try {
            const order = await this.orderService.getOrderById(req.params.id);
            res.json(order);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async getOrderByOrderNumber(req, res) {
        try {
            const order = await this.orderService.getOrderByOrderNumber(req.params.orderNumber);
            res.json(order);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async createOrder(req, res) {
        try {
            const orderData = req.body;
            // If order is created by a logged-in staff member (POS), set createdBy to their name
            // If no deviceId (POS order) and no createdBy specified, use the logged-in user's name
            if (!orderData.deviceId && !orderData.createdBy && req.user?.name) {
                orderData.createdBy = req.user.name;
            }
            const order = await this.orderService.createOrder(orderData);
            // Emit real-time event for new order
            orderEventEmitter.broadcastNewOrder(order);
            res.status(201).json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateOrder(req, res) {
        try {
            const updateData = req.body;
            const order = await this.orderService.updateOrder(req.params.id, updateData);
            // Emit real-time event for order update
            orderEventEmitter.broadcastOrderUpdate(order);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteOrder(req, res) {
        try {
            await this.orderService.deleteOrder(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            // Get the user NAME from the authenticated request (set by auth middleware)
            // processedBy should be the name of the cashier/manager who completed the order
            const processedBy = req.user?.name || null;
            const order = await this.orderService.updateOrderStatus(req.params.id, status, processedBy);
            // Emit real-time event for status update
            orderEventEmitter.broadcastOrderUpdate(order);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async markOrderAsPaid(req, res) {
        try {
            const { paymentMethod } = req.body;
            const order = await this.orderService.markOrderAsPaid(req.params.id, paymentMethod);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getLinkedOrders(req, res) {
        try {
            const orders = await this.orderService.getLinkedOrders(req.params.id);
            res.json(orders);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async mergeOrders(req, res) {
        try {
            const { orderIds } = req.body;
            if (!orderIds || !Array.isArray(orderIds)) {
                return res.status(400).json({ error: 'orderIds array is required' });
            }
            const mergedData = await this.orderService.mergeOrders(orderIds);
            res.json({ success: true, data: mergedData });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async markMergedOrdersAsPaid(req, res) {
        try {
            const { orderIds, paymentMethod } = req.body;
            if (!orderIds || !Array.isArray(orderIds)) {
                return res.status(400).json({ error: 'orderIds array is required' });
            }
            if (!paymentMethod) {
                return res.status(400).json({ error: 'paymentMethod is required' });
            }
            const orders = await this.orderService.markMergedOrdersAsPaid(orderIds, paymentMethod);
            res.json({ success: true, data: orders });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
