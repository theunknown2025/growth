# Growth AI - VPS Deployment Guide

This guide provides step-by-step instructions for deploying the Growth AI application on a VPS server.

## 📋 Prerequisites

- Ubuntu 22.04 LTS (or similar Debian-based distribution)
- Root or sudo access
- Domain name pointing to your VPS IP address
- OpenAI API key
- At least 2GB RAM and 20GB disk space

## 🚀 Quick Start

### 1. Prepare Your Server

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Set GitHub repository (recommended)
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export DOMAIN_NAME=yourdomain.com

# The deployment script will automatically clone from GitHub
# Or manually clone:
# git clone <your-repo-url> /var/www/growth-ai
```

### 2. Run Deployment Script

```bash
# Make script executable
chmod +x deploy.sh

# Set your domain name and GitHub repository
export DOMAIN_NAME=yourdomain.com
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git

# Optional: Set branch (defaults to 'main')
export GITHUB_BRANCH=main

# Run deployment script
sudo ./deploy.sh
```

**Note**: If `GITHUB_REPO` is not set, the script will use existing files in `/var/www/growth-ai`

The script will:
- ✅ Update system packages
- ✅ Install Node.js 20.x
- ✅ Install and configure MongoDB
- ✅ Install Nginx
- ✅ Install PM2
- ✅ Configure firewall
- ✅ Set up application directories
- ✅ Deploy backend and frontend
- ✅ Configure reverse proxy

### 3. Configure Environment Variables

#### Backend Configuration

Edit `/var/www/growth-ai/api-gateway-growth/.env`:

```bash
sudo nano /var/www/growth-ai/api-gateway-growth/.env
```

Required variables:
- `MONGODB` - MongoDB connection string
- `sessionSecret` - Random secret for sessions
- `jwtSecret` - Random secret for JWT tokens
- `OPENAI_API_KEY` - Your OpenAI API key (REQUIRED)
- `CORS_ORIGIN` - Your frontend URL
- `PORT` - Backend port (default: 5000)

#### Frontend Configuration

Edit `/var/www/growth-ai/growth-ai/.env.local`:

```bash
sudo nano /var/www/growth-ai/growth-ai/.env.local
```

Required variables:
- `NEXT_PUBLIC_SERVER_URL` - Your domain URL
- `NEXT_PUBLIC_BASE_URL` - API base URL (usually `https://yourdomain.com/api`)

### 4. Install SSL Certificate

```bash
# Install Certbot if not already installed
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts to complete SSL setup
```

After SSL installation, update Nginx config to uncomment SSL lines:

```bash
sudo nano /etc/nginx/sites-available/growth-ai
```

Uncomment these lines:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Start Applications

```bash
# Start backend
cd /var/www/growth-ai/api-gateway-growth
sudo -u growthai pm2 start ecosystem.config.js

# Start frontend
cd /var/www/growth-ai/growth-ai
sudo -u growthai pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u growthai pm2 save
```

## 📁 Project Structure

```
/var/www/growth-ai/
├── api-gateway-growth/      # Backend API
│   ├── .env                 # Backend environment variables
│   ├── app.js
│   ├── package.json
│   └── src/
├── growth-ai/               # Frontend Next.js app
│   ├── .env.local           # Frontend environment variables
│   ├── package.json
│   └── src/
├── logs/                    # Application logs
└── .mongo_credentials        # MongoDB credentials (secure)
```

## 🔧 Configuration Details

### MongoDB

- **Database Name**: `growthai`
- **Username**: `growthai_user`
- **Password**: Generated during deployment (saved in `.mongo_credentials`)
- **Connection**: `mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin`

To view MongoDB credentials:
```bash
sudo cat /var/www/growth-ai/.mongo_credentials
```

### Ports

- **Backend**: 5000 (internal)
- **Frontend**: 3000 (internal)
- **Nginx**: 80 (HTTP), 443 (HTTPS)

### Firewall

The script configures UFW to allow:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 5000 (Backend - internal)
- Port 3000 (Frontend - internal)

