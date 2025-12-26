import { Router } from 'express';
export function createOrderRoutes(orderController) {
    const router = Router();
    // Get all orders (optionally filtered by status)
    router.get('/', (req, res) => orderController.getAllOrders(req, res));
    // Get order by ID
    router.get('/:id', (req, res) => orderController.getOrderById(req, res));
    // Create new order
    router.post('/', (req, res) => orderController.createOrder(req, res));
    // Update order
    router.put('/:id', (req, res) => orderController.updateOrder(req, res));
    // Delete order
    router.delete('/:id', (req, res) => orderController.deleteOrder(req, res));
    // Update order status
    router.patch('/:id/status', (req, res) => orderController.updateOrderStatus(req, res));
    // Mark order as paid
    router.patch('/:id/payment', (req, res) => orderController.markOrderAsPaid(req, res));
    return router;
}
