# Quick Fix for MySQL Authentication Plugin Error

If you're getting this error:
```
Error: Schema engine error:
Error querying the database: Unknown authentication plugin `sha256_password'.
```

## Quick Solution

Run these commands:

```bash
# Login to MySQL as root
sudo mysql -u root -p
```

Then execute these SQL commands (replace `your_user` and `your_password` with your actual values):

```sql
-- Change authentication plugin to mysql_native_password
ALTER USER 'your_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify the change
SELECT user, host, plugin FROM mysql.user WHERE user = 'your_user';

-- Exit
EXIT;
```

## Example

If your user is `lms_user` and password is `mypassword123`:

```sql
ALTER USER 'lms_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mypassword123';
FLUSH PRIVILEGES;
EXIT;
```

## After Fixing

1. Make sure your `.env` file has the correct `DATABASE_URL`:
   ```env
   DATABASE_URL="mysql://lms_user:mypassword123@localhost:3306/lms_db"
   ```

2. Run Prisma commands:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Why This Happens

MySQL 8.0+ uses `caching_sha2_password` as the default authentication plugin, but Prisma works better with `mysql_native_password`. Changing the plugin fixes compatibility issues.

## Alternative: Use Root User (Not Recommended)

If you want to use root temporarily:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_root_password';
FLUSH PRIVILEGES;
```

Then update `.env`:
```env
DATABASE_URL="mysql://root:your_root_password@localhost:3306/lms_db"
```

## Still Having Issues?

See [MYSQL_SETUP.md](./MYSQL_SETUP.md) for complete MySQL setup instructions.

