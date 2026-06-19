import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { shopkeeperOnly } from '../middleware/roleMiddleware.js';
import {
  getLedger,
  getOutstanding,
  getOverdue,
  getReminders,
  sendReminder,
  listNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
  getUnreadCount,
} from '../controllers/ledgerController.js';

const router = express.Router();

router.use(protect);

router.get('/notifications', listNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/notifications/:id/archive', archiveNotification);
router.patch('/notifications/:id/unarchive', unarchiveNotification);
router.delete('/notifications/:id', deleteNotification);
router.get('/notifications/:id', getNotificationById);

router.use(shopkeeperOnly);

router.get('/outstanding', getOutstanding);
router.get('/overdue', getOverdue);
router.get('/reminders', getReminders);
router.post('/reminders/send', sendReminder);
router.get('/:customerId', getLedger);

export default router;
