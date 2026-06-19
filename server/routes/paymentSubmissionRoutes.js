import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  getPendingSubmissionCount,
  listShopkeeperSubmissions,
  getShopkeeperSubmission,
  acceptSubmission,
  rejectSubmission,
  reportSubmission,
} from '../controllers/paymentSubmissionController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/pending-count', getPendingSubmissionCount);
router.get('/', listShopkeeperSubmissions);
router.get('/:id', getShopkeeperSubmission);
router.post('/:id/accept', acceptSubmission);
router.post('/:id/reject', rejectSubmission);
router.post('/:id/report', reportSubmission);

export default router;
