import { Router } from 'express'
import { LoyaltyController } from '../controllers/loyalty.controller.js'

export function createLoyaltyRoutes(loyaltyController: LoyaltyController): Router {
  const router = Router()

  // Customer lookup and management
  router.get('/lookup', loyaltyController.lookupCustomer)
  router.post('/customer', loyaltyController.findOrCreateCustomer)
  router.get('/customer/:id', loyaltyController.getCustomerById)
  router.get('/customers', loyaltyController.getAllCustomers)
  
  // Loyalty status
  router.get('/status', loyaltyController.getLoyaltyStatus)
  
  // Stamp operations
  router.post('/stamp/award', loyaltyController.awardStamp)
  router.post('/stamp/reverse', loyaltyController.reverseStamp)
  router.get('/stamp/check/:orderId', loyaltyController.canAwardStamp)
  
  // Reward operations
  router.post('/reward/redeem', loyaltyController.redeemReward)
  
  // Transaction history
  router.get('/transactions/:id', loyaltyController.getTransactionHistory)

  return router
}
