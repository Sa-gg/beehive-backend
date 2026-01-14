export interface CreateMenuItemDTO {
  name: string;
  categoryId: string;
  price: number;
  cost?: number;
  image?: string;
  description?: string;
  available?: boolean;
  featured?: boolean;
  prepTime?: number;
  nutrients?: string;
  moodBenefits?: string;
  itemType?: 'BASE' | 'ADDON' | 'DRINK';  // NEW: defaults to BASE
  showInMenu?: boolean;  // For ADDON items: whether to also show in regular menu
}

export interface UpdateMenuItemDTO {
  name?: string;
  categoryId?: string;
  price?: number;
  cost?: number;
  image?: string;
  description?: string;
  available?: boolean;
  featured?: boolean;
  prepTime?: number;
  nutrients?: string;
  moodBenefits?: string;
  itemType?: 'BASE' | 'ADDON' | 'DRINK';  // NEW
  showInMenu?: boolean;  // For ADDON items: whether to also show in regular menu
}

export interface MenuItemFilters {
  categoryId?: string;
  available?: boolean;
  featured?: boolean;
  search?: string;
  itemType?: 'BASE' | 'ADDON' | 'DRINK';  // NEW: filter by item type
  excludeAddons?: boolean;                 // NEW: exclude ADDON items from results
}

export interface MenuItemResponse {
  id: string;
  name: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    displayName: string;
  };
  price: number;
  cost: number | null;
  image: string | null;
  description: string | null;
  available: boolean;
  featured: boolean;
  prepTime: number | null;
  nutrients: string | null;
  moodBenefits: string | null;
  itemType: 'BASE' | 'ADDON' | 'DRINK';  // NEW
  showInMenu: boolean;  // For ADDON items: whether to also show in regular menu
  createdAt: Date;
  updatedAt: Date;
}
