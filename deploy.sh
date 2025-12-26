#!/bin/bash

################################################################################
# Growth AI - Complete VPS Deployment Script
# This script performs end-to-end deployment including database setup
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration variables (modify these as needed)
DOMAIN_NAME="${DOMAIN_NAME:-yourdomain.com}"
APP_USER="${APP_USER:-growthai}"
APP_DIR="${APP_DIR:-/var/www/growth-ai}"
BACKEND_DIR="${APP_DIR}/api-gateway-growth"
FRONTEND_DIR="${APP_DIR}/growth-ai"
MONGO_DB_NAME="${MONGO_DB_NAME:-growthai}"
MONGO_USER="${MONGO_USER:-growthai_user}"
MONGO_PASSWORD="${MONGO_PASSWORD:-$(openssl rand -base64 32)}"
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# GitHub Configuration (defaults to the project repository)
# Format: https://github.com/username/repo-name.git
# Or: git@github.com:username/repo-name.git
GITHUB_REPO="${GITHUB_REPO:-https://github.com/theunknown2025/growth.git}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "Please run as root (use sudo)"
        exit 1
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y curl wget git build-essential software-properties-common
    log "System packages updated successfully"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        warning "Node.js is already installed: $NODE_VERSION"
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        log "Node.js installed: $(node -v)"
        log "npm installed: $(npm -v)"
    fi
}

# Install MongoDB
install_mongodb() {
    log "Installing MongoDB..."
    
    if command -v mongod &> /dev/null; then
        warning "MongoDB is already installed"
        return
    fi
    
    # Import MongoDB GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update and install
    apt-get update -y
    apt-get install -y mongodb-org
    
    # Start and enable MongoDB
    systemctl start mongod
    systemctl enable mongod
    
    log "MongoDB installed and started successfully"
    
    # Wait for MongoDB to be ready
    sleep 5
    
    # Configure MongoDB
    configure_mongodb
}

# Configure MongoDB
configure_mongodb() {
    log "Configuring MongoDB..."
    
    # Create MongoDB admin user and application database
    mongosh <<EOF
use admin
db.createUser({
  user: "${MONGO_USER}",
  pwd: "${MONGO_PASSWORD}",
  roles: [
    { role: "readWrite", db: "${MONGO_DB_NAME}" },
    { role: "dbAdmin", db: "${MONGO_DB_NAME}" }
  ]
})

use ${MONGO_DB_NAME}
db.createCollection("users")
db.createCollection("conversations")
db.createCollection("assignements")
db.createCollection("evaluations")

print("MongoDB configured successfully")
EOF

    # Enable authentication in MongoDB config
    if [ -f /etc/mongod.conf ]; then
        sed -i 's/#security:/security:\n  authorization: enabled/' /etc/mongod.conf
        systemctl restart mongod
        log "MongoDB authentication enabled"
    fi
    
    log "MongoDB configuration completed"
    log "Database: ${MONGO_DB_NAME}"
    log "User: ${MONGO_USER}"
    log "Password: ${MONGO_PASSWORD} (saved to ${APP_DIR}/.mongo_credentials)"
    
    # Save credentials
    mkdir -p "${APP_DIR}"
    echo "MONGO_DB_NAME=${MONGO_DB_NAME}" > "${APP_DIR}/.mongo_credentials"
    echo "MONGO_USER=${MONGO_USER}" >> "${APP_DIR}/.mongo_credentials"
    echo "MONGO_PASSWORD=${MONGO_PASSWORD}" >> "${APP_DIR}/.mongo_credentials"
    chmod 600 "${APP_DIR}/.mongo_credentials"
}

# Install Nginx
install_nginx() {
    log "Installing Nginx..."
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log "Nginx installed and started"
}

# Install PM2
install_pm2() {
    log "Installing PM2..."
    if command -v pm2 &> /dev/null; then
        warning "PM2 is already installed"
    else
        npm install -g pm2
        pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
        log "PM2 installed and configured"
    fi
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    if command -v ufw &> /dev/null; then
        ufw --force enable
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow ${BACKEND_PORT}/tcp
        ufw allow ${FRONTEND_PORT}/tcp
        log "Firewall configured"
    else
        warning "UFW not found, skipping firewall configuration"
    fi
}

# Create application user
create_app_user() {
    log "Creating application user..."
    if id "${APP_USER}" &>/dev/null; then
        warning "User ${APP_USER} already exists"
    else
        useradd -m -s /bin/bash ${APP_USER}
        log "User ${APP_USER} created"
    fi
}

# Setup application directory
setup_app_directory() {
    log "Setting up application directory..."
    mkdir -p ${APP_DIR}
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
    log "Application directory created: ${APP_DIR}"
}

