import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/', listTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransactionById);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
