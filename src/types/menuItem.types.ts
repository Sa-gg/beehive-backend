import { category } from '../../generated/prisma/client.js';

export interface CreateMenuItemDTO {
  name: string;
  category: category;
  price: number;
  cost?: number;
  image?: string;
  description?: string;
  available?: boolean;
  featured?: boolean;
  prepTime?: number;
  nutrients?: string;
  moodBenefits?: string;
}

export interface UpdateMenuItemDTO {
  name?: string;
  category?: category;
  price?: number;
  cost?: number;
  image?: string;
  description?: string;
  available?: boolean;
  featured?: boolean;
  prepTime?: number;
  nutrients?: string;
  moodBenefits?: string;
}

export interface MenuItemFilters {
  category?: category;
  available?: boolean;
  featured?: boolean;
  search?: string;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number | null;
  image: string | null;
  description: string | null;
  available: boolean;
  featured: boolean;
  prepTime: number | null;
  nutrients: string | null;
  moodBenefits: string | null;
  createdAt: Date;
  updatedAt: Date;
}
