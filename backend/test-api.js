import dotenv from 'dotenv';
import { config } from './src/config/env.js';

dotenv.config();

const BASE_URL = `http://localhost:${config.port}`;
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

// Helper function to log with colors
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, response };
  } catch (error) {
    return {
      status: 0,
      data: { success: false, message: error.message },
      error,
    };
  }
}

// Test runner
function test(name, testFunction) {
  return async () => {
    try {
      await testFunction();
      testResults.passed++;
      testResults.tests.push({ name, status: 'PASSED' });
      log(`✓ ${name}`, COLORS.green);
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.tests.push({ name, status: 'FAILED', error: error.message });
      log(`✗ ${name}: ${error.message}`, COLORS.red);
      return false;
    }
  };
}

// Assertion helpers
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertStatus(response, expectedStatus) {
  assert(
    response.status === expectedStatus,
    `Expected status ${expectedStatus}, got ${response.status}`
  );
}

function assertSuccess(response) {
  assert(
    response.data.success === true,
    `Expected success: true, got ${JSON.stringify(response.data)}`
  );
}

function assertFailure(response) {
  assert(
    response.data.success === false,
    `Expected success: false, got ${JSON.stringify(response.data)}`
  );
}

// Test data
const testUsers = {
  regular: {
    email: `test${Date.now()}@example.com`,
    password: 'Test123456',
    fullName: 'Test User',
  },
  admin: {
    email: config.adminEmail || 'admin@lms.com',
    password: config.adminPassword || 'Admin@123',
  },
};

let tokens = {
  user: { accessToken: '', refreshToken: '' },
  admin: { accessToken: '', refreshToken: '' },
};

let userId = '';
let targetUserId = '';

// ========== AUTHENTICATION TESTS ==========

async function testHealthCheck() {
  const response = await makeRequest('/health');
  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.message === 'Server is running', 'Health check message mismatch');
}

async function testRegister() {
  const response = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUsers.regular),
  });
  assertStatus(response, 201);
  assertSuccess(response);
  assert(response.data.data.userId, 'User ID not returned');
  assert(response.data.data.email === testUsers.regular.email, 'Email mismatch');
  userId = response.data.data.userId;
  log(`  Registered user ID: ${userId}`, COLORS.cyan);
}

async function testRegisterDuplicate() {
  const response = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUsers.regular),
  });
  assertStatus(response, 409);
  assertFailure(response);
}

async function testRegisterValidation() {
  const invalidData = [
    { email: 'invalid-email', password: 'Test123456', fullName: 'Test User' },
    { email: 'test@example.com', password: 'weak', fullName: 'Test User' },
    { email: 'test@example.com', password: 'Test123456', fullName: 'A' },
  ];

  for (const data of invalidData) {
    const response = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    assertStatus(response, 400);
    assertFailure(response);
  }
}

async function testVerifyOtp() {
  // Note: This requires a valid OTP from email
  // For testing, we'll skip if OTP is not provided
  const otp = process.env.TEST_OTP || '';
  if (!otp) {
    log('  ⚠ Skipping OTP verification - set TEST_OTP env var to test', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.regular.email,
      otp: otp,
    }),
  });
  assertStatus(response, 200);
  assertSuccess(response);
}

async function testResendOtp() {
  const response = await makeRequest('/api/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.regular.email,
    }),
  });
  // Can be 200 (success) or 429 (rate limited)
  assert(
    response.status === 200 || response.status === 429,
    `Unexpected status: ${response.status}`
  );
}

async function testLogin() {
  // First, register a new user for login test
  const loginUser = {
    email: `login${Date.now()}@example.com`,
    password: 'Login123456',
    fullName: 'Login Test User',
  };

  // Register
  await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(loginUser),
  });

  // Verify OTP manually first, or skip if not verified
  log('  ⚠ Login test requires verified email - make sure user is verified', COLORS.yellow);

  // Try login - might fail if email not verified
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: loginUser.email,
      password: loginUser.password,
    }),
  });

  if (response.status === 403 && response.data.message?.includes('verify')) {
    log('  ⚠ Login skipped - email not verified. Verify manually or set TEST_OTP', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.tokens.accessToken, 'Access token not returned');
  assert(response.data.data.tokens.refreshToken, 'Refresh token not returned');
  tokens.user.accessToken = response.data.data.tokens.accessToken;
  tokens.user.refreshToken = response.data.data.tokens.refreshToken;
  log(`  Got access token: ${tokens.user.accessToken.substring(0, 20)}...`, COLORS.cyan);
}

