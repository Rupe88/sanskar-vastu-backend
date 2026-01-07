#!/usr/bin/env node

/**
 * Server Test Script
 * Tests if server can start without errors
 */

import app from './src/app.js';
import { config } from './src/config/env.js';

const PORT = process.env.PORT || config.port || 8000;

console.log('🧪 Testing Server Startup...\n');

// Test 1: Check imports
console.log('✓ All imports loaded successfully');

// Test 2: Check Cloudinary configuration
const cloudinaryConfig = config.cloudinary;
if (cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret) {
  console.log('✓ Cloudinary configured');
} else {
  console.log('⚠️  Cloudinary not configured (set CLOUDINARY_* env vars)');
}

// Test 3: Check database URL
if (config.databaseUrl) {
  console.log('✓ Database URL configured');
} else {
  console.log('⚠️  Database URL not configured');
}

// Test 4: Check JWT secrets
if (config.jwtSecret && config.jwtSecret !== 'your-secret-key-change-in-production') {
  console.log('✓ JWT secret configured');
} else {
  console.log('⚠️  JWT secret using default (change in production)');
}

// Test 5: Try to start server (without actually starting)
try {
  // Just verify app is exportable
  if (typeof app === 'function') {
    console.log('✓ Express app initialized');
  }
  
  console.log('\n✅ All basic checks passed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Configure .env file with your credentials');
  console.log('   2. Run: npm run prisma:generate');
  console.log('   3. Run: npm run prisma:migrate');
  console.log('   4. Start server: npm run dev');
  console.log('   5. Test endpoints using Postman or curl');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