# Clone from GitHub
clone_from_github() {
    log "Setting up project from GitHub: ${GITHUB_REPO}"
    
    # Check if directory already exists and has content
    if [ -d "${APP_DIR}/.git" ]; then
        warning "Git repository already exists in ${APP_DIR}"
        log "Pulling latest changes from GitHub..."
        cd ${APP_DIR}
        sudo -u ${APP_USER} git pull origin ${GITHUB_BRANCH} || {
            warning "Git pull failed, continuing with existing files"
        }
        return
    fi
    
    # If directory exists with files but no .git, backup and remove
    if [ -d "${APP_DIR}" ] && [ "$(ls -A ${APP_DIR} 2>/dev/null)" ]; then
        warning "Directory ${APP_DIR} exists with files"
        log "Backing up existing directory..."
        BACKUP_DIR="${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        mv ${APP_DIR} ${BACKUP_DIR}
        warning "Existing directory backed up to: ${BACKUP_DIR}"
    fi
    
    # Remove directory if it exists but is empty
    if [ -d "${APP_DIR}" ]; then
        rmdir ${APP_DIR} 2>/dev/null || true
    fi
    
    # Clone the repository
    cd $(dirname ${APP_DIR})
    log "Cloning repository to ${APP_DIR}..."
    
    if ! git clone -b ${GITHUB_BRANCH} ${GITHUB_REPO} ${APP_DIR} 2>/dev/null; then
        error "Failed to clone from GitHub: ${GITHUB_REPO}"
        error "Please check:"
        error "  1. Internet connection"
        error "  2. Repository URL is correct"
        error "  3. Repository is accessible (public or you have access)"
        exit 1
    fi
    
    # Set ownership
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
    
    log "Repository cloned successfully"
    
    # Verify required directories exist
    if [ ! -d "${BACKEND_DIR}" ]; then
        error "Backend directory not found: ${BACKEND_DIR}"
        error "Please ensure the repository structure is correct"
        exit 1
    fi
    
    if [ ! -d "${FRONTEND_DIR}" ]; then
        error "Frontend directory not found: ${FRONTEND_DIR}"
        error "Please ensure the repository structure is correct"
        exit 1
    fi
    
    log "Repository structure verified"
}

# Deploy backend
deploy_backend() {
    log "Deploying backend..."
    
    cd ${BACKEND_DIR}
    
    # Copy package files if they exist
    if [ -f "package.json" ]; then
        log "Installing backend dependencies..."
        sudo -u ${APP_USER} npm install --production
    else
        warning "package.json not found in ${BACKEND_DIR}"
        warning "Please ensure backend code is in ${BACKEND_DIR}"
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f "${BACKEND_DIR}/.env" ]; then
        log "Creating backend .env file..."
        cat > ${BACKEND_DIR}/.env <<EOF
# MongoDB Configuration
MONGODB=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:27017/${MONGO_DB_NAME}?authSource=admin

# Session Secret (change this!)
sessionSecret=$(openssl rand -base64 32)

# JWT Configuration
jwtSecret=$(openssl rand -base64 32)
jwtExpirationDate=7d

# OpenAI API Key (REQUIRED - Update this!)
OPENAI_API_KEY=your_openai_api_key_here

# CORS Configuration
CORS_ORIGIN=https://${DOMAIN_NAME}

# Server Port
PORT=${BACKEND_PORT}
EOF
        chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/.env
        chmod 600 ${BACKEND_DIR}/.env
        warning "Backend .env file created. Please update OPENAI_API_KEY!"
    fi
    
    log "Backend deployment completed"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend..."
    
    cd ${FRONTEND_DIR}
    
    # Copy package files if they exist
    if [ -f "package.json" ]; then
        log "Installing frontend dependencies..."
        sudo -u ${APP_USER} npm install --legacy-peer-deps
        
        # Create .env.local file if it doesn't exist
        if [ ! -f "${FRONTEND_DIR}/.env.local" ]; then
            log "Creating frontend .env.local file..."
            cat > ${FRONTEND_DIR}/.env.local <<EOF
# API Configuration
NEXT_PUBLIC_SERVER_URL=https://${DOMAIN_NAME}
NEXT_PUBLIC_BASE_URL=https://${DOMAIN_NAME}/api
EOF
            chown ${APP_USER}:${APP_USER} ${FRONTEND_DIR}/.env.local
            chmod 600 ${FRONTEND_DIR}/.env.local
        fi
        
        log "Building frontend..."
        sudo -u ${APP_USER} npm run build
    else
        warning "package.json not found in ${FRONTEND_DIR}"
        warning "Please ensure frontend code is in ${FRONTEND_DIR}"
    fi
    
    log "Frontend deployment completed"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/growth-ai <<EOF
# Backend API
upstream backend {
    server localhost:${BACKEND_PORT};
}

# Frontend
upstream frontend {
    server localhost:${FRONTEND_PORT};
}

# HTTP Server (initial setup - before SSL)
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
    
    # For Let's Encrypt certificate generation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API routes
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Documents (static files from backend)
    location /documents {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Increase body size for file uploads
    client_max_body_size 50M;
}

