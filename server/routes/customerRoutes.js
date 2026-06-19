import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  listCustomers,
  getCustomerById,
  getCustomerByQr,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

router.use(protect, shopkeeperOnly);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.get('/qr/:qrCode', getCustomerByQr);
router.get('/:id', getCustomerById);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
