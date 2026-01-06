# Environment Variables Setup Guide

## ⚠️ IMPORTANT: Never Commit .env Files

**The `.env` file contains sensitive secrets and MUST NEVER be committed to version control.**

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` with your actual values:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Generate strong JWT secrets:**
   ```bash
   # Generate access secret
   openssl rand -base64 32
   
   # Generate refresh secret (different from access)
   openssl rand -base64 32
   ```

4. **Verify `.env` is in `.gitignore`:**
   ```bash
   cat .gitignore | grep .env
   # Should show: .env
   ```

## Required Variables

### Critical (Must Set)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/lms_db` |
| `JWT_ACCESS_SECRET` | Access token secret (32+ chars) | Generated random string |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) | Generated random string |
| `SMTP_HOST` | Email server hostname | `smtp.gmail.com` |
| `SMTP_USER` | Email account username | `your_email@gmail.com` |
| `SMTP_PASS` | Email account password/app password | Your Gmail app password |

### Recommended

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `8000` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3001` |
| `CORS_ORIGINS` | Allowed CORS origins | Uses `FRONTEND_URL` |

### Optional

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (email fallback) |
| `RESEND_FROM_EMAIL` | Resend sender email |
| `ADMIN_EMAIL` | Admin user email (for seeding) |
| `ADMIN_PASSWORD` | Admin user password (for seeding) |
| `ADMIN_NAME` | Admin user full name |

## Security Best Practices

### 1. JWT Secrets

**Requirements:**
- Minimum 32 characters
- Random, unpredictable
- Different for access and refresh tokens

**Generate securely:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online (use only for development)
# Visit: https://randomkeygen.com/
```

### 2. Database Credentials

- Use strong passwords
- Create dedicated database user (not root)
- Limit user permissions
- Use SSL connections in production

### 3. Email Configuration

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Use App Password (not regular password) in `SMTP_PASS`

**For Other Providers:**
- Check provider documentation for SMTP settings
- Use app-specific passwords when available

### 4. Production Environment

**Environment Variables Management:**

**Option 1: Platform Services**
- **AWS**: Secrets Manager, Parameter Store
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **Heroku**: Config Vars
- **Vercel**: Environment Variables

**Option 2: Docker Secrets**
```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - jwt_access_secret
      - jwt_refresh_secret

secrets:
  jwt_access_secret:
    file: ./secrets/jwt_access_secret.txt
```

**Option 3: CI/CD Variables**
- GitHub Actions: Repository Secrets
- GitLab CI: CI/CD Variables
- Jenkins: Credentials Plugin

## Verifying Setup

### Check Required Variables

Create a script `scripts/check-env.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

// Check JWT secrets strength
if (process.env.JWT_ACCESS_SECRET?.length < 32) {
  console.error('❌ JWT_ACCESS_SECRET must be at least 32 characters');
  process.exit(1);
}

if (process.env.JWT_REFRESH_SECRET?.length < 32) {
  console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters');
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

Run it:
```bash
node scripts/check-env.js
```

## Common Issues

### Issue: "Missing required environment variables"

**Solution:**
1. Ensure `.env` file exists
2. Check all required variables are set
3. Verify variable names match exactly (case-sensitive)

### Issue: "JWT secret too short"

**Solution:**
Generate new secrets with:
```bash
openssl rand -base64 32
```

### Issue: Email not sending

**Solution:**
1. Verify SMTP credentials
2. Check firewall/network settings
3. For Gmail: Use App Password, not regular password
4. Check spam folder

### Issue: Database connection failed

**Solution:**
1. Verify DATABASE_URL format
2. Check database is running
3. Verify credentials
4. Check network/firewall

## .gitignore Check

**Ensure `.env` is in `.gitignore`:**

```bash
# Check if .env is ignored
git check-ignore .env

# If not ignored, add it
echo ".env" >> .gitignore
```

**Verify before committing:**
```bash
# Check what files would be committed
git status

# .env should NOT appear in the list
```

## Deployment Checklist

- [ ] `.env` file created from `env.example`
- [ ] All required variables filled in
- [ ] Strong JWT secrets generated (32+ chars)
- [ ] Database credentials configured
- [ ] Email service configured
- [ ] CORS origins set for production
- [ ] `.env` verified in `.gitignore`
- [ ] Environment variables set on hosting platform
- [ ] Secrets management service configured (production)
- [ ] `.env` NOT committed to repository

## Emergency: If .env Was Committed

**If you accidentally committed `.env`:**

1. **Remove from Git history:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env file"
   ```

2. **Rotate ALL secrets:**
   - Generate new JWT secrets
   - Change database passwords
   - Regenerate API keys
   - Update all services

3. **Check Git history:**
   ```bash
   git log --all --full-history -- .env
   ```

4. **Consider rewriting history** (dangerous):
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # WARNING: This rewrites history
   ```

## Summary

✅ **DO:**
- Use `env.example` as template
- Generate strong random secrets
- Keep `.env` in `.gitignore`
- Use secrets management in production
- Document all variables

❌ **DON'T:**
- Commit `.env` files
- Use default/weak secrets
- Share `.env` files
- Store secrets in code
- Use same secrets across environments

