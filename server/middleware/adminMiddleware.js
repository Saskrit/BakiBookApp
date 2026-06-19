import { protect } from './authMiddleware.js';
import { isAdminEmail } from '../utils/adminCheck.js';

export const adminOnly = (req, res, next) => {
  if (!req.user?.email || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const protectAdmin = [protect, adminOnly];
