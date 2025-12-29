export interface OrderItemDTO {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'COMPLIMENTARY' | 'WRITTEN_OFF' | 'VOIDED';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerName: string | null;
  tableNumber: string | null;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  status: OrderStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  linkedOrderId: string | null;
  createdBy: string | null;
  processedBy: string | null;
  deviceId: string | null;
  notes: string | null;
  authorizedBy: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  paidAt: string | null;
  order_items: OrderItemDTO[];
}

export interface CreateOrderDTO {
  customerName?: string;
  tableNumber?: string;
  orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  moodContext?: string; // The mood when order was placed
  linkedOrderId?: string; // Link to original order when reordering
  createdBy?: string; // User ID who created the order
  deviceId?: string; // Device ID for guest order tracking
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: string;
}

export interface UpdateOrderDTO {
  customerName?: string;
  tableNumber?: string;
  orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  status?: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  processedBy?: string | null;
  discountAmount?: number;
  notes?: string | null;
  authorizedBy?: string | null;
  paidAt?: string | null;
}
