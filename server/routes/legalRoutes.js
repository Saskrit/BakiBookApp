import express from 'express';
import {
  listLegalDocuments,
  getLegalDocument,
  updateLegalDocument,
} from '../controllers/legalController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', listLegalDocuments);
router.get('/:slug', getLegalDocument);
router.put('/:slug', protectAdmin, updateLegalDocument);

export default router;
