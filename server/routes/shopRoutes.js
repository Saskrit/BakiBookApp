import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  getDashboardStats,
  getReport,
  getAnalytics,
  getShopActivity,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/dashboard', getDashboardStats);
router.get('/activity', getShopActivity);
router.get('/reports', getReport);
router.get('/analytics', getAnalytics);

export default router;
