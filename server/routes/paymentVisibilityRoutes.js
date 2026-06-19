import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly, customerOnly } from '../middleware/roleMiddleware.js';
import {
  archivePaidEntryForCustomer,
  unarchivePaidEntryForCustomer,
  hidePaidEntryForShopkeeper,
  restorePaidEntryForShopkeeper,
} from '../controllers/paymentVisibilityController.js';

const router = express.Router();

router.use(protect);

router.patch('/:paymentId/archive', customerOnly, archivePaidEntryForCustomer);
router.patch('/:paymentId/unarchive', customerOnly, unarchivePaidEntryForCustomer);
router.patch('/:paymentId/hide', shopkeeperOnly, hidePaidEntryForShopkeeper);
router.patch('/:paymentId/restore', shopkeeperOnly, restorePaidEntryForShopkeeper);

export default router;
