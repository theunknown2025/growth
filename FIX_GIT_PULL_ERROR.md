# Fix: Git Pull Error "fetch died of signal 9"

## Problem
The error "fetch died of signal 9" means the git process was killed, usually due to:
- Out of memory (OOM killer)
- Process timeout
- Large repository size
- System resource limits

## Solutions

### Solution 1: Increase Git Memory Limit (Recommended)

```bash
# Set git memory limit
git config --global pack.windowMemory "256m"
git config --global pack.packSizeLimit "2g"
git config --global pack.threads "1"

# Try pull again
cd /var/www/growth-ai
sudo -u growthai git pull origin main
```

### Solution 2: Use Shallow Clone (If Repository is Large)

```bash
# If pull still fails, use shallow fetch
cd /var/www/growth-ai
sudo -u growthai git fetch --depth=1 origin main
sudo -u growthai git reset --hard origin/main
```

### Solution 3: Manual File Update (Alternative)

If git continues to fail, manually update the files:

```bash
# Download specific file
cd /var/www/growth-ai/api-gateway-growth
sudo wget https://raw.githubusercontent.com/theunknown2025/growth/main/api-gateway-growth/app.js -O app.js
sudo chown growthai:growthai app.js
```

### Solution 4: Check System Resources

```bash
# Check available memory
free -h

# Check disk space
df -h

# If low on memory, restart services to free up memory
sudo -u growthai pm2 restart all
```

### Solution 5: Update Files Manually

Since you just need the CORS fix, you can manually update the file:

```bash
# Edit the file directly
sudo nano /var/www/growth-ai/api-gateway-growth/app.js
```

Then replace the CORS section (lines 23-27) with the updated code.

