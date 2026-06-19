export const shopkeeperOnly = (req, res, next) => {
  if (req.user?.role !== 'shopkeeper') {
    return res.status(403).json({ success: false, message: 'Shopkeeper access only' });
  }
  next();
};

export const customerOnly = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ success: false, message: 'Customer access only' });
  }
  next();
};
