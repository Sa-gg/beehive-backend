import { OrderRepository } from '../repositories/order.repository.js';
import type { CreateOrderDTO, UpdateOrderDTO } from '../types/order.types.js';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async getAllOrders() {
    return this.orderRepository.findAll();
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async createOrder(data: CreateOrderDTO) {
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

  async updateOrder(id: string, data: UpdateOrderDTO) {
    // Check if order exists
    await this.getOrderById(id);
    return this.orderRepository.update(id, data);
  }

  async deleteOrder(id: string) {
    await this.getOrderById(id);
    return this.orderRepository.delete(id);
  }

  async getOrdersByStatus(status: string) {
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }
    return this.orderRepository.findByStatus(status);
  }

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }
    
    return this.orderRepository.update(id, { 
      status: status as any 
    });
  }

  async markOrderAsPaid(id: string, paymentMethod: string) {
    return this.orderRepository.update(id, {
      paymentStatus: 'PAID',
      paymentMethod
    });
  }
}
