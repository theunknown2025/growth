# Growth AI - Quick Start Deployment Guide

## 🚀 Fast Deployment (5 Minutes)

### Step 1: Set GitHub Repository (Recommended)

```bash
# Set your GitHub repository URL
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export DOMAIN_NAME=yourdomain.com
```

The deployment script will automatically clone from GitHub.

**Alternative**: If you prefer to upload files manually:
```bash
# On your local machine, upload project to VPS
scp -r . user@your-vps-ip:/var/www/growth-ai
```

### Step 2: Run Deployment Script

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /var/www/growth-ai

# Make script executable
chmod +x deploy.sh

# Set your domain (optional)
export DOMAIN_NAME=yourdomain.com

# Run deployment
sudo ./deploy.sh
```

### Step 3: Configure Environment Variables

```bash
# Edit backend .env
sudo nano /var/www/growth-ai/api-gateway-growth/.env

# IMPORTANT: Update these values:
# - OPENAI_API_KEY=your_actual_key
# - CORS_ORIGIN=https://yourdomain.com
# - MONGODB connection string (already set by script)

# Edit frontend .env.local
sudo nano /var/www/growth-ai/growth-ai/.env.local

# Update:
# - NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
# - NEXT_PUBLIC_BASE_URL=https://yourdomain.com/api
```

### Step 4: Install SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Update Nginx SSL Config

```bash
sudo nano /etc/nginx/sites-available/growth-ai
# Uncomment SSL certificate lines
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Verify Deployment

```bash
# Check PM2 status
sudo -u growthai pm2 status

# Check logs
sudo -u growthai pm2 logs

# Visit your domain
curl https://yourdomain.com
```

## ✅ Done!

Your application should now be running at `https://yourdomain.com`

## 🔧 Common Commands

```bash
# Restart applications
sudo -u growthai pm2 restart all

# View logs
sudo -u growthai pm2 logs

# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx

# View MongoDB credentials
sudo cat /var/www/growth-ai/.mongo_credentials
```

## 🆘 Troubleshooting

**Application not starting?**
```bash
sudo -u growthai pm2 logs
```

**MongoDB not connecting?**
```bash
sudo systemctl restart mongod
sudo cat /var/www/growth-ai/.mongo_credentials
```

**Nginx errors?**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

For detailed information, see `DEPLOYMENT.md`

