# LMS Backend API

Nepal's Most Powerful Learning Management System (LMS) Platform - Backend API built with Node.js, Express.js, MySQL, and Prisma.

## Features

- 🔐 **Authentication & Authorization**
  - User registration with email verification (OTP)
  - Login/Logout with JWT tokens (Access + Refresh tokens)
  - Forgot/Reset password with OTP
  - Role-based access control (User & Admin)

- 👤 **User Management**
  - User registration and email verification
  - Profile management
  - Account activation/deactivation

- 👨‍💼 **Admin Features**
  - Block/Unblock users
  - View all users with pagination and search
  - Get user details by ID

- 🔒 **Security**
  - Password hashing with bcrypt
  - JWT token-based authentication
  - Rate limiting on authentication endpoints
  - Input validation and sanitization
  - CORS configuration
  - Helmet for security headers

- 📧 **Email Service**
  - OTP delivery via email (Nodemailer primary, Resend fallback)
  - Beautiful HTML email templates
  - Automatic fallback mechanism

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer + Resend (fallback)
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

> **Note:** If you encounter MySQL authentication plugin errors, see [MYSQL_SETUP.md](./MYSQL_SETUP.md) for detailed setup instructions.

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL Database**
   
   **Quick Setup (Automated):**
   ```bash
   ./setup-mysql.sh
   ```
   
   **Manual Setup:**
   See [MYSQL_SETUP.md](./MYSQL_SETUP.md) for detailed instructions.
   
   **Quick Fix for Authentication Plugin Error:**
   ```bash
   sudo mysql -u root -p
   ```
   Then run:
   ```sql
   ALTER USER 'your_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000

   # Database
   DATABASE_URL="mysql://user:password@localhost:3306/lms_db"

   # JWT Secrets (Generate strong random strings)
   JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   # Email - Nodemailer (Primary)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # Email - Resend (Fallback) - Optional
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # Application
   APP_NAME=LMS Platform
   FRONTEND_URL=http://localhost:3001

   # Admin Seed (Optional)
   ADMIN_EMAIL=admin@lms.com
   ADMIN_PASSWORD=Admin@123
   ADMIN_NAME=Admin User
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate
   ```

6. **Seed admin user** (Optional)
   ```bash
   npm run prisma:seed
   ```
   
   Default admin credentials:
   - Email: `admin@lms.com`
   - Password: `Admin@123`
   
   ⚠️ **Change the admin password after first login!**

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## Testing

### Quick Start

1. **Run Automated Tests**
   ```bash
   # Make sure server is running first
   npm run dev
   
   # In another terminal
   npm test
   ```

2. **Use Postman Collection**
   - Import `LMS_API.postman_collection.json` into Postman
   - Import `LMS_API.postman_environment.json` for environment variables
   - All endpoints are organized and ready to test

### Detailed Testing Guide

See [TESTING.md](./TESTING.md) for comprehensive testing documentation including:
- Complete Postman collection usage
- Automated test script details
- Testing workflow and best practices
- Troubleshooting guide

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification.",
  "data": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}
```

#### `POST /api/auth/verify-otp`
Verify email with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### `POST /api/auth/resend-otp`
Resend OTP for email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### `POST /api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "jwt_token"
    }
  }
}
```

#### `POST /api/auth/logout`
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### `POST /api/auth/refresh-token`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

#### `POST /api/auth/forgot-password`
Request password reset OTP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### `POST /api/auth/reset-password`
Reset password with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

#### `GET /api/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Admin Endpoints

All admin endpoints require authentication and admin role.

#### `POST /api/admin/users/block`
Block a user.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "userId": "user_uuid"
}
```

#### `POST /api/admin/users/unblock`
Unblock a user.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "userId": "user_uuid"
}
```

#### `GET /api/admin/users`
Get all users with pagination and search.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by email or full name

**Example:**
```
GET /api/admin/users?page=1&limit=10&search=john
```

#### `GET /api/admin/users/:userId`
Get user details by ID.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Security Features

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

2. **OTP Security:**
   - 6-digit numeric OTP
   - 5-minute expiry
   - One-time use only
   - Rate limited (max 3 per hour per email)

3. **JWT Tokens:**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Refresh tokens stored hashed in database

4. **Rate Limiting:**
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes

## Database Schema

### User Model
- `id` (UUID, primary key)
- `email` (unique, indexed)
- `password` (hashed)
- `fullName`
- `role` (enum: USER, ADMIN)
- `isEmailVerified` (boolean)
- `isActive` (boolean)
- `refreshToken` (hashed, nullable)
- `createdAt`, `updatedAt` (timestamps)

### OTP Model
- `id` (UUID, primary key)
- `userId` (foreign key)
- `otp` (6-digit string)
- `type` (enum: EMAIL_VERIFICATION, PASSWORD_RESET)
- `expiresAt` (timestamp)
- `isUsed` (boolean)
- `createdAt` (timestamp)

## Development

### Prisma Studio
View and edit database data:
```bash
npm run prisma:studio
```

### Database Migrations
Create a new migration:
```bash
npm run prisma:migrate
```

## Environment Variables

See `env.example` for all available environment variables.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma client setup
│   │   └── env.js            # Environment configuration
│   ├── controllers/
│   │   ├── authController.js # Authentication logic
│   │   └── adminController.js # Admin operations
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── role.js           # Role-based access control
│   │   └── errorHandler.js   # Error handling
│   ├── routes/
│   │   ├── authRoutes.js     # Auth routes
│   │   └── adminRoutes.js    # Admin routes
│   ├── services/
│   │   ├── emailService.js   # Email sending
│   │   ├── otpService.js     # OTP management
│   │   └── tokenService.js   # JWT tokens
│   ├── utils/
│   │   ├── hashPassword.js   # Password hashing
│   │   └── validators.js     # Input validation
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Database seed script
├── .env                      # Environment variables (gitignored)
├── env.example               # Environment variables template
├── package.json
└── README.md
```

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation if needed

## License

ISC

## Support

For issues and questions, please contact the development team.

