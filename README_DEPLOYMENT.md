# Growth AI - Deployment Documentation

## 📚 Documentation Index

This repository contains comprehensive deployment documentation for the Growth AI project.

### 📄 Files Overview

1. **`deploy.sh`** - Main deployment script
   - Automated end-to-end VPS deployment
   - Database installation and configuration
   - Application setup and process management

2. **`DEPLOYMENT.md`** - Complete deployment guide
   - Step-by-step instructions
   - Configuration details
   - Troubleshooting guide
   - Management commands

3. **`QUICK_START.md`** - Quick reference guide
   - Fast deployment steps
   - Common commands
   - Quick troubleshooting

4. **`PROJECT_AUDIT.md`** - Project audit report
   - Codebase review
   - Security assessment
   - Recommendations
   - Deployment readiness

5. **`env.template`** - Environment variables template
   - All required environment variables
   - Configuration examples
   - Setup instructions

## 🎯 Quick Navigation

### For First-Time Deployment
👉 Start with **`QUICK_START.md`** for a fast setup, then refer to **`DEPLOYMENT.md`** for details.

### For Detailed Setup
👉 Read **`DEPLOYMENT.md`** for comprehensive instructions.

### For Understanding the Project
👉 Review **`PROJECT_AUDIT.md`** to understand the codebase structure.

### For Configuration
👉 Use **`env.template`** as a reference for environment variables.

## 🚀 Deployment Workflow

```
1. Prepare VPS (Ubuntu 22.04)
   ↓
2. Upload project files
   ↓
3. Run deploy.sh script
   ↓
4. Configure environment variables
   ↓
5. Install SSL certificate
   ↓
6. Start applications
   ↓
7. Verify deployment
```

## 📋 Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] Ubuntu 22.04 LTS VPS (or similar)
- [ ] Root/sudo access
- [ ] Domain name pointing to VPS IP
- [ ] OpenAI API key
- [ ] Project files uploaded to VPS
- [ ] At least 2GB RAM and 20GB disk space

## 🔧 What the Deployment Script Does

The `deploy.sh` script automates:

1. ✅ System package updates
2. ✅ Node.js 20.x installation
3. ✅ MongoDB installation and configuration
4. ✅ Nginx installation and setup
5. ✅ PM2 installation for process management
6. ✅ Firewall configuration (UFW)
7. ✅ Application user creation
8. ✅ Directory structure setup
9. ✅ Backend deployment
10. ✅ Frontend deployment
11. ✅ Reverse proxy configuration
12. ✅ PM2 process setup

## 📝 Environment Variables

### Backend (`api-gateway-growth/.env`)

Required variables:
- `MONGODB` - MongoDB connection string
- `sessionSecret` - Session encryption secret
- `jwtSecret` - JWT token secret
- `jwtExpirationDate` - Token expiration (e.g., "7d")
- `OPENAI_API_KEY` - OpenAI API key (REQUIRED)
- `CORS_ORIGIN` - Frontend URL
- `PORT` - Backend port (default: 5000)

### Frontend (`growth-ai/.env.local`)

Required variables:
- `NEXT_PUBLIC_SERVER_URL` - Your domain URL
- `NEXT_PUBLIC_BASE_URL` - API base URL

See `env.template` for complete details.

## 🗄️ Database

MongoDB is automatically installed and configured with:
- Database: `growthai`
- User: `growthai_user`
- Password: Auto-generated (saved in `.mongo_credentials`)

## 🌐 Network Configuration

- **Backend**: `localhost:5000` (internal)
- **Frontend**: `localhost:3000` (internal)
- **Public**: `https://yourdomain.com` (via Nginx)

## 🔐 Security Features

- MongoDB authentication enabled
- JWT-based authentication
- Password hashing (bcrypt)
- CORS configuration
- SSL/TLS support (via Let's Encrypt)
- Firewall rules (UFW)

## 📊 Application Management

### PM2 Commands

```bash
# Status
sudo -u growthai pm2 status

# Logs
sudo -u growthai pm2 logs

# Restart
sudo -u growthai pm2 restart all

# Stop
sudo -u growthai pm2 stop all
```

### Service Management

```bash
# MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
```

## 🐛 Common Issues

### Application Won't Start
- Check PM2 logs: `sudo -u growthai pm2 logs`
- Verify environment variables
- Check port availability

### MongoDB Connection Failed
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check credentials in `.mongo_credentials`
- Review MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

### Nginx Errors
- Test configuration: `sudo nginx -t`
- Check error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify SSL certificates

## 📞 Support

For detailed troubleshooting, see:
- **`DEPLOYMENT.md`** - Troubleshooting section
- **`PROJECT_AUDIT.md`** - Project structure and recommendations

## 🔄 Updates

### Updating Backend

```bash
cd /var/www/growth-ai/api-gateway-growth
sudo -u growthai git pull
sudo -u growthai npm install --production
sudo -u growthai pm2 restart growth-ai-backend
```

### Updating Frontend

```bash
cd /var/www/growth-ai/growth-ai
sudo -u growthai git pull
sudo -u growthai npm install --legacy-peer-deps
sudo -u growthai npm run build
sudo -u growthai pm2 restart growth-ai-frontend
```

## 📈 Monitoring

### Logs Location

- Application logs: `/var/www/growth-ai/logs/`
- PM2 logs: `sudo -u growthai pm2 logs`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`

### Health Checks

- Backend: `http://localhost:5000/api/v1/health` (if implemented)
- Frontend: `http://localhost:3000`
- Public: `https://yourdomain.com`

## ✅ Post-Deployment Checklist

- [ ] Applications running (PM2 status)
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Database connection verified
- [ ] Frontend accessible
- [ ] API endpoints working
- [ ] Authentication flow tested
- [ ] Logs monitored for errors
- [ ] Backups configured
- [ ] Monitoring set up

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated**: $(date)
**Version**: 1.0.0

