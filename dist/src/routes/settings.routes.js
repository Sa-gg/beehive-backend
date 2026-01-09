import { Router } from 'express';
export const createSettingsRoutes = (settingsController) => {
    const router = Router();
    router.get('/', settingsController.getSettings);
    router.patch('/', settingsController.updateSettings);
    router.post('/force-reset', settingsController.forceResetOrderNumbers);
    router.post('/validate-pin', settingsController.validateManagerPin);
    router.post('/update-pin', settingsController.updateManagerPin);
    return router;
};
