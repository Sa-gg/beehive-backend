import { Router } from 'express';
import {
  stockIn,
  stockOut,
  adjustStock,
  getTransactionHistory,
  getAllTransactions,
} from '../controllers/stockTransaction.controller.js';

const router = Router();

// Stock transactions
router.post('/in', stockIn);
router.post('/out', stockOut);
router.post('/adjust', adjustStock);
router.get('/history/:inventoryItemId', getTransactionHistory);
router.get('/', getAllTransactions);

export default router;
