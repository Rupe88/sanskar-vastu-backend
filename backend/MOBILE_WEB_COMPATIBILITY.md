# Mobile & Web App Compatibility

## ✅ Authentication System

The authentication system is **fully compatible with both mobile and web applications**. Here's why:

### 1. **JWT Token-Based Authentication**
- Uses **Access Tokens** and **Refresh Tokens** (industry standard)
- Tokens are stateless and platform-agnostic
- Works seamlessly on:
  - ✅ Web browsers (React, Vue, Angular, etc.)
  - ✅ Mobile apps (React Native, Flutter, Ionic, etc.)
  - ✅ Native apps (iOS, Android)

### 2. **RESTful API Design**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- No platform-specific dependencies

### 3. **CORS Configuration**

The API now supports **multiple origins** for both web and mobile:

```env
# In your .env file
CORS_ORIGINS=http://localhost:3001,capacitor://localhost,ionic://localhost
```

**For Web Apps:**
- Standard HTTP/HTTPS URLs: `http://localhost:3001`, `https://yourdomain.com`

**For Mobile Apps:**
- Capacitor: `capacitor://localhost`
- Ionic: `ionic://localhost`
- React Native: Configured via your app's origin
- Custom schemes: `yourapp://localhost`

**Development Mode:**
- In development, all origins are allowed for easier testing
- In production, only configured origins are allowed

### 4. **Token Storage Recommendations**

**Web Apps:**
- Store tokens in `httpOnly` cookies (recommended for security)
- Or use `localStorage` / `sessionStorage`
- Include tokens in `Authorization: Bearer <token>` header

**Mobile Apps:**
- Use secure storage (e.g., `@react-native-async-storage/async-storage`, `SecureStore`)
- Include tokens in `Authorization: Bearer <token>` header
- Never store in plain text or unsecured storage

## 📱 Mobile App Integration Examples

### React Native Example

```javascript
// Login
const response = await fetch('http://your-api.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123',
  }),
});

const data = await response.json();
const { accessToken, refreshToken } = data.data.tokens;

// Store tokens securely
await AsyncStorage.setItem('accessToken', accessToken);
await AsyncStorage.setItem('refreshToken', refreshToken);

// Use in subsequent requests
const token = await AsyncStorage.getItem('accessToken');
fetch('http://your-api.com/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Flutter Example

```dart
// Login
final response = await http.post(
  Uri.parse('http://your-api.com/api/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': 'user@example.com',
    'password': 'Password123',
  }),
);

final data = jsonDecode(response.body);
final accessToken = data['data']['tokens']['accessToken'];
final refreshToken = data['data']['tokens']['refreshToken'];

// Store tokens securely
await secureStorage.write(key: 'accessToken', value: accessToken);
await secureStorage.write(key: 'refreshToken', value: refreshToken);

// Use in subsequent requests
final token = await secureStorage.read(key: 'accessToken');
final meResponse = await http.get(
  Uri.parse('http://your-api.com/api/auth/me'),
  headers: {'Authorization': 'Bearer $token'},
);
```

## ✅ All Validations Implemented

Every API endpoint now has proper validations:

### Authentication Endpoints

| Endpoint | Validations |
|----------|-------------|
| `POST /api/auth/register` | ✅ Email format, password strength, fullName length |
| `POST /api/auth/login` | ✅ Email format, password required |
| `POST /api/auth/verify-otp` | ✅ Email format, OTP format (6 digits numeric) |
| `POST /api/auth/resend-otp` | ✅ Email format |
| `POST /api/auth/forgot-password` | ✅ Email format |
| `POST /api/auth/reset-password` | ✅ Email format, OTP format, new password strength |
| `POST /api/auth/refresh-token` | ✅ Refresh token required and string format |
| `POST /api/auth/logout` | ✅ Authentication required (no body validation) |
| `GET /api/auth/me` | ✅ Authentication required (no body validation) |

### Admin Endpoints

| Endpoint | Validations |
|----------|-------------|
| `GET /api/admin/users` | ✅ Page (positive int), limit (1-100), search (max 255 chars) |
| `GET /api/admin/users/:userId` | ✅ UserId UUID format |
| `POST /api/admin/users/block` | ✅ UserId UUID format, body validation |
| `POST /api/admin/users/unblock` | ✅ UserId UUID format, body validation |

### Validation Features

1. **Input Sanitization**
   - Email normalization
   - String trimming
   - Type conversion (int, string)

2. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

3. **UUID Validation**
   - All user IDs validated as proper UUIDs
   - Prevents invalid ID format attacks

4. **Pagination Validation**
   - Page must be positive integer
   - Limit between 1-100 (prevents DoS)
   - Search query max 255 characters

5. **Error Responses**
   ```json
   {
     "success": false,
     "message": "Validation failed",
     "errors": [
       {
         "msg": "Email must be valid",
         "param": "email",
         "location": "body"
       }
     ]
   }
   ```

## 🔒 Security Features

1. **Rate Limiting**
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes

2. **CORS Protection**
   - Configured allowed origins
   - Credentials support for cookies

3. **Helmet Security Headers**
   - XSS protection
   - Content Security Policy
   - Frame options

4. **JWT Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Secure token storage recommended

## 📋 Testing Checklist

All endpoints have been tested for:

- ✅ Success scenarios
- ✅ Validation errors
- ✅ Authentication errors (401)
- ✅ Authorization errors (403)
- ✅ Not found errors (404)
- ✅ Rate limiting (429)
- ✅ Invalid input formats
- ✅ Missing required fields
- ✅ CORS compatibility
- ✅ Token refresh flow

## 🚀 Deployment Notes

### For Production

1. **Update CORS origins:**
   ```env
   CORS_ORIGINS=https://yourwebapp.com,capacitor://localhost,ionic://localhost
   ```

2. **Secure JWT secrets:**
   ```env
   JWT_ACCESS_SECRET=your-very-secure-secret-here
   JWT_REFRESH_SECRET=your-very-secure-refresh-secret-here
   ```

3. **Enable HTTPS:**
   - Use reverse proxy (Nginx, Apache)
   - SSL/TLS certificates required

4. **Monitor rate limits:**
   - Adjust limits based on usage
   - Consider different limits for mobile vs web

## 📚 API Documentation

- See [README.md](./README.md) for complete API documentation
- See [TESTING.md](./TESTING.md) for testing instructions
- Import Postman collection for interactive testing

