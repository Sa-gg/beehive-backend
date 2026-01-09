// Simple in-memory storage for settings
// In production, you might want to store this in database
class SettingsRepository {
    settings = {
        openTime: '08:00',
        closeTime: '22:00',
        lastResetDate: null,
        managerPin: '1234' // Default manager PIN
    };
    // Flag to force reset on next order
    forceResetFlag = false;
    getAllSettings() {
        // Return settings without exposing the actual PIN
        const { managerPin, ...publicSettings } = this.settings;
        return { ...publicSettings };
    }
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
    getLastResetDate() {
        return this.settings.lastResetDate;
    }
    setLastResetDate(date) {
        this.settings.lastResetDate = date;
    }
    getOpenTime() {
        return this.settings.openTime;
    }
    getCloseTime() {
        return this.settings.closeTime;
    }
    getForceResetFlag() {
        return this.forceResetFlag;
    }
    setForceResetFlag(value) {
        this.forceResetFlag = value;
    }
    getManagerPin() {
        return this.settings.managerPin || '1234';
    }
    setManagerPin(pin) {
        this.settings.managerPin = pin;
    }
    validateManagerPin(pin) {
        return this.settings.managerPin === pin;
    }
}
export { SettingsRepository };
