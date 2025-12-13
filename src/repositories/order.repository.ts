import { PrismaClient } from '../../generated/prisma/client.js';
import type { CreateOrderDTO, UpdateOrderDTO } from '../types/order.types.js';

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.orders.findMany({
      include: {
        order_items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: true
      }
    });
  }

  async create(data: CreateOrderDTO) {
    // Generate order number
    const orderCount = await this.prisma.orders.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.12; // 12% VAT
    const totalAmount = subtotal + tax;

    return this.prisma.orders.create({
      data: {
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        orderNumber,
        customerName: data.customerName || null,
        tableNumber: data.tableNumber || null,
        orderType: data.orderType || 'DINE_IN',
        subtotal,
        tax,
        totalAmount,
        paymentMethod: data.paymentMethod || null,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        updatedAt: new Date(),
        order_items: {
          create: data.items.map(item => ({
            id: `orderItem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            updatedAt: new Date()
          }))
        }
      },
      include: {
        order_items: true
      }
    });
  }

  async update(id: string, data: UpdateOrderDTO) {
    const updateData: any = { updatedAt: new Date() };
    
    if (data.customerName !== undefined) updateData.customerName = data.customerName;
    if (data.tableNumber !== undefined) updateData.tableNumber = data.tableNumber;
    if (data.orderType !== undefined) updateData.orderType = data.orderType;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;

    return this.prisma.orders.update({
      where: { id },
      data: updateData,
      include: {
        order_items: true
      }
    });
  }

  async delete(id: string) {
    return this.prisma.orders.delete({
      where: { id }
    });
  }

  async findByStatus(status: string) {
    return this.prisma.orders.findMany({
      where: { status: status as any },
      include: {
        order_items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
