import { Router } from 'express';
export const createCustomersRoutes = (customersController) => {
    const router = Router();
    router.get('/', customersController.getAllCustomers);
    router.get('/stats', customersController.getCustomerStats);
    router.get('/:id', customersController.getCustomerById);
    router.post('/', customersController.createCustomer);
    router.put('/:id', customersController.updateCustomer);
    router.delete('/:id', customersController.deleteCustomer);
    router.post('/:id/loyalty', customersController.addLoyaltyPoints);
    return router;
};
