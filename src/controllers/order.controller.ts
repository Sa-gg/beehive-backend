import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import type { CreateOrderDTO, UpdateOrderDTO } from '../types/order.types.js';

export class OrderController {
  constructor(private orderService: OrderService) {}

  async getAllOrders(req: Request, res: Response) {
    try {
      const { status } = req.query;
      let orders;
      
      if (status && typeof status === 'string') {
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

  async createOrder(req: Request, res: Response) {
    try {
      const orderData: CreateOrderDTO = req.body;
      const order = await this.orderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const updateData: UpdateOrderDTO = req.body;
      const order = await this.orderService.updateOrder(req.params.id, updateData);
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
      const order = await this.orderService.updateOrderStatus(req.params.id, status);
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
}
