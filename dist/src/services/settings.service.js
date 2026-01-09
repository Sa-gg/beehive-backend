class SettingsService {
    settingsRepository;
    constructor(settingsRepository) {
        this.settingsRepository = settingsRepository;
    }
    getSettings() {
        return this.settingsRepository.getAllSettings();
    }
    updateSettings(settings) {
        this.settingsRepository.updateSettings(settings);
        return this.settingsRepository.getAllSettings();
    }
    forceResetOrderNumbers() {
        // Set the force reset flag - next order will reset to 1
        this.settingsRepository.setForceResetFlag(true);
    }
    validateManagerPin(pin) {
        return this.settingsRepository.validateManagerPin(pin);
    }
    updateManagerPin(pin) {
        this.settingsRepository.setManagerPin(pin);
    }
}
export { SettingsService };
