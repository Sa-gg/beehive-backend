import { SettingsDTO } from '../types/settings.types.js';

// Simple in-memory storage for settings
// In production, you might want to store this in database
class SettingsRepository {
  private settings: SettingsDTO = {
    openTime: '08:00',
    closeTime: '22:00',
    lastResetDate: null
  };
  
  // Flag to force reset on next order
  private forceResetFlag: boolean = false;

  getAllSettings(): SettingsDTO {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<SettingsDTO>): void {
    this.settings = { ...this.settings, ...settings };
  }

  getLastResetDate(): string | null {
    return this.settings.lastResetDate;
  }

  setLastResetDate(date: string): void {
    this.settings.lastResetDate = date;
  }

  getOpenTime(): string {
    return this.settings.openTime;
  }

  getCloseTime(): string {
    return this.settings.closeTime;
  }

  getForceResetFlag(): boolean {
    return this.forceResetFlag;
  }

  setForceResetFlag(value: boolean): void {
    this.forceResetFlag = value;
  }
}

export { SettingsRepository };
