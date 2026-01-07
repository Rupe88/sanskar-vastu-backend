import { body, query, param, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  };
};

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const verifyOtpValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

export const resendOtpValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const userIdValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

export const userIdParamValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search query must be less than 255 characters'),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

// Course validations
export const courseValidation = [
  body('title').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('slug').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString(),
  body('shortDescription').optional().isLength({ max: 500 }),
  body('thumbnail').optional().isString().isURL(),
  body('price').optional().isFloat({ min: 0 }),
  body('isFree').optional().isBoolean(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ONGOING']),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('duration').optional().isInt({ min: 0 }),
  body('language').optional().isString(),
  body('featured').optional().isBoolean(),
  body('isOngoing').optional().isBoolean(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('tags').optional().isString(),
  body('instructorId').notEmpty().isUUID(),
  body('categoryId').optional().isUUID(),
];

export const courseFilterValidation = [
  query('category').optional().isString(),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('tags').optional().isString(),
  query('isOngoing').optional().isBoolean(),
  query('featured').optional().isBoolean(),
  query('instructor').optional().isUUID(),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['newest', 'oldest', 'price', 'rating', 'popularity', 'enrollments']),
  query('order').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

// Instructor validations
export const instructorValidation = [
  body('name').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('slug').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('image').optional().isString().isURL(),
  body('bio').optional().isString(),
  body('designation').optional().trim().isLength({ max: 255 }),
  body('specialization').optional().trim().isLength({ max: 500 }),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('socialLinks').optional().isJSON(),
  body('featured').optional().isBoolean(),
  body('order').optional().isInt(),
];

// Consultation validations
export const consultationValidation = [
  body('name').notEmpty().trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().isString().withMessage('Phone number is required'),
  body('eventId').optional().isUUID().withMessage('Invalid event ID'),
  body('consultationType').isIn(['ONLINE', 'OFFLINE']).withMessage('Consultation type must be ONLINE or OFFLINE'),
  body('referralSource').optional().isIn(['GOOGLE_SEARCH', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'FRIEND_REFERRAL', 'EVENT', 'OTHER']).withMessage('Invalid referral source'),
  body('referralSourceOther').optional().trim().isLength({ max: 255 }).withMessage('Referral source other must be less than 255 characters')
    .custom((value, { req }) => {
      if (req.body.referralSource === 'OTHER' && !value) {
        throw new Error('Referral source other is required when referral source is OTHER');
      }
      return true;
    }),
  body('source').optional().trim().isLength({ max: 100 }).withMessage('Source must be less than 100 characters'),
  body('message').optional().isString().withMessage('Message must be a string'),
];

