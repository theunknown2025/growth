# Fix: npm install "Killed" Error (Memory Issues)

## Problem
The error `Killed` during `npm install` means the process was terminated by the system due to low memory (OOM killer).

## Quick Fix

### Option 1: Create Swap Space (Recommended)

```bash
# Check current memory
free -h

# Create 4GB swap file
sudo fallocate -l 4G /swapfile
# Or if fallocate doesn't work:
# sudo dd if=/dev/zero of=/swapfile bs=1024 count=4194304

# Set permissions
sudo chmod 600 /swapfile

# Make swap
sudo mkswap /swapfile

# Enable swap
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
swapon --show
```

### Option 2: Use Memory-Efficient npm Install

```bash
cd /var/www/growth-ai/api-gateway-growth
sudo -u growthai npm install --production --no-optional --prefer-offline --no-audit
```

### Option 3: Install in Smaller Batches

```bash
# Clear npm cache first
sudo -u growthai npm cache clean --force

# Install with reduced parallelism
sudo -u growthai NODE_OPTIONS="--max-old-space-size=512" npm install --production
```

## For Frontend

```bash
cd /var/www/growth-ai/growth-ai
sudo -u growthai npm install --legacy-peer-deps --no-optional --prefer-offline --no-audit
```

## Check System Resources

```bash
# Check memory
free -h

# Check disk space
df -h

# Check what's using memory
ps aux --sort=-%mem | head -10
```

## Stop Unnecessary Services

If memory is very low, temporarily stop services:

```bash
# Stop MongoDB (if not needed immediately)
sudo systemctl stop mongod

# Stop Nginx (if not needed immediately)
sudo systemctl stop nginx

# After installation, restart them
sudo systemctl start mongod
sudo systemctl start nginx
```

## Updated Scripts

The deployment scripts (`09-backend.sh` and `10-frontend.sh`) now automatically:
- Check available memory
- Create swap space if needed
- Use memory-efficient flags when memory is low

## Manual Installation After Fix

Once swap is created, you can manually install:

```bash
# Backend
cd /var/www/growth-ai/api-gateway-growth
sudo -u growthai npm install --production

# Frontend
cd /var/www/growth-ai/growth-ai
sudo -u growthai npm install --legacy-peer-deps
sudo -u growthai npm run build
```

