import express from 'express';
import {
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FAToken,
  get2FAStatus,
} from '../controllers/twoFactorController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Authenticated routes
router.get(
  '/status',
  authenticate,
  get2FAStatus
);

router.post(
  '/setup',
  authenticate,
  setup2FA
);

router.post(
  '/enable',
  authenticate,
  [
    body('token')
      .notEmpty()
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits'),
  ],
  enable2FA
);

router.post(
  '/disable',
  authenticate,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('token')
      .notEmpty()
      .withMessage('Verification code is required'),
  ],
  disable2FA
);

// Public route (for login flow)
router.post(
  '/verify',
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('token').notEmpty().withMessage('Verification code is required'),
  ],
  verify2FAToken
);

export default router;

