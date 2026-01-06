# Fedora MySQL Root Access Fix

## Your Current Situation
- ✅ MySQL is running (`mysqld.service` is active)
- ❌ Root user requires a password (you don't know it)

## Solution: Reset Root Password

### Step 1: Stop MySQL
```bash
sudo systemctl stop mysqld
```

### Step 2: Start MySQL in Safe Mode (Skip Grant Tables)
```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

**Note:** If `mysqld_safe` is not found, try:
```bash
sudo /usr/bin/mysqld_safe --skip-grant-tables --skip-networking &
```

**OR** use systemd override:
```bash
sudo systemctl set-environment MYSQLD_OPTS="--skip-grant-tables --skip-networking"
sudo systemctl start mysqld
```

### Step 3: Login Without Password
```bash
mysql -u root
```

You should now see `mysql>` prompt.

### Step 4: Reset Root Password (Inside MySQL)
```sql
USE mysql;

-- For MySQL 8.0+
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_root_password';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### Step 5: Stop Safe Mode MySQL
```bash
# Kill the safe mode process
sudo pkill mysqld
# OR if using systemd:
sudo systemctl stop mysqld
sudo systemctl unset-environment MYSQLD_OPTS
```

### Step 6: Start MySQL Normally
```bash
sudo systemctl start mysqld
```

### Step 7: Login with New Password
```bash
sudo mysql -u root -p
# Enter: new_root_password
```

---

## Alternative: Create Database Without Root Password

If resetting password is too complicated, you can create the database using a different method:

### Option A: Use MySQL Root Socket (Sometimes Works)
```bash
sudo mysql --socket=/var/lib/mysql/mysql.sock -u root
```

### Option B: Create Database Directly via Systemd (Advanced)
This requires editing MySQL config, which is more complex.

---

## Recommended: Complete Setup After Password Reset

Once you can login with `sudo mysql -u root -p`, run:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'lms_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON lms_db.* TO 'lms_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SELECT user, host, plugin FROM mysql.user WHERE user = 'lms_user';
SHOW DATABASES LIKE 'lms_db';

-- Exit
EXIT;
```

Then update your `.env`:
```env
DATABASE_URL="mysql://lms_user:your_password_here@localhost:3306/lms_db"
```

