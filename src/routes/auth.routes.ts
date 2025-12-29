import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  // Public routes
  router.post('/register', authController.register.bind(authController));
  router.post('/login', authController.login.bind(authController));
  
  // Manager PIN validation (for authorization of sensitive actions)
  // This is accessible to any authenticated staff member
  router.post('/validate-manager-pin', authenticate, authController.validateManagerPin.bind(authController));

  // Protected routes
  router.get('/me', authenticate, authController.getMe.bind(authController));
  
  // Manager and Admin routes
  router.get('/users', authenticate, authorize('MANAGER', 'ADMIN'), authController.getAllUsers.bind(authController));
  router.get('/users/:id', authenticate, authorize('MANAGER', 'ADMIN'), authController.getUserById.bind(authController));
  router.put('/users/:id', authenticate, authorize('MANAGER', 'ADMIN'), authController.updateUser.bind(authController));
  router.delete('/users/:id', authenticate, authorize('MANAGER', 'ADMIN'), authController.deleteUser.bind(authController));
  
  // Manager, Admin and Cashier can add loyalty points
  router.post('/loyalty-points', authenticate, authorize('MANAGER', 'ADMIN', 'CASHIER'), authController.addLoyaltyPoints.bind(authController));

  return router;
}