async function testLoginAdmin() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(testUsers.admin),
  });

  if (response.status === 401 || response.status === 404) {
    log('  ⚠ Admin login skipped - admin user may not exist', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  assertStatus(response, 200);
  assertSuccess(response);
  tokens.admin.accessToken = response.data.data.tokens.accessToken;
  tokens.admin.refreshToken = response.data.data.tokens.refreshToken;
  log(`  Admin access token obtained`, COLORS.cyan);
}

async function testLoginValidation() {
  const invalidData = [
    { email: 'invalid-email', password: 'Test123456' },
    { email: 'test@example.com', password: '' },
  ];

  for (const data of invalidData) {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    assertStatus(response, 400);
    assertFailure(response);
  }
}

async function testLoginInvalidCredentials() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'nonexistent@example.com',
      password: 'WrongPassword123',
    }),
  });
  assertStatus(response, 401);
  assertFailure(response);
}

async function testGetMe() {
  if (!tokens.user.accessToken) {
    log('  ⚠ GetMe skipped - no access token', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.user.accessToken}`,
    },
  });
  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.user, 'User data not returned');
}

async function testGetMeUnauthorized() {
  const response = await makeRequest('/api/auth/me', {
    method: 'GET',
  });
  assertStatus(response, 401);
}

async function testRefreshToken() {
  if (!tokens.user.refreshToken) {
    log('  ⚠ RefreshToken skipped - no refresh token', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken: tokens.user.refreshToken,
    }),
  });
  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.accessToken, 'New access token not returned');
  tokens.user.accessToken = response.data.data.accessToken;
  log(`  Token refreshed successfully`, COLORS.cyan);
}

async function testRefreshTokenInvalid() {
  const response = await makeRequest('/api/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken: 'invalid-refresh-token',
    }),
  });
  assertStatus(response, 401);
  assertFailure(response);
}

async function testForgotPassword() {
  const response = await makeRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.regular.email,
    }),
  });
  // Can be 200 (success) or 429 (rate limited)
  assert(
    response.status === 200 || response.status === 429,
    `Unexpected status: ${response.status}`
  );
}

async function testResetPassword() {
  const resetOtp = process.env.TEST_RESET_OTP || '';
  if (!resetOtp) {
    log('  ⚠ ResetPassword skipped - set TEST_RESET_OTP env var to test', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.regular.email,
      otp: resetOtp,
      newPassword: 'NewPassword123',
    }),
  });
  assertStatus(response, 200);
  assertSuccess(response);
}

async function testLogout() {
  if (!tokens.user.accessToken) {
    log('  ⚠ Logout skipped - no access token', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.user.accessToken}`,
    },
  });
  assertStatus(response, 200);
  assertSuccess(response);
}

// ========== ADMIN TESTS ==========

async function testGetAllUsers() {
  if (!tokens.admin.accessToken) {
    log('  ⚠ GetAllUsers skipped - no admin token', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/admin/users?page=1&limit=10', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
  });
  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.users, 'Users array not returned');
  assert(response.data.data.pagination, 'Pagination data not returned');
  
  if (response.data.data.users.length > 0) {
    targetUserId = response.data.data.users[0].id;
    log(`  Found ${response.data.data.users.length} users`, COLORS.cyan);
  }
}

async function testGetAllUsersWithSearch() {
  if (!tokens.admin.accessToken) {
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/admin/users?page=1&limit=10&search=test', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
  });
  assertStatus(response, 200);
  assertSuccess(response);
}

async function testGetAllUsersUnauthorized() {
  const response = await makeRequest('/api/admin/users', {
    method: 'GET',
  });
  assertStatus(response, 401);
}

async function testGetAllUsersForbidden() {
  if (!tokens.user.accessToken) {
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/admin/users', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.user.accessToken}`,
    },
  });
  assertStatus(response, 403);
}

async function testGetUserById() {
  if (!tokens.admin.accessToken || !targetUserId) {
    log('  ⚠ GetUserById skipped - no admin token or target user ID', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest(`/api/admin/users/${targetUserId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
  });
  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.user.id === targetUserId, 'User ID mismatch');
}

async function testGetUserByIdNotFound() {
  if (!tokens.admin.accessToken) {
    testResults.skipped++;
    return;
  }

  const fakeId = '00000000-0000-0000-0000-000000000000';
  const response = await makeRequest(`/api/admin/users/${fakeId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
  });
  assertStatus(response, 404);
  assertFailure(response);
}

async function testBlockUser() {
  if (!tokens.admin.accessToken || !targetUserId) {
    log('  ⚠ BlockUser skipped - no admin token or target user ID', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/admin/users/block', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
    body: JSON.stringify({
      userId: targetUserId,
    }),
  });
  
  // Might fail if user is already blocked or is admin
  if (response.status === 400 || response.status === 403) {
    log(`  ⚠ BlockUser skipped - ${response.data.message}`, COLORS.yellow);
    testResults.skipped++;
    return;
  }

  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.user.isActive === false, 'User not blocked');
}

async function testBlockUserValidation() {
  if (!tokens.admin.accessToken) {
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/admin/users/block', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
    body: JSON.stringify({
      userId: 'invalid-uuid',
    }),
  });
  assertStatus(response, 400);
  assertFailure(response);
}

