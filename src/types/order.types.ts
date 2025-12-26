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

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerName: string | null;
  tableNumber: string | null;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  linkedOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order_items: OrderItemDTO[];
}

export interface CreateOrderDTO {
  customerName?: string;
  tableNumber?: string;
  orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  moodContext?: string; // The mood when order was placed
  linkedOrderId?: string; // Link to original order when reordering
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
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentMethod?: string;
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
}
