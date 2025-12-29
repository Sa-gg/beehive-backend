export class OrderRepository {
    prisma;
    shouldResetOrderNumbers;
    constructor(prisma, shouldResetOrderNumbers) {
        this.prisma = prisma;
        this.shouldResetOrderNumbers = shouldResetOrderNumbers;
    }
    async findAll() {
        return this.prisma.orders.findMany({
            include: {
                order_items: {
                    include: {
                        menu_items: {
                            select: {
                                name: true,
                                category: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.orders.findUnique({
            where: { id },
            include: {
                order_items: {
                    include: {
                        menu_items: {
                            select: {
                                name: true,
                                category: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });
    }
    async findByOrderNumber(orderNumber) {
        return this.prisma.orders.findUnique({
            where: { orderNumber },
            include: {
                order_items: {
                    include: {
                        menu_items: {
                            select: {
                                name: true,
                                category: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });
    }
    async create(data) {
        // Check if we should reset order numbers (clears the flag but we still need to check DB)
        const shouldReset = this.shouldResetOrderNumbers ? this.shouldResetOrderNumbers() : false;
        // Use date prefix to ensure uniqueness across days: ORD-YYYYMMDD-XXXXX
        const today = new Date();
        const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        let nextOrderNum = 1;
        // Always check for existing orders to avoid unique constraint violations
        const lastOrder = await this.prisma.orders.findFirst({
            where: {
                orderNumber: {
                    startsWith: `ORD-${datePrefix}-`
                }
            },
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true }
        });
        if (lastOrder && lastOrder.orderNumber) {
            // Extract number from "ORD-YYYYMMDD-00001" format
            const match = lastOrder.orderNumber.match(/ORD-\d{8}-(\d+)/);
            if (match) {
                nextOrderNum = parseInt(match[1], 10) + 1;
            }
        }
        const orderNumber = `ORD-${datePrefix}-${String(nextOrderNum).padStart(5, '0')}`;
        // Calculate totals - tax is already included in menu item prices
        const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = 0; // Tax is included in item prices
        const totalAmount = subtotal;
        // Track mood-based orders if mood context is provided
        if (data.moodContext) {
            // Get all menu item IDs from the order
            const menuItemIds = data.items.map(item => item.menuItemId);
            // Import mood settings repository
            const { MoodSettingsRepository } = await import('./moodSettings.repository.js');
            const moodRepo = new MoodSettingsRepository(this.prisma);
            // Increment overall mood order stats (for analytics dashboard)
            await moodRepo.incrementMoodOrdered(data.moodContext.toUpperCase());
            // Increment per-item ordered stats
            await moodRepo.incrementItemsOrdered(menuItemIds, data.moodContext.toUpperCase());
        }
        return this.prisma.orders.create({
            data: {
                id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                orderNumber,
                customerName: data.customerName || null,
                tableNumber: data.tableNumber || null,
                orderType: data.orderType || 'DINE_IN',
                moodContext: data.moodContext || null,
                linkedOrderId: data.linkedOrderId || null,
                // createdBy logic:
                // - If deviceId is present (phone/customer order), set to 'GUEST' for guest customers
                // - If createdBy is provided (e.g., cashier name), use that value
                // - If neither, it's a POS walk-in order (handled by caller)
                createdBy: data.createdBy || (data.deviceId ? 'GUEST' : null),
                deviceId: data.deviceId || null,
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
    async findLinkedOrders(orderId) {
        // Find the order to get its linkedOrderId
        const order = await this.prisma.orders.findUnique({
            where: { id: orderId }
        });
        if (!order)
            return [];
        // If this order has a linkedOrderId, find all orders linked to that ID
        // If not, find all orders that link to this order's ID
        const linkedId = order.linkedOrderId || order.id;
        return this.prisma.orders.findMany({
            where: {
                OR: [
                    { id: linkedId },
                    { linkedOrderId: linkedId }
                ]
            },
            include: {
                order_items: true
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    // Find orders by device ID (for guest order tracking)
    async findByDeviceId(deviceId, limit = 20) {
        return this.prisma.orders.findMany({
            where: { deviceId },
            include: {
                order_items: {
                    include: {
                        menu_items: {
                            select: {
                                name: true,
                                category: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}