async function testUnblockUser() {
  if (!tokens.admin.accessToken || !targetUserId) {
    log('  ⚠ UnblockUser skipped - no admin token or target user ID', COLORS.yellow);
    testResults.skipped++;
    return;
  }

  const response = await makeRequest('/api/admin/users/unblock', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.admin.accessToken}`,
    },
    body: JSON.stringify({
      userId: targetUserId,
    }),
  });
  
  // Might fail if user is already active
  if (response.status === 400) {
    log(`  ⚠ UnblockUser skipped - ${response.data.message}`, COLORS.yellow);
    testResults.skipped++;
    return;
  }

  assertStatus(response, 200);
  assertSuccess(response);
  assert(response.data.data.user.isActive === true, 'User not unblocked');
}

// ========== MAIN TEST RUNNER ==========

async function runAllTests() {
  log('\n' + '='.repeat(60), COLORS.bright);
  log('LMS API Test Suite', COLORS.bright + COLORS.blue);
  log('='.repeat(60) + '\n', COLORS.bright);

  log('Testing Health Check...', COLORS.cyan);
  await test('Health Check', testHealthCheck)();

  log('\n--- Authentication Tests ---\n', COLORS.yellow);
  
  await test('Register User', testRegister)();
  await test('Register Duplicate User (should fail)', testRegisterDuplicate)();
  await test('Register Validation (should fail)', testRegisterValidation)();
  await test('Verify OTP', testVerifyOtp)();
  await test('Resend OTP', testResendOtp)();
  await test('Login User', testLogin)();
  await test('Login Admin', testLoginAdmin)();
  await test('Login Validation (should fail)', testLoginValidation)();
  await test('Login Invalid Credentials (should fail)', testLoginInvalidCredentials)();
  await test('Get Current User (Me)', testGetMe)();
  await test('Get Me Unauthorized (should fail)', testGetMeUnauthorized)();
  await test('Refresh Token', testRefreshToken)();
  await test('Refresh Token Invalid (should fail)', testRefreshTokenInvalid)();
  await test('Forgot Password', testForgotPassword)();
  await test('Reset Password', testResetPassword)();
  await test('Logout', testLogout)();

  log('\n--- Admin Tests ---\n', COLORS.yellow);
  
  await test('Get All Users', testGetAllUsers)();
  await test('Get All Users With Search', testGetAllUsersWithSearch)();
  await test('Get All Users Unauthorized (should fail)', testGetAllUsersUnauthorized)();
  await test('Get All Users Forbidden (should fail)', testGetAllUsersForbidden)();
  await test('Get User By ID', testGetUserById)();
  await test('Get User By ID Not Found (should fail)', testGetUserByIdNotFound)();
  await test('Block User', testBlockUser)();
  await test('Block User Validation (should fail)', testBlockUserValidation)();
  await test('Unblock User', testUnblockUser)();

  // Print summary
  log('\n' + '='.repeat(60), COLORS.bright);
  log('Test Summary', COLORS.bright + COLORS.blue);
  log('='.repeat(60), COLORS.bright);
  log(`Total Tests: ${testResults.passed + testResults.failed + testResults.skipped}`, COLORS.bright);
  log(`Passed: ${testResults.passed}`, COLORS.green);
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? COLORS.red : COLORS.reset);
  log(`Skipped: ${testResults.skipped}`, COLORS.yellow);
  log('='.repeat(60) + '\n', COLORS.bright);

  if (testResults.failed > 0) {
    log('Failed Tests:', COLORS.red);
    testResults.tests
      .filter((t) => t.status === 'FAILED')
      .forEach((t) => {
        log(`  - ${t.name}: ${t.error}`, COLORS.red);
      });
    process.exit(1);
  } else {
    log('All tests passed! ✓', COLORS.green);
    process.exit(0);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await makeRequest('/health');
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
(async () => {
  log('Checking if server is running...', COLORS.cyan);
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log(`\n✗ Server is not running at ${BASE_URL}`, COLORS.red);
    log('Please start the server first with: npm run dev', COLORS.yellow);
    process.exit(1);
  }

  log('✓ Server is running\n', COLORS.green);
  await runAllTests();
})();

