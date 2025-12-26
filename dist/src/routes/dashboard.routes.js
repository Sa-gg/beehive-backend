import { Router } from 'express';
export function createDashboardRoutes(dashboardController) {
    const router = Router();
    router.get('/stats', dashboardController.getStats);
    return router;
}
