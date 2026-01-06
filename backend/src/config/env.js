import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or copy env.example to .env'
    );
  }
};

validateEnv();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  // Email - Nodemailer
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  
  // Email - Resend (Fallback)
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || '',
  },
  
  // Application
  appName: process.env.APP_NAME || 'LMS Platform',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // CORS - Support multiple origins for web and mobile
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [process.env.FRONTEND_URL || 'http://localhost:3001'],
};

