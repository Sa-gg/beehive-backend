import { PrismaClient } from '../../generated/prisma/client.js';
import { CreateMenuItemDTO, UpdateMenuItemDTO, MenuItemFilters } from '../types/menuItem.types.js';
import { randomUUID } from 'crypto';

export class MenuItemRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(filters?: MenuItemFilters) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
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
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findById(id: string) {
    return this.prisma.menu_items.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });
  }

  async create(data: CreateMenuItemDTO) {
    return this.prisma.menu_items.create({
      data: {
        id: randomUUID(),
        name: data.name,
        categoryId: data.categoryId,
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
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });
  }

  async update(id: string, data: UpdateMenuItemDTO) {
    return this.prisma.menu_items.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    return this.prisma.menu_items.delete({
      where: { id }
    });
  }

  async bulkUpdateAvailability(ids: string[], available: boolean) {
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

  async getByCategory(categoryId: string) {
    return this.prisma.menu_items.findMany({
      where: { 
        categoryId: categoryId,
        available: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getByCategoryName(categoryName: string) {
    return this.prisma.menu_items.findMany({
      where: { 
        category: {
          name: categoryName
        },
        available: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
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
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchByName(searchTerm: string) {
    return this.prisma.menu_items.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async count(filters?: MenuItemFilters) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.available !== undefined) {
      where.available = filters.available;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    return this.prisma.menu_items.count({ where });
  }

  // Note: incrementMoodViews and incrementMoodOrders have been moved to moodSettings.repository.ts
  // They now use the menu_item_mood_stats table for proper relational tracking
}
