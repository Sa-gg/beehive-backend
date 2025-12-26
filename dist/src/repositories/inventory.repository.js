import { randomUUID } from 'crypto';
export class InventoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.category) {
            where.category = filters.category;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { supplier: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        return this.prisma.inventory_items.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.inventory_items.findUnique({
            where: { id }
        });
    }
    async create(data) {
        // Determine status based on stock levels
        let status = 'IN_STOCK';
        if (data.currentStock === 0) {
            status = 'OUT_OF_STOCK';
        }
        else if (data.currentStock <= data.minStock) {
            status = 'LOW_STOCK';
        }
        return this.prisma.inventory_items.create({
            data: {
                id: randomUUID(),
                name: data.name,
                category: data.category,
                currentStock: data.currentStock,
                minStock: data.minStock,
                maxStock: data.maxStock,
                unit: data.unit,
                costPerUnit: data.costPerUnit,
                supplier: data.supplier,
                status,
                updatedAt: new Date()
            }
        });
    }
    async update(id, data) {
        const existingItem = await this.findById(id);
        if (!existingItem) {
            throw new Error('Inventory item not found');
        }
        // Determine new status if stock is being updated
        let status = existingItem.status;
        if (data.currentStock !== undefined) {
            const minStock = data.minStock !== undefined ? data.minStock : existingItem.minStock;
            if (data.currentStock === 0) {
                status = 'OUT_OF_STOCK';
            }
            else if (data.currentStock <= minStock) {
                status = 'LOW_STOCK';
            }
            else {
                status = 'IN_STOCK';
            }
        }
        return this.prisma.inventory_items.update({
            where: { id },
            data: {
                ...data,
                status,
                lastRestocked: data.currentStock !== undefined && data.currentStock > existingItem.currentStock
                    ? new Date()
                    : existingItem.lastRestocked,
                updatedAt: new Date()
            }
        });
    }
    async delete(id) {
        return this.prisma.inventory_items.delete({
            where: { id }
        });
    }
    async updateStock(id, newStock) {
        const item = await this.findById(id);
        if (!item) {
            throw new Error('Inventory item not found');
        }
        let status = 'IN_STOCK';
        if (newStock === 0) {
            status = 'OUT_OF_STOCK';
        }
        else if (newStock <= item.minStock) {
            status = 'LOW_STOCK';
        }
        return this.prisma.inventory_items.update({
            where: { id },
            data: {
                currentStock: newStock,
                status,
                lastRestocked: newStock > item.currentStock ? new Date() : item.lastRestocked,
                updatedAt: new Date()
            }
        });
    }
    async count(filters) {
        const where = {};
        if (filters?.category) {
            where.category = filters.category;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        return this.prisma.inventory_items.count({ where });
    }
    async getStats() {
        const [total, lowStock, outOfStock] = await Promise.all([
            this.count(),
            this.count({ status: 'LOW_STOCK' }),
            this.count({ status: 'OUT_OF_STOCK' })
        ]);
        const allItems = await this.findAll();
        const totalValue = allItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
        return {
            totalItems: total,
            lowStock,
            outOfStock,
            totalValue
        };
    }
}
