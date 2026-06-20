import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/', listExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
