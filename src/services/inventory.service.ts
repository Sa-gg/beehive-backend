import { InventoryRepository } from '../repositories/inventory.repository.js';
import { CreateInventoryItemDTO, UpdateInventoryItemDTO, InventoryFilters, InventoryResponse } from '../types/inventory.types.js';

export class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor(inventoryRepository: InventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async getAllItems(filters?: InventoryFilters): Promise<InventoryResponse[]> {
    const items = await this.inventoryRepository.findAll(filters);
    return items.map(item => ({
      ...item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastRestocked: item.lastRestocked || null
    }));
  }

  async getItemById(id: string): Promise<InventoryResponse | null> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) return null;

    return {
      ...item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastRestocked: item.lastRestocked || null
    };
  }

  async createItem(data: CreateInventoryItemDTO): Promise<InventoryResponse> {
    // Validation
    if (data.currentStock < 0) {
      throw new Error('Current stock cannot be negative');
    }
    if (data.minStock < 0) {
      throw new Error('Minimum stock cannot be negative');
    }
    if (data.maxStock <= data.minStock) {
      throw new Error('Maximum stock must be greater than minimum stock');
    }
    if (data.costPerUnit < 0) {
      throw new Error('Cost per unit cannot be negative');
    }

    const item = await this.inventoryRepository.create(data);
    return {
      ...item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastRestocked: item.lastRestocked || null
    };
  }

  async updateItem(id: string, data: UpdateInventoryItemDTO): Promise<InventoryResponse> {
    // Validation
    if (data.currentStock !== undefined && data.currentStock < 0) {
      throw new Error('Current stock cannot be negative');
    }
    if (data.minStock !== undefined && data.minStock < 0) {
      throw new Error('Minimum stock cannot be negative');
    }
    if (data.maxStock !== undefined && data.minStock !== undefined && data.maxStock <= data.minStock) {
      throw new Error('Maximum stock must be greater than minimum stock');
    }
    if (data.costPerUnit !== undefined && data.costPerUnit < 0) {
      throw new Error('Cost per unit cannot be negative');
    }

    const item = await this.inventoryRepository.update(id, data);
    return {
      ...item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastRestocked: item.lastRestocked || null
    };
  }

  async deleteItem(id: string): Promise<void> {
    await this.inventoryRepository.delete(id);
  }

  async updateStock(id: string, newStock: number): Promise<InventoryResponse> {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const item = await this.inventoryRepository.updateStock(id, newStock);
    return {
      ...item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastRestocked: item.lastRestocked || null
    };
  }

  async getStats() {
    return this.inventoryRepository.getStats();
  }
}
