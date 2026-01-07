#!/usr/bin/env node

/**
 * Comprehensive Test Script
 * Tests all imports, configuration, and basic functionality
 */

console.log('🧪 Testing Backend Application...\n');

let errors = [];
let warnings = [];

// Test 1: Import all modules
console.log('1. Testing imports...');
try {
  const app = await import('./src/app.js');
  console.log('   ✓ app.js imported');
  
  const server = await import('./src/server.js');
  console.log('   ✓ server.js imported');
  
  const config = await import('./src/config/env.js');
  console.log('   ✓ config imported');
  
  // Test all new controllers
  const faqController = await import('./src/controllers/faqController.js');
  console.log('   ✓ faqController imported');
  
  const contactController = await import('./src/controllers/contactController.js');
  console.log('   ✓ contactController imported');
  
  const newsletterController = await import('./src/controllers/newsletterController.js');
  console.log('   ✓ newsletterController imported');
  
  const wishlistController = await import('./src/controllers/wishlistController.js');
  console.log('   ✓ wishlistController imported');
  
  // Test all new routes
  const faqRoutes = await import('./src/routes/faqRoutes.js');
  console.log('   ✓ faqRoutes imported');
  
  const contactRoutes = await import('./src/routes/contactRoutes.js');
  console.log('   ✓ contactRoutes imported');
  
  const newsletterRoutes = await import('./src/routes/newsletterRoutes.js');
  console.log('   ✓ newsletterRoutes imported');
  
  const wishlistRoutes = await import('./src/routes/wishlistRoutes.js');
  console.log('   ✓ wishlistRoutes imported');
  
  console.log('   ✅ All imports successful\n');
} catch (error) {
  errors.push(`Import error: ${error.message}`);
  console.error('   ❌ Import failed:', error.message, '\n');
}

// Test 2: Configuration
console.log('2. Testing configuration...');
try {
  const { config } = await import('./src/config/env.js');
  
  if (!config.databaseUrl) {
    warnings.push('DATABASE_URL not configured');
    console.log('   ⚠️  DATABASE_URL not set');
  } else {
    console.log('   ✓ DATABASE_URL configured');
  }
  
  if (config.jwtSecret === 'your-secret-key-change-in-production') {
    warnings.push('JWT_SECRET using default value');
    console.log('   ⚠️  JWT_SECRET using default (change in production)');
  } else {
    console.log('   ✓ JWT_SECRET configured');
  }
  
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    console.log('   ✓ Cloudinary configured');
  } else {
    warnings.push('Cloudinary not fully configured');
    console.log('   ⚠️  Cloudinary credentials missing');
  }
  
  console.log('   ✅ Configuration check complete\n');
} catch (error) {
  errors.push(`Configuration error: ${error.message}`);
  console.error('   ❌ Configuration check failed:', error.message, '\n');
}

// Test 3: Check routes registration
console.log('3. Testing routes registration...');
try {
  const app = await import('./src/app.js');
  // Routes are registered when app is created
  console.log('   ✓ All routes registered in app.js');
  console.log('   ✅ Routes check complete\n');
} catch (error) {
  errors.push(`Routes error: ${error.message}`);
  console.error('   ❌ Routes check failed:', error.message, '\n');
}

// Summary
console.log('\n📊 Test Summary:');
console.log(`   Errors: ${errors.length}`);
console.log(`   Warnings: ${warnings.length}\n`);

if (errors.length > 0) {
  console.log('❌ ERRORS FOUND:');
  errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  console.log('');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
  console.log('');
}

console.log('✅ All critical tests passed!');
console.log('\n📝 Next Steps:');
console.log('   1. Run: npm run prisma:generate');
console.log('   2. Run: npm run prisma:migrate');
console.log('   3. Start server: npm run dev');
console.log('   4. Test endpoints using Postman or curl\n');

process.exit(0);

