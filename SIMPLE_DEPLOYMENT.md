# Simple Deployment Guide - Upload deploy.sh and Run

This is the **easiest way** to deploy: Just upload `deploy.sh` to your VPS and run it!

## 🚀 Super Simple Steps

### Step 1: Upload deploy.sh to VPS Root

**Using WinSCP:**
1. Open **WinSCP**
2. Connect to your VPS:
   - Host: `your-vps-ip`
   - Username: `root`
   - Password: `your-password`
3. **Right side (VPS)**: Navigate to `/root/` or `/home/your-username/`
4. **Left side (Local)**: Navigate to your project folder
5. **Drag `deploy.sh`** to the VPS root folder

### Step 2: Connect with PuTTY

1. Open **PuTTY**
2. Enter your VPS IP
3. Click **"Open"**
4. Login with username/password

### Step 3: Run the Script

```bash
# Make script executable
chmod +x deploy.sh

# Set your domain (optional, defaults to yourdomain.com)
export DOMAIN_NAME=yourdomain.com

# Run the deployment script
sudo ./deploy.sh
```

**That's it!** The script will:
- ✅ Install Node.js, MongoDB, Nginx, PM2
- ✅ Clone the project from GitHub automatically
- ✅ Configure everything
- ✅ Deploy both backend and frontend
- ✅ Set up reverse proxy

**Takes about 10-15 minutes** - just wait for it to complete!

## 📝 After Deployment

### 1. Configure OpenAI API Key

```bash
sudo nano /var/www/growth-ai/api-gateway-growth/.env
```

Update the `OPENAI_API_KEY` line with your actual key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 2. Restart Backend

```bash
sudo -u growthai pm2 restart growth-ai-backend
```

### 3. Install SSL Certificate (Optional but Recommended)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4. Update Nginx for SSL

```bash
sudo nano /etc/nginx/sites-available/growth-ai
```

Uncomment these lines (remove the `#`):
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

Then reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Verify Everything Works

```bash
# Check application status
sudo -u growthai pm2 status

# View logs if needed
sudo -u growthai pm2 logs

# Visit your website
# https://yourdomain.com
```

## 🔧 Quick Commands

```bash
# Restart applications
sudo -u growthai pm2 restart all

# View logs
sudo -u growthai pm2 logs

# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx
```

## 🎯 What the Script Does Automatically

1. **Updates system** packages
2. **Installs Node.js 20.x**
3. **Installs MongoDB 7.0** with authentication
4. **Installs Nginx** web server
5. **Installs PM2** process manager
6. **Configures firewall** (UFW)
7. **Creates application user** (`growthai`)
8. **Clones project from GitHub** (https://github.com/theunknown2025/growth.git)
9. **Installs dependencies** for both backend and frontend
10. **Builds frontend** application
11. **Configures Nginx** reverse proxy
12. **Starts applications** with PM2
13. **Saves MongoDB credentials** to `/var/www/growth-ai/.mongo_credentials`

## ⚙️ Customization (Optional)

You can customize before running:

```bash
# Set custom domain
export DOMAIN_NAME=mycustomdomain.com

# Use different GitHub repository
export GITHUB_REPO=https://github.com/username/repo.git

# Use different branch
export GITHUB_BRANCH=production

# Then run
sudo ./deploy.sh
```

## 🐛 Troubleshooting

### Script Fails to Clone from GitHub

**Problem**: "Failed to clone from GitHub"

**Solution**:
- Check internet connection on VPS: `ping google.com`
- Verify repository URL is correct
- If repository is private, use SSH URL: `export GITHUB_REPO=git@github.com:username/repo.git`

### Application Won't Start

**Problem**: PM2 shows apps as "errored"

**Solution**:
```bash
# Check logs
sudo -u growthai pm2 logs

# Check if OpenAI API key is set
sudo cat /var/www/growth-ai/api-gateway-growth/.env | grep OPENAI_API_KEY
```

### Port Already in Use

**Problem**: "Port 5000 or 3000 already in use"

**Solution**:
```bash
# Check what's using the port
sudo netstat -tulpn | grep -E ':(3000|5000)'

# Kill the process or change ports in deploy.sh
```

## 📋 Complete Command Sequence

Here's everything in one go:

```bash
# 1. Upload deploy.sh via WinSCP to /root/

# 2. In PuTTY, run:
chmod +x deploy.sh
export DOMAIN_NAME=yourdomain.com
sudo ./deploy.sh

# 3. After deployment completes:
sudo nano /var/www/growth-ai/api-gateway-growth/.env
# Update OPENAI_API_KEY

# 4. Restart backend:
sudo -u growthai pm2 restart growth-ai-backend

# 5. Install SSL:
sudo certbot --nginx -d yourdomain.com

# 6. Update Nginx SSL config:
sudo nano /etc/nginx/sites-available/growth-ai
# Uncomment SSL lines
sudo nginx -t && sudo systemctl reload nginx

# 7. Verify:
sudo -u growthai pm2 status
```

## ✅ That's It!

Your application is now live! Visit `https://yourdomain.com` to see it.

---

**Note**: The script automatically clones from `https://github.com/theunknown2025/growth.git` by default. No need to upload any other files!

