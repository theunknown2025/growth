# Windows Deployment Guide - Using WinSCP and PuTTY

This guide will help you deploy the Growth AI project to your VPS using WinSCP (for file transfer) and PuTTY (for SSH commands).

## 📋 Prerequisites

- **WinSCP** installed ([Download here](https://winscp.net/eng/download.php))
- **PuTTY** installed ([Download here](https://www.putty.org/))
- VPS server with Ubuntu 22.04 (or similar)
- SSH access to your VPS
- Domain name pointing to your VPS IP (optional)

## 🔑 Step 1: Get Your VPS Credentials

You'll need:
- **VPS IP Address**: e.g., `123.45.67.89`
- **SSH Username**: Usually `root` or `ubuntu` or your custom user
- **SSH Password** or **Private Key** (if using key-based auth)
- **SSH Port**: Usually `22`

## 📁 Step 2: Connect with WinSCP

### 2.1 Open WinSCP

1. Launch **WinSCP**
2. You'll see the login dialog

### 2.2 Configure Connection

**Fill in the connection details:**

```
File protocol: SFTP
Host name: your-vps-ip-address
Port number: 22
User name: root (or your username)
Password: your-password
```

**Or if using SSH key:**
- Click "Advanced" → "SSH" → "Authentication"
- Select your private key file (.ppk)

### 2.3 Connect

1. Click **"Login"**
2. Accept the host key if prompted (click "Yes")
3. You should now see your VPS file system on the right side

## 📤 Step 3: Upload deploy.sh Script (Easiest Method!)

### 3.1 Upload Only deploy.sh

**On the VPS (right side of WinSCP):**
1. Navigate to `/root/` or `/home/your-username/`

**On your local machine (left side of WinSCP):**
1. Navigate to your project folder: `C:\Users\Dell\Desktop\Sora_digital\projects\Integral\Growth\Growth`
2. **Select only `deploy.sh`**
3. **Drag and drop** it to `/root/` on VPS

**That's it!** The script will automatically clone everything from GitHub.

### 3.2 Alternative: Upload All Files (If Needed)

If you prefer to upload all files manually:
1. Navigate to `/var/www/` on VPS
2. Create folder `growth-ai`
3. Upload all project files
4. The script will detect existing files and skip cloning

## 🖥️ Step 4: Connect with PuTTY

### 4.1 Open PuTTY

1. Launch **PuTTY**
2. You'll see the configuration window

### 4.2 Configure Connection

**Fill in:**
```
Host Name (or IP address): your-vps-ip-address
Port: 22
Connection type: SSH
```

**Optional Settings:**
- Click **"Connection" → "Data"** → Enter your username
- Click **"Connection" → "SSH" → "Auth"** → Browse for your private key (if using)

### 4.3 Save Session (Optional)

1. Enter a name in "Saved Sessions" (e.g., "Growth AI VPS")
2. Click **"Save"**
3. Next time, just double-click the saved session

### 4.4 Connect

1. Click **"Open"**
2. Enter your password when prompted
3. You should see the terminal prompt

## 🚀 Step 5: Run Deployment Script

### 5.1 Navigate to Script Location

```bash
# If you uploaded to /root/
cd /root

# Or if you uploaded to home directory
cd ~
```

### 5.2 Verify Script Is There

```bash
ls -la deploy.sh
```

You should see the `deploy.sh` file.

### 5.3 Make Script Executable

```bash
chmod +x deploy.sh
```

### 5.4 Set Environment Variables (Optional)

```bash
# Set your domain name (replace with your actual domain)
# If not set, defaults to 'yourdomain.com'
export DOMAIN_NAME=yourdomain.com

# Optional: Use different GitHub repository
# Default is: https://github.com/theunknown2025/growth.git
# export GITHUB_REPO=https://github.com/your-username/your-repo.git
```

### 5.5 Run Deployment Script

```bash
sudo ./deploy.sh
```

**The script will automatically:**
- Clone the project from GitHub (https://github.com/theunknown2025/growth.git)
- Install all dependencies
- Configure everything
- Deploy both applications

**No need to upload any other files!** Just the `deploy.sh` script.

**Note**: The script will:
- Install Node.js, MongoDB, Nginx, PM2
- Configure database
- Set up firewall
- Deploy applications
- Configure reverse proxy

**This will take 10-15 minutes** depending on your VPS speed.

## ⚙️ Step 6: Configure Environment Variables

After deployment, you need to configure your API keys.

### 6.1 Edit Backend .env

```bash
sudo nano /var/www/growth-ai/api-gateway-growth/.env
```

**Update these values:**
```env
# IMPORTANT: Update your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Update domain if needed
CORS_ORIGIN=https://yourdomain.com
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

### 6.2 Edit Frontend .env.local

```bash
sudo nano /var/www/growth-ai/growth-ai/.env.local
```

**Verify these values:**
```env
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com/api
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

## 🔒 Step 7: Install SSL Certificate

### 7.1 Install Certbot

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### 7.2 Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 7.3 Update Nginx Config

```bash
sudo nano /etc/nginx/sites-available/growth-ai
```

**Uncomment these lines** (remove the `#`):
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

**Save and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Step 8: Verify Deployment

### 8.1 Check Application Status

```bash
sudo -u growthai pm2 status
```

You should see:
- `growth-ai-backend` - online
- `growth-ai-frontend` - online

### 8.2 Check Logs

```bash
# View all logs
sudo -u growthai pm2 logs

# View specific app logs
sudo -u growthai pm2 logs growth-ai-backend
sudo -u growthai pm2 logs growth-ai-frontend
```

### 8.3 Test Application

**In your browser:**
- Visit: `https://yourdomain.com`
- Or: `http://your-vps-ip` (if no domain yet)

## 🔄 Step 9: Update Application (Future Updates)

### Method 1: Using Git (Recommended)

```bash
cd /var/www/growth-ai
sudo -u growthai git pull origin main

# Restart applications
sudo -u growthai pm2 restart all
```

### Method 2: Using WinSCP

1. **Upload new files** via WinSCP (overwrite existing)
2. **In PuTTY**, run:
   ```bash
   cd /var/www/growth-ai/api-gateway-growth
   sudo -u growthai npm install --production
   sudo -u growthai pm2 restart growth-ai-backend
   
   cd /var/www/growth-ai/growth-ai
   sudo -u growthai npm install --legacy-peer-deps
   sudo -u growthai npm run build
   sudo -u growthai pm2 restart growth-ai-frontend
   ```

## 🛠️ Common Commands Reference

### Application Management

```bash
# Check status
sudo -u growthai pm2 status

# Restart all
sudo -u growthai pm2 restart all

# View logs
sudo -u growthai pm2 logs

# Stop all
sudo -u growthai pm2 stop all
```

### Service Management

```bash
# MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t  # Test configuration
```

### View Logs

```bash
# Application logs
tail -f /var/www/growth-ai/logs/backend-out.log
tail -f /var/www/growth-ai/logs/frontend-out.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## 🐛 Troubleshooting

### Can't Connect with WinSCP/PuTTY

**Problem**: Connection refused or timeout

**Solutions**:
- Verify VPS IP address is correct
- Check if SSH port (22) is open in firewall
- Verify VPS is running
- Check if you're using the correct username/password

### Deployment Script Fails

**Problem**: Script errors during execution

**Solutions**:
- Check internet connection on VPS
- Verify you have root/sudo access
- Check error messages in the script output
- Ensure VPS has enough disk space (at least 5GB free)

### Application Won't Start

**Problem**: PM2 shows apps as "errored" or "stopped"

**Solutions**:
```bash
# Check logs
sudo -u growthai pm2 logs

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(3000|5000)'

# Verify environment variables
sudo cat /var/www/growth-ai/api-gateway-growth/.env
```

### MongoDB Connection Issues

**Problem**: Backend can't connect to MongoDB

**Solutions**:
```bash
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB credentials
sudo cat /var/www/growth-ai/.mongo_credentials

# Test connection
mongosh "mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin"
```

### Nginx Errors

**Problem**: Website not loading or 502 errors

**Solutions**:
```bash
# Test Nginx configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Verify backend/frontend are running
sudo -u growthai pm2 status
```

## 📝 Quick Reference Checklist

- [ ] WinSCP connected to VPS
- [ ] Files uploaded to `/var/www/growth-ai/`
- [ ] PuTTY connected to VPS
- [ ] Deployment script executed successfully
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Applications running (PM2 status)
- [ ] Website accessible

## 🔐 Security Tips

1. **Change default passwords** after first login
2. **Use SSH keys** instead of passwords (more secure)
3. **Keep system updated**: `sudo apt-get update && sudo apt-get upgrade`
4. **Don't commit `.env` files** to Git
5. **Use strong passwords** for MongoDB and application secrets
6. **Enable firewall**: Already done by deployment script
7. **Regular backups**: Backup MongoDB and application files

## 📞 Getting Help

If you encounter issues:

1. Check the logs (see Common Commands above)
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
3. Check [PROJECT_AUDIT.md](PROJECT_AUDIT.md) for project structure
4. Verify all environment variables are set correctly

---

**Your application should now be live at `https://yourdomain.com`!** 🎉