# HTTPS Server (uncomment after SSL certificate installation)
# After running: certbot --nginx -d ${DOMAIN_NAME}
# Then uncomment the lines below and comment out the HTTP server above
#
# server {
#     listen 80;
#     server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
#     
#     location /.well-known/acme-challenge/ {
#         root /var/www/html;
#     }
#     
#     location / {
#         return 301 https://\$server_name\$request_uri;
#     }
# }
#
# server {
#     listen 443 ssl http2;
#     server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
#     
#     ssl_certificate /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem;
#     
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     
#     # API routes
#     location /api {
#         proxy_pass http://backend;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#         proxy_read_timeout 300s;
#         proxy_connect_timeout 75s;
#     }
#     
#     # Documents (static files from backend)
#     location /documents {
#         proxy_pass http://backend;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#     }
#     
#     # Frontend
#     location / {
#         proxy_pass http://frontend;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#     }
#     
#     # Increase body size for file uploads
#     client_max_body_size 50M;
# }
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/growth-ai /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t
    systemctl reload nginx
    
    log "Nginx configured successfully"
}

# Setup PM2 processes
setup_pm2() {
    log "Setting up PM2 processes..."
    
    # Backend PM2 config
    cat > ${BACKEND_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'growth-ai-backend',
    script: 'app.js',
    cwd: '${BACKEND_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${BACKEND_PORT}
    },
    error_file: '${APP_DIR}/logs/backend-error.log',
    out_file: '${APP_DIR}/logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
EOF

    # Frontend PM2 config
    cat > ${FRONTEND_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'growth-ai-frontend',
    script: 'npm',
    args: 'start',
    cwd: '${FRONTEND_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${FRONTEND_PORT}
    },
    error_file: '${APP_DIR}/logs/frontend-error.log',
    out_file: '${APP_DIR}/logs/frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

    # Create logs directory
    mkdir -p ${APP_DIR}/logs
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}/logs
    
    # Start applications with PM2
    cd ${BACKEND_DIR}
    sudo -u ${APP_USER} pm2 start ecosystem.config.js
    sudo -u ${APP_USER} pm2 save
    
    cd ${FRONTEND_DIR}
    sudo -u ${APP_USER} pm2 start ecosystem.config.js
    sudo -u ${APP_USER} pm2 save
    
    log "PM2 processes configured and started"
}

# Install SSL certificate (optional)
install_ssl() {
    log "Setting up SSL certificate..."
    
    if command -v certbot &> /dev/null; then
        warning "Certbot is already installed"
    else
        apt-get install -y certbot python3-certbot-nginx
        log "Certbot installed"
    fi
    
    warning "To install SSL certificate, run:"
    warning "certbot --nginx -d ${DOMAIN_NAME} -d www.${DOMAIN_NAME}"
    warning "After installation, update Nginx config to uncomment SSL lines"
}

# Main deployment function
main() {
    log "========================================="
    log "Growth AI - VPS Deployment Script"
    log "========================================="
    log ""
    
    check_root
    
    log "Starting deployment process..."
    log "Domain: ${DOMAIN_NAME}"
    log "GitHub Repository: ${GITHUB_REPO}"
    log "Branch: ${GITHUB_BRANCH}"
    log "App Directory: ${APP_DIR}"
    log "Backend Port: ${BACKEND_PORT}"
    log "Frontend Port: ${FRONTEND_PORT}"
    log ""
    
    update_system
    install_nodejs
    install_mongodb
    install_nginx
    install_pm2
    configure_firewall
    create_app_user
    setup_app_directory
    
    log ""
    log "========================================="
    log "Repository Setup"
    log "========================================="
    log ""
    
    # Always clone from GitHub (default repository is set)
    clone_from_github
    
    deploy_backend
    deploy_frontend
    configure_nginx
    setup_pm2
    
    log ""
    log "========================================="
    log "Deployment Summary"
    log "========================================="
    log ""
    log "✓ System packages updated"
    log "✓ Node.js installed"
    log "✓ MongoDB installed and configured"
    log "✓ Nginx installed and configured"
    log "✓ PM2 installed and configured"
    log "✓ Applications deployed"
    log ""
    log "MongoDB Credentials saved to: ${APP_DIR}/.mongo_credentials"
    log ""
    log "Next Steps:"
    log "1. Update backend .env file with your OpenAI API key:"
    log "   sudo nano ${BACKEND_DIR}/.env"
    log "2. Restart backend: sudo -u ${APP_USER} pm2 restart growth-ai-backend"
    log "3. Install SSL certificate: sudo certbot --nginx -d ${DOMAIN_NAME}"
    log "   (Certbot will automatically update Nginx config for SSL)"
    log "4. Check application status: sudo -u ${APP_USER} pm2 status"
    log "5. View logs: sudo -u ${APP_USER} pm2 logs"
    log ""
    log "Backend URL: http://localhost:${BACKEND_PORT}"
    log "Frontend URL: http://localhost:${FRONTEND_PORT}"
    log "Public URL: http://${DOMAIN_NAME} (https:// after SSL setup)"
    log ""
    log "Deployment completed successfully!"
}

# Run main function
main

