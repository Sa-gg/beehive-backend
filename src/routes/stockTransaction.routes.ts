import { Router } from 'express';
import {
  stockIn,
  stockOut,
  adjustStock,
  getTransactionHistory,
  getAllTransactions,
  getTransaction,
  updateTransactionMetadata,
  getTransactionAuditLogs,
} from '../controllers/stockTransaction.controller.js';

const router = Router();

// Stock transactions
router.post('/in', stockIn);
router.post('/out', stockOut);
router.post('/adjust', adjustStock);
router.get('/history/:inventoryItemId', getTransactionHistory);
router.get('/', getAllTransactions);

// Single transaction operations
router.get('/:transactionId', getTransaction);
router.patch('/:transactionId/metadata', updateTransactionMetadata);
router.get('/:transactionId/audit-logs', getTransactionAuditLogs);

export default router;
