# Security Fixes & Improvements

## 🔴 Critical Security Fixes

### 1. Fix CORS Origin Handling

**Current Issue:**
```javascript
// ⚠️ Allows all no-origin requests (security risk)
if (!origin) {
  return callback(null, true);
}
```

**Fix:**
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Only allow no-origin in development
    if (!origin) {
      if (config.nodeEnv === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Origin required in production'));
    }
    
    if (config.corsOrigins.includes(origin) || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 2. Add JWT Secret Validation

**Add to `src/config/env.js`:**
```javascript
const validateJWTSecrets = () => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!accessSecret || accessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
  }
  
  if (!refreshSecret || refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }
  
  if (accessSecret === refreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }
  
  // Warn if using default secrets
  if (accessSecret.includes('your_super_secret') || refreshSecret.includes('your_super_secret')) {
    console.warn('⚠️  WARNING: Using default JWT secrets. Change them in production!');
  }
};

validateJWTSecrets();
```

### 3. Add HTTPS Enforcement

**Create `src/middleware/security.js`:**
```javascript
export const enforceHTTPS = (req, res, next) => {
  if (config.nodeEnv === 'production') {
    // Check if request is secure
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
};

export const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (config.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};
```

**Update `src/app.js`:**
```javascript
import { enforceHTTPS, securityHeaders } from './middleware/security.js';

// Add after helmet
app.use(enforceHTTPS);
app.use(securityHeaders);
```

### 4. Improve Rate Limiting

**Update rate limits:**
```javascript
// More reasonable limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased from 100
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Store rate limit info in Redis in production
  // store: redisStore,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // Increased from 5
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});
```

### 5. Add Request ID for Logging

**Create `src/middleware/requestId.js`:**
```javascript
import { randomUUID } from 'crypto';

export const requestId = (req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};
```

**Update `src/app.js`:**
```javascript
import { requestId } from './middleware/requestId.js';

app.use(requestId);
```

## 🟡 Important Enhancements

### 6. Account Lockout After Failed Attempts

**Create `src/middleware/accountLockout.js`:**
```javascript
import { prisma } from '../config/database.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const checkAccountLockout = async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) return next();
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, failedLoginAttempts: true, lockedUntil: true },
  });
  
  if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return res.status(423).json({
      success: false,
      message: 'Account locked due to multiple failed login attempts. Please try again later.',
    });
  }
  
  req.userLockout = user;
  next();
};

export const handleFailedLogin = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });
  
  const attempts = (user?.failedLoginAttempts || 0) + 1;
  const lockedUntil = attempts >= MAX_ATTEMPTS 
    ? new Date(Date.now() + LOCKOUT_DURATION)
    : null;
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: attempts,
      lockedUntil,
    },
  });
};

export const resetFailedLoginAttempts = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
};
```

**Add to User model in schema:**
```prisma
model User {
  // ... existing fields
  failedLoginAttempts  Int?      @default(0)
  lockedUntil          DateTime?
}
```

### 7. Enhanced Error Logging

**Update `src/middleware/errorHandler.js`:**
```javascript
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ... existing error handling

  const response = {
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { 
      stack: err.stack,
      requestId: req.id,
    }),
  };

  // Enhanced logging
  console.error('Error:', {
    requestId: req.id,
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  res.status(statusCode).json(response);
};
```

### 8. Environment Variable Security

**Add to `.env.example` comments:**
```env
# JWT Secrets - MUST be at least 32 characters, use strong random strings
# Generate with: openssl rand -base64 32
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
```

**Add validation script:**
```javascript
// scripts/validate-env.js
import dotenv from 'dotenv';
dotenv.config();

const checks = [];

// Check JWT secrets
if (process.env.JWT_ACCESS_SECRET?.length < 32) {
  checks.push('❌ JWT_ACCESS_SECRET must be at least 32 characters');
} else {
  checks.push('✅ JWT_ACCESS_SECRET is valid');
}

if (process.env.JWT_REFRESH_SECRET?.length < 32) {
  checks.push('❌ JWT_REFRESH_SECRET must be at least 32 characters');
} else {
  checks.push('✅ JWT_REFRESH_SECRET is valid');
}

if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
  checks.push('❌ JWT secrets must be different');
} else {
  checks.push('✅ JWT secrets are different');
}

// Check for default values
if (process.env.JWT_ACCESS_SECRET?.includes('your_super_secret')) {
  checks.push('⚠️  WARNING: Using default JWT_ACCESS_SECRET');
}

console.log(checks.join('\n'));

if (checks.some(c => c.startsWith('❌'))) {
  process.exit(1);
}
```

## 📊 Security Checklist

- [ ] CORS origin handling fixed
- [ ] JWT secret validation added
- [ ] HTTPS enforcement enabled
- [ ] Security headers configured
- [ ] Rate limits optimized
- [ ] Request ID logging added
- [ ] Account lockout implemented
- [ ] Error logging enhanced
- [ ] Environment validation script created
- [ ] Security audit performed
- [ ] Dependency vulnerabilities checked
- [ ] Secrets rotated
- [ ] Backup strategy in place

## 🚀 Implementation Priority

1. **Before Development:**
   - CORS fix
   - JWT secret validation
   - Security headers

2. **Before Testing:**
   - Request ID logging
   - Enhanced error logging
   - Rate limit optimization

3. **Before Production:**
   - HTTPS enforcement
   - Account lockout
   - Environment validation
   - Security audit

