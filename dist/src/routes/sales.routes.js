import { Router } from 'express';
export function createSalesRoutes(salesController) {
    const router = Router();
    router.get('/report', salesController.getSalesReport);
    return router;
}
