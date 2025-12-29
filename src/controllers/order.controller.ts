import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import type { CreateOrderDTO, UpdateOrderDTO } from '../types/order.types.js';
import { orderEventEmitter } from '../utils/eventEmitter.js';

export class OrderController {
  constructor(private orderService: OrderService) {}

  async getAllOrders(req: Request, res: Response) {
    try {
      const { status, deviceId, limit } = req.query;
      let orders;
      
      // If deviceId is provided, get orders for that device (guest tracking)
      if (deviceId && typeof deviceId === 'string') {
        const limitNum = limit ? parseInt(limit as string, 10) : 20;
        orders = await this.orderService.getOrdersByDeviceId(deviceId, limitNum);
      } else if (status && typeof status === 'string') {
        orders = await this.orderService.getOrdersByStatus(status);
      } else {
        orders = await this.orderService.getAllOrders();
      }
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getOrderByOrderNumber(req: Request, res: Response) {
    try {
      const order = await this.orderService.getOrderByOrderNumber(req.params.orderNumber);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const orderData: CreateOrderDTO = req.body;
      
      // If order is created by a logged-in staff member (POS), set createdBy to their name
      // If no deviceId (POS order) and no createdBy specified, use the logged-in user's name
      if (!orderData.deviceId && !orderData.createdBy && (req as any).user?.name) {
        orderData.createdBy = (req as any).user.name;
      }
      
      const order = await this.orderService.createOrder(orderData);
      
      // Emit real-time event for new order
      orderEventEmitter.broadcastNewOrder(order);
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const updateData: UpdateOrderDTO = req.body;
      const order = await this.orderService.updateOrder(req.params.id, updateData);
      
      // Emit real-time event for order update
      orderEventEmitter.broadcastOrderUpdate(order);
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      await this.orderService.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      // Get the user NAME from the authenticated request (set by auth middleware)
      // processedBy should be the name of the cashier/manager who completed the order
      const processedBy = (req as any).user?.name || null;
      const order = await this.orderService.updateOrderStatus(req.params.id, status, processedBy);
      
      // Emit real-time event for status update
      orderEventEmitter.broadcastOrderUpdate(order);
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markOrderAsPaid(req: Request, res: Response) {
    try {
      const { paymentMethod } = req.body;
      const order = await this.orderService.markOrderAsPaid(req.params.id, paymentMethod);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLinkedOrders(req: Request, res: Response) {
    try {
      const orders = await this.orderService.getLinkedOrders(req.params.id);
      res.json(orders);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async mergeOrders(req: Request, res: Response) {
    try {
      const { orderIds } = req.body;
      if (!orderIds || !Array.isArray(orderIds)) {
        return res.status(400).json({ error: 'orderIds array is required' });
      }
      const mergedData = await this.orderService.mergeOrders(orderIds);
      res.json({ success: true, data: mergedData });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markMergedOrdersAsPaid(req: Request, res: Response) {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
