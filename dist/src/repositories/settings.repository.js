// Simple in-memory storage for settings
// In production, you might want to store this in database
class SettingsRepository {
    settings = {
        openTime: '08:00',
        closeTime: '22:00',
        lastResetDate: null
    };
    // Flag to force reset on next order
    forceResetFlag = false;
    getAllSettings() {
        return { ...this.settings };
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
}
export { SettingsRepository };
