export class OrderRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.orders.findMany({
            include: {
                order_items: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.orders.findUnique({
            where: { id },
            include: {
                order_items: true
            }
        });
    }
    async create(data) {
        // Generate order number
        const orderCount = await this.prisma.orders.count();
        const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;
        // Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.12; // 12% VAT
        const totalAmount = subtotal + tax;
        // Track mood-based orders if mood context is provided
        if (data.moodContext) {
            // Get all menu item IDs from the order
            const menuItemIds = data.items.map(item => item.menuItemId);
            // Increment ordered count for these items with this mood
            const menuItemRepository = require('./menuItem.repository.js');
            const repo = new menuItemRepository.MenuItemRepository(this.prisma);
            await repo.incrementMoodOrders(menuItemIds, data.moodContext);
        }
        return this.prisma.orders.create({
            data: {
                id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                orderNumber,
                customerName: data.customerName || null,
                tableNumber: data.tableNumber || null,
                orderType: data.orderType || 'DINE_IN',
                moodContext: data.moodContext || null,
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
    async update(id, data) {
        const updateData = { updatedAt: new Date() };
        if (data.customerName !== undefined)
            updateData.customerName = data.customerName;
        if (data.tableNumber !== undefined)
            updateData.tableNumber = data.tableNumber;
        if (data.orderType !== undefined)
            updateData.orderType = data.orderType;
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === 'COMPLETED') {
                updateData.completedAt = new Date();
            }
        }
        if (data.paymentMethod !== undefined)
            updateData.paymentMethod = data.paymentMethod;
        if (data.paymentStatus !== undefined)
            updateData.paymentStatus = data.paymentStatus;
        return this.prisma.orders.update({
            where: { id },
            data: updateData,
            include: {
                order_items: true
            }
        });
    }
    async delete(id) {
        return this.prisma.orders.delete({
            where: { id }
        });
    }
    async findByStatus(status) {
        return this.prisma.orders.findMany({
            where: { status: status },
            include: {
                order_items: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
