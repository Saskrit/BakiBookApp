import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSharedCredits } from '../controllers/sharedController.js';

const router = express.Router();

router.use(protect);

router.get('/:customerId', getSharedCredits);

export default router;
