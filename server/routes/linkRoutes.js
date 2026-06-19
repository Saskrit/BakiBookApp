import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { customerOnly } from '../middleware/roleMiddleware.js';
import {
  getPendingLinks,
  getPendingLinkDetail,
  acceptLink,
  rejectLink,
  getLinkedShops,
} from '../controllers/linkController.js';

const router = express.Router();

router.use(protect, customerOnly);

router.get('/pending', getPendingLinks);
router.get('/pending/:customerId', getPendingLinkDetail);
router.get('/linked', getLinkedShops);
router.post('/:customerId/accept', acceptLink);
router.post('/:customerId/reject', rejectLink);

export default router;
