import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  listPayments,
  getPaymentById,
  createPayment,
  deletePayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/', listPayments);
router.post('/', createPayment);
router.get('/:id', getPaymentById);
router.delete('/:id', deletePayment);

export default router;
