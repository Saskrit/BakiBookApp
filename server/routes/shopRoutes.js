import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  getDashboardStats,
  getReport,
  getAnalytics,
  getShopActivity,
} from '../controllers/dashboardController.js';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/dashboard', getDashboardStats);
router.get('/products', listProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/activity', getShopActivity);
router.get('/reports', getReport);
router.get('/analytics', getAnalytics);

export default router;
