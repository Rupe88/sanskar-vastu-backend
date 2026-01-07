# Quick Test Guide

## Immediate Testing Steps

### 1. Start Server (Test if it runs)
```bash
cd backend
npm run dev
```

**Expected:** Server should start without errors
**If errors:** Check terminal output for specific issues

### 2. Test Health Endpoint
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-07T..."
}
```

### 3. Test Database Connection
The server automatically tests database connection on startup.
**Check terminal for:** `✓ Database connected successfully`

### 4. Critical Feature Tests

#### Test User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "fullName": "Test User"
  }'
```

#### Test Get Products (Public)
```bash
curl http://localhost:8000/api/products
```

#### Test Get Courses (Public)
```bash
curl http://localhost:8000/api/courses
```

#### Test Get Events (Public)
```bash
curl http://localhost:8000/api/events
```

#### Test Get Blogs (Public)
```bash
curl http://localhost:8000/api/blogs
```

## What to Check

1. **Server Starts?** ✅/❌
2. **Health Endpoint Works?** ✅/❌
3. **Database Connects?** ✅/❌
4. **Routes Respond?** ✅/❌
5. **No Runtime Errors?** ✅/❌

## Common Issues

### Issue: Database Connection Failed
**Solution:** 
- Check DATABASE_URL in .env
- Ensure MySQL is running
- Run: `npm run prisma:generate`

### Issue: Port Already in Use
**Solution:**
- Change PORT in .env
- Kill existing process: `lsof -ti:8000 | xargs kill`

### Issue: Module Not Found
**Solution:**
- Run: `npm install`
- Check all imports are correct

### Issue: JWT Secret Warning
**Solution:**
- Set JWT_SECRET in .env (change from default)
- Set JWT_REFRESH_SECRET in .env

## Production Checklist

Before deploying to production, ensure:

- [ ] Database migrations completed
- [ ] All environment variables set
- [ ] JWT secrets changed from defaults
- [ ] Payment gateway credentials configured
- [ ] Email service configured
- [ ] CORS origins set correctly
- [ ] NODE_ENV=production set

