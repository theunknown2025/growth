# Windows Quick Start - WinSCP & PuTTY Deployment

## 🚀 Fast Deployment (10 Minutes)

### Step 1: Connect with WinSCP

1. **Open WinSCP**
2. **Enter connection details:**
   ```
   Host: your-vps-ip
   Username: root
   Password: your-password
   ```
3. **Click "Login"**

### Step 2: Upload Files

**Option A: Upload via WinSCP**
1. **Left side**: Navigate to your project folder
2. **Right side**: Navigate to `/var/www/`
3. **Create folder**: `growth-ai` (if needed)
4. **Select all files** and **drag to** `/var/www/growth-ai/`

**Option B: Clone from GitHub (Easier)**
- Skip file upload, use Git clone in PuTTY (see Step 3)

### Step 3: Connect with PuTTY

1. **Open PuTTY**
2. **Enter**: `your-vps-ip`
3. **Click "Open"**
4. **Login** with username/password

### Step 4: Run Deployment

```bash
# Navigate to project
cd /var/www/growth-ai

# If files not uploaded, clone from GitHub:
git clone https://github.com/theunknown2025/growth.git .

# Make script executable
chmod +x deploy.sh

# Set domain
export DOMAIN_NAME=yourdomain.com

# Run deployment
sudo ./deploy.sh
```

**Wait 10-15 minutes** for installation to complete.

### Step 5: Configure API Keys

```bash
# Edit backend .env
sudo nano /var/www/growth-ai/api-gateway-growth/.env

# Update OPENAI_API_KEY with your actual key
# Save: Ctrl+X, Y, Enter
```

### Step 6: Install SSL

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 7: Verify

```bash
# Check status
sudo -u growthai pm2 status

# Visit your website
# https://yourdomain.com
```

## ✅ Done!

Your application is now live!

## 🔧 Common Commands

```bash
# Restart apps
sudo -u growthai pm2 restart all

# View logs
sudo -u growthai pm2 logs

# Check MongoDB
sudo systemctl status mongod
```

## 🆘 Problems?

- **Can't connect?** Check IP, username, password
- **Script fails?** Check error messages
- **App won't start?** Check logs: `sudo -u growthai pm2 logs`

See [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) for detailed guide.


