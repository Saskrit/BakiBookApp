import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listConversations,
  getMessages,
  sendMessage,
  getUnreadMessageCount,
  clearChat,
  deleteChat,
  blockCustomerMessaging,
  unblockCustomerMessaging,
} from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', listConversations);
router.get('/unread-count', getUnreadMessageCount);
router.delete('/:customerId/clear', clearChat);
router.post('/:customerId/block', blockCustomerMessaging);
router.post('/:customerId/unblock', unblockCustomerMessaging);
router.delete('/:customerId/chat', deleteChat);
router.get('/:customerId', getMessages);
router.post('/:customerId', sendMessage);

export default router;
