import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  jwtSecret: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'your-secret-key-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRY || '7d',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  appName: process.env.APP_NAME || 'Sanskar Academy',
  
  // CORS - Multiple origins separated by commas
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [process.env.FRONTEND_URL || 'http://localhost:3001'],
  
  // Email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER,
  
  // Resend (fallback email service)
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  // Payment Gateways
  esewa: {
    merchantId: process.env.ESEWA_MERCHANT_ID,
    secretKey: process.env.ESEWA_SECRET_KEY,
    environment: process.env.ESEWA_ENVIRONMENT || 'sandbox',
  },
  
  esewaProductCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  
  // Card Payments - Khalti (Recommended for Nepal - Supports Visa/Mastercard)
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY,
    publicKey: process.env.KHALTI_PUBLIC_KEY,
  },
  
  // Card Payments - Razorpay (Alternative for Visa/Mastercard)
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  
  // Mobile Banking
  mobileBankingEnabled: process.env.MOBILE_BANKING_ENABLED === 'true',
};
