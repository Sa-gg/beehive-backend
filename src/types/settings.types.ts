export interface SettingsDTO {
  openTime: string; // Format: "HH:MM" (24-hour)
  closeTime: string; // Format: "HH:MM" (24-hour)
  lastResetDate: string | null; // ISO date string of last reset
  managerPin?: string; // 4-digit manager PIN for authorization
}
