export interface SettingsDTO {
  openTime: string; // Format: "HH:MM" (24-hour)
  closeTime: string; // Format: "HH:MM" (24-hour)
  lastResetDate: string | null; // ISO date string of last reset
  managerPin?: string; // 4-digit manager PIN for authorization
  
  // Auto-stock management settings
  autoOutOfStockWhenIngredientsRunOut: boolean; // Auto mark menu items as out of stock when ingredients are depleted
  autoMarkInStockWhenAvailable: boolean; // Auto mark menu items as in-stock when ingredients become available
}
