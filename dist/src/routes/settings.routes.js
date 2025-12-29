import { Router } from 'express';
export const createSettingsRoutes = (settingsController) => {
    const router = Router();
    router.get('/', settingsController.getSettings);
    router.patch('/', settingsController.updateSettings);
    router.post('/force-reset', settingsController.forceResetOrderNumbers);
    return router;
};
