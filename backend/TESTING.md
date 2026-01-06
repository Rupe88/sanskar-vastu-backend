# API Testing Guide

This guide explains how to test all APIs in the LMS Backend using Postman collection and automated test scripts.

## Table of Contents

- [Postman Collection](#postman-collection)
- [Automated Test Script](#automated-test-script)
- [Testing Workflow](#testing-workflow)
- [Environment Variables](#environment-variables)

## Postman Collection

### Importing the Collection

1. Open Postman
2. Click **Import** button
3. Select the `LMS_API.postman_collection.json` file
4. The collection will be imported with all endpoints organized into folders

### Collection Structure

The Postman collection includes:

- **Health Check** - Server status endpoint
- **Authentication** - All auth-related endpoints
  - Register
  - Verify OTP
  - Resend OTP
  - Login
  - Get Current User (Me)
  - Refresh Token
  - Logout
  - Forgot Password
  - Reset Password
- **Admin** - Admin-only endpoints
  - Get All Users (with pagination and search)
  - Get User By ID
  - Block User
  - Unblock User

### Collection Variables

The collection uses variables that are automatically set:

- `baseUrl` - API base URL (default: `http://localhost:8000`)
- `accessToken` - Automatically set after login
- `refreshToken` - Automatically set after login
- `userId` - Automatically set after registration/login
- `userEmail` - Test user email
- `userPassword` - Test user password
- `userFullName` - Test user full name

### Using the Collection

1. **Set Environment Variables** (if needed):
   - Click on the collection
   - Go to **Variables** tab
   - Update values as needed

2. **Test Flow**:
   - Start with **Register** - This will set `userId` and `userEmail`
   - **Verify OTP** - Enter the OTP from your email
   - **Login** - This will automatically set `accessToken` and `refreshToken`
   - Use **Get Current User (Me)** to verify authentication
   - For admin endpoints, login as admin first

3. **Automatic Token Management**:
   - Tokens are automatically saved after login
   - All authenticated requests use the saved tokens
   - The collection's auth is set to Bearer token using `{{accessToken}}`

## Automated Test Script

### Prerequisites

- Node.js 18+ (for native fetch support)
- Server must be running

### Running Tests

```bash
# Make sure server is running first
npm run dev

# In another terminal, run tests
npm test
# or
npm run test:api
```

### Test Coverage

The test script covers:

#### Authentication Tests
- ✓ Health Check
- ✓ User Registration
- ✓ Duplicate Registration (should fail)
- ✓ Registration Validation
- ✓ OTP Verification (requires manual OTP)
- ✓ Resend OTP
- ✓ User Login
- ✓ Admin Login
- ✓ Login Validation
- ✓ Invalid Credentials
- ✓ Get Current User (Me)
- ✓ Unauthorized Access
- ✓ Token Refresh
- ✓ Invalid Refresh Token
- ✓ Forgot Password
- ✓ Reset Password (requires manual OTP)
- ✓ Logout

#### Admin Tests
- ✓ Get All Users
- ✓ Get All Users with Search
- ✓ Unauthorized Access
- ✓ Forbidden Access (non-admin)
- ✓ Get User By ID
- ✓ User Not Found
- ✓ Block User
- ✓ Block User Validation
- ✓ Unblock User

### Test Results

The script outputs:
- ✓ Green checkmarks for passed tests
- ✗ Red X for failed tests
- ⚠ Yellow warnings for skipped tests
- Summary with total passed/failed/skipped count

### Environment Variables for Testing

You can set these environment variables for OTP testing:

```bash
# For email verification OTP
export TEST_OTP=123456

# For password reset OTP
export TEST_RESET_OTP=123456

# Then run tests
npm test
```

### Skipped Tests

Some tests may be skipped if:
- OTP is not provided (email verification, password reset)
- Access tokens are not available (requires login first)
- Admin user doesn't exist
- Target user ID is not available

These are normal and expected - the tests will indicate which ones are skipped.

## Testing Workflow

### Recommended Testing Order

1. **Start the Server**
   ```bash
   npm run dev
   ```

2. **Run Automated Tests**
   ```bash
   npm test
   ```
   This will test most endpoints automatically.

3. **Manual Testing with Postman**
   - Import the Postman collection
   - Test OTP-related endpoints manually (requires checking email)
   - Test edge cases and error scenarios
   - Test admin endpoints with admin credentials

4. **Test Edge Cases**
   - Invalid inputs
   - Rate limiting
   - Expired tokens
   - Missing authorization headers
   - Invalid user IDs

## Environment Variables

### For OTP Testing

If you want to test OTP-related endpoints automatically, you can:

1. Check your email for OTP after registration/password reset
2. Set environment variables:
   ```bash
   export TEST_OTP=your_otp_here
   export TEST_RESET_OTP=your_reset_otp_here
   ```
3. Run tests again

### For Admin Testing

Make sure you have an admin user. You can create one using:

1. Database seed (if configured)
2. Manual database entry
3. Using the admin credentials from your `.env` file:
   ```
   ADMIN_EMAIL=admin@lms.com
   ADMIN_PASSWORD=Admin@123
   ```

## Troubleshooting

### Tests Fail with "Server is not running"

- Make sure the server is running on the correct port
- Check `PORT` in your `.env` file
- Default port is 3000 (or 8000 as per env.example)

### OTP Tests Are Skipped

- This is normal if you haven't set `TEST_OTP` or `TEST_RESET_OTP`
- Check your email for OTP codes
- Set the environment variables and rerun tests

### Admin Tests Are Skipped

- Make sure admin user exists in database
- Check admin credentials in `.env`
- Run database seed if configured: `npm run prisma:seed`

### Authentication Tests Fail

- Make sure database is connected
- Check that users can be created
- Verify JWT secrets are set in `.env`

## Tips

1. **Run tests frequently** during development
2. **Use Postman** for manual testing and debugging
3. **Check test output** for detailed error messages
4. **Verify database state** if tests behave unexpectedly
5. **Clear test data** between test runs if needed

## Continuous Integration

You can integrate the test script into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    npm install
    npm start &
    sleep 5
    npm test
```

Make sure to:
- Start the server before running tests
- Set up database for testing
- Handle test data cleanup

