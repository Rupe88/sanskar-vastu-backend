import express from 'express';
import {
  blockUser,
  unblockUser,
  getAllUsers,
  getUserById,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { userIdValidation, userIdParamValidation, paginationValidation, validate } from '../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.post('/users/block', validate(userIdValidation), blockUser);
router.post('/users/unblock', validate(userIdValidation), unblockUser);
router.get('/users', validate(paginationValidation), getAllUsers);
router.get('/users/:userId', validate(userIdParamValidation), getUserById);

export default router;

