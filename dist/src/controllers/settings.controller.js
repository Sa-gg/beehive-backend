class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getSettings = async (req, res) => {
        try {
            const settings = this.settingsService.getSettings();
            res.json(settings);
        }
        catch (error) {
            console.error('Error getting settings:', error);
            res.status(500).json({ error: 'Failed to get settings' });
        }
    };
    updateSettings = async (req, res) => {
        try {
            const settings = req.body;
            // Validate time format if provided
            if (settings.openTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(settings.openTime)) {
                return res.status(400).json({ error: 'Invalid open time format. Use HH:MM' });
            }
            if (settings.closeTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(settings.closeTime)) {
                return res.status(400).json({ error: 'Invalid close time format. Use HH:MM' });
            }
            const updatedSettings = this.settingsService.updateSettings(settings);
            res.json(updatedSettings);
        }
        catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    };
    forceResetOrderNumbers = async (req, res) => {
        try {
            this.settingsService.forceResetOrderNumbers();
            res.json({ success: true, message: 'Order numbers will be reset for the next order' });
        }
        catch (error) {
            console.error('Error forcing reset:', error);
            res.status(500).json({ error: 'Failed to reset order numbers' });
        }
    };
    validateManagerPin = async (req, res) => {
        try {
            const { pin } = req.body;
            if (!pin || typeof pin !== 'string' || pin.length !== 4) {
                return res.status(400).json({ error: 'PIN must be 4 digits' });
            }
            const isValid = this.settingsService.validateManagerPin(pin);
            res.json({ valid: isValid });
        }
        catch (error) {
            console.error('Error validating PIN:', error);
            res.status(500).json({ error: 'Failed to validate PIN' });
        }
    };
    updateManagerPin = async (req, res) => {
        try {
            const { currentPin, newPin } = req.body;
            if (!currentPin || typeof currentPin !== 'string' || currentPin.length !== 4) {
                return res.status(400).json({ error: 'Current PIN must be 4 digits' });
            }
            if (!newPin || typeof newPin !== 'string' || newPin.length !== 4) {
                return res.status(400).json({ error: 'New PIN must be 4 digits' });
            }
            // Validate current PIN first
            if (!this.settingsService.validateManagerPin(currentPin)) {
                return res.status(401).json({ error: 'Current PIN is incorrect' });
            }
            this.settingsService.updateManagerPin(newPin);
            res.json({ success: true, message: 'Manager PIN updated successfully' });
        }
        catch (error) {
            console.error('Error updating manager PIN:', error);
            res.status(500).json({ error: 'Failed to update manager PIN' });
        }
    };
}
export { SettingsController };
