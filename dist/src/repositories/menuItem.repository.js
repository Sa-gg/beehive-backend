import { randomUUID } from 'crypto';
export class MenuItemRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.category) {
            where.category = filters.category;
        }
        if (filters?.available !== undefined) {
            where.available = filters.available;
        }
        if (filters?.featured !== undefined) {
            where.featured = filters.featured;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        return this.prisma.menu_items.findMany({
            where,
            orderBy: [
                { featured: 'desc' },
                { createdAt: 'desc' }
            ]
        });
    }
    async findById(id) {
        return this.prisma.menu_items.findUnique({
            where: { id }
        });
    }
    async create(data) {
        return this.prisma.menu_items.create({
            data: {
                id: randomUUID(),
                name: data.name,
                category: data.category,
                price: data.price,
                cost: data.cost ?? 0,
                image: data.image,
                description: data.description,
                available: data.available ?? true,
                featured: data.featured ?? false,
                prepTime: data.prepTime ?? 5,
                nutrients: data.nutrients,
                moodBenefits: data.moodBenefits,
                updatedAt: new Date()
            }
        });
    }
    async update(id, data) {
        return this.prisma.menu_items.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async delete(id) {
        return this.prisma.menu_items.delete({
            where: { id }
        });
    }
    async bulkUpdateAvailability(ids, available) {
        return this.prisma.menu_items.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                available,
                updatedAt: new Date()
            }
        });
    }
    async getByCategory(category) {
        return this.prisma.menu_items.findMany({
            where: {
                category: category,
                available: true
            },
            orderBy: { name: 'asc' }
        });
    }
    async getFeaturedItems() {
        return this.prisma.menu_items.findMany({
            where: {
                featured: true,
                available: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async searchByName(searchTerm) {
        return this.prisma.menu_items.findMany({
            where: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            },
            orderBy: { name: 'asc' }
        });
    }
    async count(filters) {
        const where = {};
        if (filters?.category) {
            where.category = filters.category;
        }
        if (filters?.available !== undefined) {
            where.available = filters.available;
        }
        if (filters?.featured !== undefined) {
            where.featured = filters.featured;
        }
        return this.prisma.menu_items.count({ where });
    }
    async incrementMoodViews(itemIds, mood) {
        // Fetch items and update their moodOrderStats
        const items = await this.prisma.menu_items.findMany({
            where: { id: { in: itemIds } }
        });
        const updatePromises = items.map(async (item) => {
            // Parse existing stats or create new
            let stats = {};
            if (item.moodOrderStats) {
                try {
                    stats = JSON.parse(item.moodOrderStats);
                }
                catch (e) {
                    stats = {};
                }
            }
            // Initialize mood stats if doesn't exist
            if (!stats[mood]) {
                stats[mood] = { shown: 0, ordered: 0 };
            }
            // Increment shown count
            stats[mood].shown += 1;
            // Update database
            return this.prisma.menu_items.update({
                where: { id: item.id },
                data: {
                    moodOrderStats: JSON.stringify(stats),
                    updatedAt: new Date()
                }
            });
        });
        await Promise.all(updatePromises);
    }
    async incrementMoodOrders(itemIds, mood) {
        // Fetch items and update their moodOrderStats
        const items = await this.prisma.menu_items.findMany({
            where: { id: { in: itemIds } }
        });
        const updatePromises = items.map(async (item) => {
            // Parse existing stats or create new
            let stats = {};
            if (item.moodOrderStats) {
                try {
                    stats = JSON.parse(item.moodOrderStats);
                }
                catch (e) {
                    stats = {};
                }
            }
            // Initialize mood stats if doesn't exist
            if (!stats[mood]) {
                stats[mood] = { shown: 0, ordered: 0 };
            }
            // Increment ordered count
            stats[mood].ordered += 1;
            // Update database
            return this.prisma.menu_items.update({
                where: { id: item.id },
                data: {
                    moodOrderStats: JSON.stringify(stats),
                    updatedAt: new Date()
                }
            });
        });
        await Promise.all(updatePromises);
    }
}
