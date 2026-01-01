import { SettingsRepository } from '../repositories/settings.repository.js';
import { SettingsDTO } from '../types/settings.types.js';

class SettingsService {
  constructor(private settingsRepository: SettingsRepository) {}

  getSettings(): SettingsDTO {
    return this.settingsRepository.getAllSettings();
  }

  updateSettings(settings: Partial<SettingsDTO>): SettingsDTO {
    this.settingsRepository.updateSettings(settings);
    return this.settingsRepository.getAllSettings();
  }

  forceResetOrderNumbers(): void {
    // Set the force reset flag - next order will reset to 1
    this.settingsRepository.setForceResetFlag(true);
  }
  
  validateManagerPin(pin: string): boolean {
    return this.settingsRepository.validateManagerPin(pin);
  }
  
  updateManagerPin(pin: string): void {
    this.settingsRepository.setManagerPin(pin);
  }
}

export { SettingsService };
