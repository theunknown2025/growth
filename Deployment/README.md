# Deployment Modules

This directory contains modular deployment scripts for the Growth AI project.

## 📁 Structure

```
Deployment/
├── config.sh              # Shared configuration
├── utils.sh               # Shared utilities (logging, etc.)
├── deploy.sh              # Main deployment script (orchestrates all)
├── 01-system-update.sh    # System package updates
├── 02-nodejs.sh           # Node.js installation
├── 03-mongodb.sh          # MongoDB installation
├── 04-nginx.sh            # Nginx installation and configuration
├── 05-pm2.sh              # PM2 installation
├── 06-firewall.sh         # Firewall configuration
├── 07-user-setup.sh       # User and directory setup
├── 08-repository.sh       # GitHub repository cloning
├── 09-backend.sh          # Backend deployment
├── 10-frontend.sh         # Frontend deployment
├── 11-pm2-setup.sh        # PM2 process configuration
└── 12-ssl.sh              # SSL certificate setup
```

## 🚀 Usage

### Full Deployment (Recommended)

```bash
cd Deployment
chmod +x *.sh
sudo ./deploy.sh
```

### Individual Modules

You can run individual modules as needed:

```bash
# Update system only
sudo bash Deployment/01-system-update.sh

# Install Node.js only
sudo bash Deployment/02-nodejs.sh

# Configure Nginx only
sudo bash Deployment/04-nginx.sh
```

## ⚙️ Configuration

Edit `config.sh` to customize:

```bash
# Application settings
export DOMAIN_NAME="yourdomain.com"
export APP_USER="growthai"
export APP_DIR="/var/www/growth-ai"

# Ports
export BACKEND_PORT=5000
export FRONTEND_PORT=3000

# GitHub
export GITHUB_REPO="https://github.com/username/repo.git"
export GITHUB_BRANCH="main"
```

Or set environment variables before running:

```bash
export DOMAIN_NAME=yourdomain.com
export GITHUB_REPO=https://github.com/username/repo.git
sudo ./deploy.sh
```

## 📋 Module Details

### 01-system-update.sh
- Updates system packages
- Installs essential tools (curl, wget, git, build-essential, python3)

### 02-nodejs.sh
- Installs Node.js 20.x
- Updates npm to latest version

### 03-mongodb.sh
- Installs MongoDB 7.0
- Starts and enables MongoDB service

### 04-nginx.sh
- Installs Nginx
- Configures reverse proxy
- Sets up HTTP server configuration

### 05-pm2.sh
- Installs PM2 globally
- Configures PM2 startup script

### 06-firewall.sh
- Configures UFW firewall
- Opens necessary ports (22, 80, 443, 5000, 3000)

### 07-user-setup.sh
- Creates application user
- Sets up application directories
- Creates logs directory

### 08-repository.sh
- Clones project from GitHub
- Verifies repository structure
- Sets proper ownership

### 09-backend.sh
- Installs backend dependencies
- Creates .env file
- Configures backend environment

### 10-frontend.sh
- Installs frontend dependencies
- Creates .env.local file
- Builds Next.js application

### 11-pm2-setup.sh
- Creates PM2 ecosystem configs
- Starts backend and frontend
- Saves PM2 configuration

### 12-ssl.sh
- Installs Certbot
- Optionally installs SSL certificate
- Provides SSL setup instructions

## 🔧 Customization

### Run Specific Steps

```bash
# Just update system and install Node.js
sudo bash Deployment/01-system-update.sh
sudo bash Deployment/02-nodejs.sh

# Just configure Nginx
sudo bash Deployment/04-nginx.sh
```

### Skip Steps

Edit `deploy.sh` and comment out steps you don't need:

```bash
# Skip SSL setup
# bash "${SCRIPT_DIR}/12-ssl.sh"
```

## 📝 Notes

- All scripts must be run as root (use sudo)
- Scripts are designed to be idempotent (safe to run multiple times)
- Each module can be run independently
- Configuration is shared via `config.sh`
- Utilities are shared via `utils.sh`

## 🆘 Troubleshooting

If a specific module fails:

1. Check the module's output for errors
2. Run the module individually to see detailed errors
3. Check logs in `/var/www/growth-ai/logs/`
4. Verify configuration in `config.sh`

## ✅ Benefits of Modular Structure

- **Maintainability**: Easy to update individual components
- **Flexibility**: Run only what you need
- **Debugging**: Isolate issues to specific modules
- **Reusability**: Use modules in different deployment scenarios
- **Testing**: Test individual components independently

