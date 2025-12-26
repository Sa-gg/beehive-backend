import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  // Get all orders (optionally filtered by status)
  router.get('/', (req, res) => orderController.getAllOrders(req, res));

  // Get order by ID
  router.get('/:id', (req, res) => orderController.getOrderById(req, res));

  // Get linked orders
  router.get('/:id/linked', (req, res) => orderController.getLinkedOrders(req, res));

  // Create new order
  router.post('/', (req, res) => orderController.createOrder(req, res));

  // Merge orders for single receipt
  router.post('/merge', (req, res) => orderController.mergeOrders(req, res));

  // Mark merged orders as paid
  router.post('/merge/pay', (req, res) => orderController.markMergedOrdersAsPaid(req, res));

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
