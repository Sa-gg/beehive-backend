import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  // Public routes
  router.post('/register', authController.register.bind(authController));
  router.post('/login', authController.login.bind(authController));

  // Protected routes
  router.get('/me', authenticate, authController.getMe.bind(authController));
  
  // Manager only routes
  router.get('/users', authenticate, authorize('MANAGER'), authController.getAllUsers.bind(authController));
  router.get('/users/:id', authenticate, authorize('MANAGER'), authController.getUserById.bind(authController));
  router.put('/users/:id', authenticate, authorize('MANAGER'), authController.updateUser.bind(authController));
  router.delete('/users/:id', authenticate, authorize('MANAGER'), authController.deleteUser.bind(authController));
  
  // Manager and Cashier can add loyalty points
  router.post('/loyalty-points', authenticate, authorize('MANAGER', 'CASHIER'), authController.addLoyaltyPoints.bind(authController));

  return router;
}
