import Notification from '../models/Notification.js';
import { formatNotification } from './formatters.js';
import { emitToUser } from '../config/socket.js';

export async function emitNotificationCount(userId) {
  const count = await Notification.countDocuments({
    user: userId,
    read: false,
    archived: false,
  });
  emitToUser(userId.toString(), 'notification:count', { count });
  return count;
}

export async function createNotification({
  userId,
  title,
  body,
  type = 'info',
  customerId = null,
  linkPath = '',
}) {
  const notification = await Notification.create({
    user: userId,
    title,
    body,
    type,
    customer: customerId,
    linkPath: linkPath || '',
  });

  const payload = formatNotification(notification);
  emitToUser(userId.toString(), 'notification:new', payload);
  await emitNotificationCount(userId);
  return notification;
}
