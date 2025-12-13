import { MenuItemRepository } from '../repositories/menuItem.repository.js';
import { CreateMenuItemDTO, UpdateMenuItemDTO, MenuItemFilters, MenuItemResponse } from '../types/menuItem.types.js';

export class MenuItemService {
  private repository: MenuItemRepository;

  constructor(repository: MenuItemRepository) {
    this.repository = repository;
  }

  async getAllMenuItems(filters?: MenuItemFilters): Promise<MenuItemResponse[]> {
    const items = await this.repository.findAll(filters);
    return items.map(item => this.mapToResponse(item));
  }

  async getMenuItemById(id: string): Promise<MenuItemResponse | null> {
    const item = await this.repository.findById(id);
    return item ? this.mapToResponse(item) : null;
  }

  async createMenuItem(data: CreateMenuItemDTO): Promise<MenuItemResponse> {
    // Validate required fields
    if (!data.name || !data.category || data.price === undefined) {
      throw new Error('Name, category, and price are required');
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

  async updateMenuItem(id: string, data: UpdateMenuItemDTO): Promise<MenuItemResponse> {
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

  async deleteMenuItem(id: string): Promise<void> {
    const existingItem = await this.repository.findById(id);
    if (!existingItem) {
      throw new Error('Menu item not found');
    }

    await this.repository.delete(id);
  }

  async toggleAvailability(id: string): Promise<MenuItemResponse> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error('Menu item not found');
    }

    const updatedItem = await this.repository.update(id, { 
      available: !item.available 
    });

    return this.mapToResponse(updatedItem);
  }

  async toggleFeatured(id: string): Promise<MenuItemResponse> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error('Menu item not found');
    }

    const updatedItem = await this.repository.update(id, { 
      featured: !item.featured 
    });

    return this.mapToResponse(updatedItem);
  }

  async bulkUpdateAvailability(ids: string[], available: boolean): Promise<{ count: number }> {
    const result = await this.repository.bulkUpdateAvailability(ids, available);
    return { count: result.count };
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItemResponse[]> {
    const items = await this.repository.getByCategory(category);
    return items.map(item => this.mapToResponse(item));
  }

  async getFeaturedMenuItems(): Promise<MenuItemResponse[]> {
    const items = await this.repository.getFeaturedItems();
    return items.map(item => this.mapToResponse(item));
  }

  async searchMenuItems(searchTerm: string): Promise<MenuItemResponse[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const items = await this.repository.searchByName(searchTerm);
    return items.map(item => this.mapToResponse(item));
  }

  async getMenuItemsStats() {
    const [
      totalItems,
      availableItems,
      unavailableItems,
      featuredItems
    ] = await Promise.all([
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

  private mapToResponse(item: any): MenuItemResponse {
    return {
      id: item.id,
      name: item.name,
      category: item.category,
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
