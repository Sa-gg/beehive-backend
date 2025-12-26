export class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    async getAllOrders(req, res) {
        try {
            const { status } = req.query;
            let orders;
            if (status && typeof status === 'string') {
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
    async createOrder(req, res) {
        try {
            const orderData = req.body;
            const order = await this.orderService.createOrder(orderData);
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
            const order = await this.orderService.updateOrderStatus(req.params.id, status);
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
}
