# MongoDB Database Setup Guide

This guide explains how to use the `database.sh` script to install MongoDB and set up the database for the Growth AI application.

## 📋 Overview

The `database.sh` script automates:
- MongoDB installation
- Database creation
- User creation with proper permissions
- Collection creation
- Index creation for performance
- Authentication setup
- Connection testing

## 🚀 Quick Start

### Step 1: Upload Script

**Using WinSCP:**
1. Upload `database.sh` to `/root/` on your VPS

### Step 2: Run Script

**Using PuTTY:**
```bash
chmod +x database.sh
sudo ./database.sh
```

That's it! The script handles everything automatically.

## ⚙️ Configuration

### Environment Variables (Optional)

You can customize the setup before running:

```bash
# Set custom database name
export MONGO_DB_NAME=my_custom_db

# Set custom username
export MONGO_USER=my_user

# Set custom password (or let script generate one)
export MONGO_PASSWORD=my_secure_password

# Run script
sudo ./database.sh
```

### Default Values

If not specified, the script uses:
- **Database Name**: `growthai`
- **Username**: `growthai_user`
- **Password**: Auto-generated (32 character random string)
- **Port**: `27017`
- **Host**: `localhost`

## 📊 What the Script Does

### 1. Checks MongoDB Installation

- Checks if MongoDB is already installed
- If installed, asks if you want to proceed with database setup
- If not installed, proceeds with installation

### 2. Installs MongoDB (if needed)

- Detects OS (Ubuntu/Debian)
- Adds MongoDB repository
- Installs MongoDB 7.0
- Configures service

### 3. Configures MongoDB

- Creates data and log directories
- Sets proper permissions
- Starts MongoDB service
- Enables auto-start on boot

### 4. Creates Database and User

- Creates database: `growthai`
- Creates user with read/write permissions
- Grants database admin role

### 5. Creates Collections

Automatically creates all required collections:
- `users`
- `assignements`
- `conversations`
- `simpletests`
- `advancedtests`
- `companydetails`

### 6. Creates Indexes

Creates performance indexes on:
- **users**: username, email, role
- **assignements**: owner, assignedTo, type, status, createdAt
- **conversations**: userId, createdAt
- **simpletests**: user, status, createdAt
- **advancedtests**: user, status, createdAt
- **companydetails**: user (unique)

### 7. Enables Authentication

- Configures MongoDB to require authentication
- Restarts MongoDB service
- Verifies authentication is working

### 8. Tests Connection

- Tests connection with credentials
- Verifies database access
- Confirms all collections exist

### 9. Saves Credentials

- Saves credentials to `/root/.mongo_credentials`
- Also saves to `/var/www/growth-ai/.mongo_credentials` (if directory exists)
- Sets secure file permissions (600)

## 📝 Output

After running the script, you'll see:

```
=========================================
MongoDB Setup Complete!
=========================================

Database Information:
  Database Name: growthai
  Username: growthai_user
  Password: [auto-generated]
  Host: localhost
  Port: 27017

Connection String:
  mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin

Credentials saved to: /root/.mongo_credentials
```

## 🔗 Connecting Your Application

### Update Backend .env File

```bash
sudo nano /var/www/growth-ai/api-gateway-growth/.env
```

Add or update:
```env
MONGODB=mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin
```

**Get the connection string:**
```bash
cat /root/.mongo_credentials | grep MONGODB
```

### Test Connection from Application

```bash
# Restart backend
sudo -u growthai pm2 restart growth-ai-backend

# Check logs
sudo -u growthai pm2 logs growth-ai-backend
```

## 🔍 Viewing Credentials

```bash
# View credentials
cat /root/.mongo_credentials

# Or if app directory exists
cat /var/www/growth-ai/.mongo_credentials
```

## 🛠️ Manual Database Operations

### Connect to MongoDB

```bash
# Connect with authentication
mongosh "mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin"

# Or connect and authenticate
mongosh
use admin
db.auth("growthai_user", "password")
use growthai
```

### View Collections

```bash
mongosh "mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin" <<EOF
use growthai
show collections
EOF
```

### View Database Stats

```bash
mongosh "mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin" <<EOF
use growthai
db.stats()
EOF
```

### Backup Database

```bash
# Create backup
mongodump --uri="mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin" --out=/backup/mongodb-$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin" /backup/mongodb-20251226
```

## 🔄 Re-running the Script

If you need to re-run the script:

1. **If MongoDB is installed**: Script will skip installation and proceed with database setup
2. **If user exists**: Script will update the password and roles
3. **If collections exist**: Script will create indexes (won't duplicate)

## 🐛 Troubleshooting

### MongoDB Won't Start

```bash
# Check status
sudo systemctl status mongod

# View logs
sudo journalctl -u mongod -n 50

# Check configuration
sudo mongosh --eval "db.adminCommand('getCmdLineOpts')"
```

### Authentication Issues

```bash
# Test connection
mongosh "mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin"

# Check user exists
mongosh "mongodb://growthai_user:password@localhost:27017/admin" <<EOF
use admin
db.getUser("growthai_user")
EOF
```

### Permission Issues

```bash
# Check MongoDB data directory permissions
ls -la /var/lib/mongodb

# Fix permissions if needed
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
```

### Connection String Issues

Make sure the connection string format is correct:
```
mongodb://username:password@host:port/database?authSource=admin
```

## 🔐 Security Best Practices

1. **Strong Passwords**: Use auto-generated passwords or strong custom passwords
2. **File Permissions**: Credentials file has 600 permissions (read/write owner only)
3. **Authentication**: Always enabled in production
4. **Network Security**: MongoDB only listens on localhost by default
5. **Regular Backups**: Set up automated backups

## 📚 Related Documentation

- **[DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)** - Complete database schema documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Full deployment guide (includes MongoDB setup)

## ✅ Verification Checklist

After running the script, verify:

- [ ] MongoDB service is running: `sudo systemctl status mongod`
- [ ] Can connect with credentials: Test connection command works
- [ ] Collections exist: All 6 collections are created
- [ ] Indexes exist: Indexes are created on key fields
- [ ] Credentials saved: File exists at `/root/.mongo_credentials`
- [ ] Application connects: Backend can connect to database

---

**Ready to use!** Your MongoDB database is set up and ready for the Growth AI application.

