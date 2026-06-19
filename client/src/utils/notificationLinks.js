export function resolveNotificationLink(notification) {
  if (notification?.linkPath) return notification.linkPath;

  const { title, customerId } = notification || {};
  const cid = customerId;

  if (title?.includes('Payment submitted')) return '/shop/payment-submissions';
  if (title?.includes('Payment accepted') || title?.includes('Payment received')) {
    return cid ? `/shop/ledger/${cid}` : '/shop/transactions';
  }
  if (title?.includes('Payment')) return cid ? `/shop/ledger/${cid}` : '/shop/transactions';
  if (title?.includes('Message from') || title?.startsWith('Message')) {
    return cid ? `/shop/messages/${cid}` : '/shop/messages';
  }
  if (title?.includes('Credit')) return '/shop/transactions';
  if (title?.includes('linked') || title?.includes('invitation')) {
    return cid ? `/shop/customers/${cid}` : '/shop/customers';
  }
  if (title?.includes('reminder')) return '/shop/reminders';

  return '/shop/notifications';
}

export function resolveCustomerNotificationLink(notification) {
  if (notification?.linkPath) return notification.linkPath;

  const { title, customerId } = notification || {};
  const cid = customerId;

  if (title?.includes('Shop invitation') || title?.includes('invitation')) {
    return cid ? `/portal/link-shops/${cid}` : '/portal/link-shops';
  }
  if (title?.includes('Message from') || title?.startsWith('Message')) {
    return cid ? `/portal/messages/${cid}` : '/portal/messages';
  }
  if (title?.includes('Payment accepted') || title?.includes('Payment received')) {
    return '/portal/payments';
  }
  if (title?.includes('Payment') || title?.includes('Credit')) {
    return cid ? `/portal/shops/${cid}` : '/portal/transactions';
  }
  if (title?.includes('reminder')) return '/portal/dues';

  return '/portal/notifications';
}

export function resolveNotificationLinkForRole(notification, role) {
  if (role === 'customer') return resolveCustomerNotificationLink(notification);
  return resolveNotificationLink(notification);
}
