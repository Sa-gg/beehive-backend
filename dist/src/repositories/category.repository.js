import { randomUUID } from 'crypto';
export class CategoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.prisma.categories.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { menu_items: true }
                }
            }
        });
    }
    async findById(id) {
        return this.prisma.categories.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { menu_items: true }
                }
            }
        });
    }
    async findByName(name) {
        return this.prisma.categories.findUnique({
            where: { name }
        });
    }
    async create(data) {
        // Get the max sort order to place new category at the end
        const maxSortOrder = await this.prisma.categories.aggregate({
            _max: { sortOrder: true }
        });
        const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;
        return this.prisma.categories.create({
            data: {
                id: `cat-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomUUID().slice(0, 8)}`,
                name: data.name.toUpperCase().replace(/\s+/g, '_'),
                displayName: data.displayName,
                description: data.description,
                sortOrder: data.sortOrder ?? nextSortOrder,
                isActive: data.isActive ?? true,
                updatedAt: new Date()
            },
            include: {
                _count: {
                    select: { menu_items: true }
                }
            }
        });
    }
    async update(id, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        // If name is being updated, also update it to uppercase with underscores
        if (data.name) {
            updateData.name = data.name.toUpperCase().replace(/\s+/g, '_');
        }
        return this.prisma.categories.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: { menu_items: true }
                }
            }
        });
    }
    async delete(id) {
        // Check if any menu items are using this category
        const menuItemCount = await this.prisma.menu_items.count({
            where: { categoryId: id }
        });
        if (menuItemCount > 0) {
            throw new Error(`Cannot delete category: ${menuItemCount} menu items are using this category. Please reassign them first.`);
        }
        return this.prisma.categories.delete({
            where: { id }
        });
    }
    async softDelete(id) {
        return this.prisma.categories.update({
            where: { id },
            data: {
                isActive: false,
                updatedAt: new Date()
            }
        });
    }
    async reorder(categoryIds) {
        // Update sort order for each category based on the new order
        const updates = categoryIds.map((id, index) => this.prisma.categories.update({
            where: { id },
            data: {
                sortOrder: index,
                updatedAt: new Date()
            }
        }));
        return this.prisma.$transaction(updates);
    }
    async getWithMenuItems(id) {
        return this.prisma.categories.findUnique({
            where: { id },
            include: {
                menu_items: {
                    orderBy: { name: 'asc' }
                }
            }
        });
    }
    async count(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.prisma.categories.count({ where });
    }
}