## 🛠️ Management Commands

### PM2 Commands

```bash
# View application status
sudo -u growthai pm2 status

# View logs
sudo -u growthai pm2 logs

# View specific app logs
sudo -u growthai pm2 logs growth-ai-backend
sudo -u growthai pm2 logs growth-ai-frontend

# Restart applications
sudo -u growthai pm2 restart all
sudo -u growthai pm2 restart growth-ai-backend
sudo -u growthai pm2 restart growth-ai-frontend

# Stop applications
sudo -u growthai pm2 stop all

# Delete applications from PM2
sudo -u growthai pm2 delete all
```

### MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Or with authentication
mongosh -u growthai_user -p --authenticationDatabase admin

# View databases
show dbs

# Use database
use growthai

# View collections
show collections
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx status
sudo systemctl status nginx
```

### Service Management

```bash
# MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod
sudo systemctl stop mongod
sudo systemctl start mongod

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
```

## 🔄 Updating the Application

### Update Backend

```bash
cd /var/www/growth-ai/api-gateway-growth
sudo -u growthai git pull  # If using Git
# Or upload new files

# Install new dependencies
sudo -u growthai npm install --production

# Restart application
sudo -u growthai pm2 restart growth-ai-backend
```

### Update Frontend

```bash
cd /var/www/growth-ai/growth-ai
sudo -u growthai git pull  # If using Git
# Or upload new files

# Install new dependencies
sudo -u growthai npm install --legacy-peer-deps

# Rebuild application
sudo -u growthai npm run build

# Restart application
sudo -u growthai pm2 restart growth-ai-frontend
```

## 🐛 Troubleshooting

### Application Not Starting

1. Check PM2 logs:
   ```bash
   sudo -u growthai pm2 logs
   ```

2. Check if ports are in use:
   ```bash
   sudo netstat -tulpn | grep -E ':(3000|5000)'
   ```

3. Verify environment variables:
   ```bash
   sudo cat /var/www/growth-ai/api-gateway-growth/.env
   sudo cat /var/www/growth-ai/growth-ai/.env.local
   ```

### MongoDB Connection Issues

1. Check MongoDB status:
   ```bash
   sudo systemctl status mongod
   ```

2. Check MongoDB logs:
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. Test connection:
   ```bash
   mongosh "mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin"
   ```

### Nginx Issues

1. Test configuration:
   ```bash
   sudo nginx -t
   ```

2. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Check access logs:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

### SSL Certificate Issues

1. Renew certificate:
   ```bash
   sudo certbot renew
   ```

2. Test renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

## 📊 Monitoring

### View Application Logs

```bash
# All logs
sudo -u growthai pm2 logs

# Backend logs
tail -f /var/www/growth-ai/logs/backend-out.log
tail -f /var/www/growth-ai/logs/backend-error.log

# Frontend logs
tail -f /var/www/growth-ai/logs/frontend-out.log
tail -f /var/www/growth-ai/logs/frontend-error.log
```

### System Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# MongoDB stats
mongosh --eval "db.stats()"
```

## 🔒 Security Best Practices

1. **Keep system updated**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. **Use strong passwords** for MongoDB and environment variables

3. **Restrict file permissions**:
   ```bash
   sudo chmod 600 /var/www/growth-ai/api-gateway-growth/.env
   sudo chmod 600 /var/www/growth-ai/growth-ai/.env.local
   sudo chmod 600 /var/www/growth-ai/.mongo_credentials
   ```

4. **Enable firewall** (already done by script):
   ```bash
   sudo ufw status
   ```

5. **Regular backups**:
   - MongoDB: Use `mongodump` for database backups
   - Application files: Backup `/var/www/growth-ai`

6. **Monitor logs** regularly for suspicious activity

## 📝 Environment Variables Reference

See `env.template` for a complete list of environment variables and their descriptions.

## 🆘 Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Ensure all services are running
4. Check firewall rules
5. Review this documentation

## 📄 License

This deployment script is provided as-is for the Growth AI project.

