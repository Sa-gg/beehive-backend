import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';

export const createSettingsRoutes = (settingsController: SettingsController) => {
  const router = Router();

  router.get('/', settingsController.getSettings);
  router.patch('/', settingsController.updateSettings);
  router.post('/force-reset', settingsController.forceResetOrderNumbers);

  return router;
};
