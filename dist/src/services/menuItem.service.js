export class MenuItemService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getAllMenuItems(filters) {
        const items = await this.repository.findAll(filters);
        return items.map(item => this.mapToResponse(item));
    }
    async getMenuItemById(id) {
        const item = await this.repository.findById(id);
        return item ? this.mapToResponse(item) : null;
    }
    async createMenuItem(data) {
        // Validate required fields
        if (!data.name || !data.categoryId || data.price === undefined) {
            throw new Error('Name, categoryId, and price are required');
        }
        if (data.price < 0) {
            throw new Error('Price must be a positive number');
        }
        if (data.cost !== undefined && data.cost < 0) {
            throw new Error('Cost must be a positive number');
        }
        if (data.prepTime !== undefined && data.prepTime < 0) {
            throw new Error('Prep time must be a positive number');
        }
        const item = await this.repository.create(data);
        return this.mapToResponse(item);
    }
    async updateMenuItem(id, data) {
        // Check if menu item exists
        const existingItem = await this.repository.findById(id);
        if (!existingItem) {
            throw new Error('Menu item not found');
        }
        // Validate updated fields
        if (data.price !== undefined && data.price < 0) {
            throw new Error('Price must be a positive number');
        }
        if (data.cost !== undefined && data.cost < 0) {
            throw new Error('Cost must be a positive number');
        }
        if (data.prepTime !== undefined && data.prepTime < 0) {
            throw new Error('Prep time must be a positive number');
        }
        const updatedItem = await this.repository.update(id, data);
        return this.mapToResponse(updatedItem);
    }
    async deleteMenuItem(id) {
        const existingItem = await this.repository.findById(id);
        if (!existingItem) {
            throw new Error('Menu item not found');
        }
        await this.repository.delete(id);
    }
    async toggleAvailability(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new Error('Menu item not found');
        }
        const updatedItem = await this.repository.update(id, {
            available: !item.available
        });
        return this.mapToResponse(updatedItem);
    }
    async toggleFeatured(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new Error('Menu item not found');
        }
        const updatedItem = await this.repository.update(id, {
            featured: !item.featured
        });
        return this.mapToResponse(updatedItem);
    }
    async bulkUpdateAvailability(ids, available) {
        const result = await this.repository.bulkUpdateAvailability(ids, available);
        return { count: result.count };
    }
    async getMenuItemsByCategory(categoryId) {
        const items = await this.repository.getByCategory(categoryId);
        return items.map(item => this.mapToResponse(item));
    }
    async getMenuItemsByCategoryName(categoryName) {
        const items = await this.repository.getByCategoryName(categoryName);
        return items.map(item => this.mapToResponse(item));
    }
    async getFeaturedMenuItems() {
        const items = await this.repository.getFeaturedItems();
        return items.map(item => this.mapToResponse(item));
    }
    async searchMenuItems(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return [];
        }
        const items = await this.repository.searchByName(searchTerm);
        return items.map(item => this.mapToResponse(item));
    }
    async getMenuItemsStats() {
        const [totalItems, availableItems, unavailableItems, featuredItems] = await Promise.all([
            this.repository.count(),
            this.repository.count({ available: true }),
            this.repository.count({ available: false }),
            this.repository.count({ featured: true })
        ]);
        return {
            total: totalItems,
            available: availableItems,
            unavailable: unavailableItems,
            featured: featuredItems
        };
    }
    async trackMoodViews(itemIds, mood) {
        // This method has been moved to moodSettings.repository.ts
        // Keeping stub for backwards compatibility
        console.log('trackMoodViews: moved to moodSettings.repository.ts');
    }
    mapToResponse(item) {
        return {
            id: item.id,
            name: item.name,
            categoryId: item.categoryId,
            category: item.category ? {
                id: item.category.id,
                name: item.category.name,
                displayName: item.category.displayName
            } : undefined,
            price: item.price,
            cost: item.cost,
            image: item.image,
            description: item.description,
            available: item.available,
            featured: item.featured,
            prepTime: item.prepTime,
            nutrients: item.nutrients,
            moodBenefits: item.moodBenefits,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        };
    }
}
