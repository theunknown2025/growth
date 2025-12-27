#!/bin/bash

################################################################################
# Domain/IP Fix Script for Growth AI
# This script fixes CORS and API URL configuration issues
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="${VPS_IP:-172.166.106.2}"
DOMAIN_NAME="${DOMAIN_NAME:-yourdomain.com}"
APP_USER="${APP_USER:-growthai}"
BACKEND_DIR="/var/www/growth-ai/api-gateway-growth"
FRONTEND_DIR="/var/www/growth-ai/growth-ai"

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

# Fix frontend .env.local
fix_frontend_env() {
    log "Fixing frontend .env.local..."
    
    # Create or update .env.local
    cat > ${FRONTEND_DIR}/.env.local <<EOF
# Frontend Environment Variables
# Updated: $(date)

# Server URL (use IP address for direct access)
NEXT_PUBLIC_SERVER_URL=http://${VPS_IP}

# API Base URL (IMPORTANT: ends with /api, not /api/api)
NEXT_PUBLIC_BASE_URL=http://${VPS_IP}/api
EOF

    chown ${APP_USER}:${APP_USER} ${FRONTEND_DIR}/.env.local
    chmod 600 ${FRONTEND_DIR}/.env.local
    
    log "Frontend .env.local updated:"
    log "  NEXT_PUBLIC_SERVER_URL=http://${VPS_IP}"
    log "  NEXT_PUBLIC_BASE_URL=http://${VPS_IP}/api"
}

# Fix backend .env
fix_backend_env() {
    log "Fixing backend .env..."
    
    # Backup existing .env
    if [ -f "${BACKEND_DIR}/.env" ]; then
        cp ${BACKEND_DIR}/.env ${BACKEND_DIR}/.env.backup.$(date +%Y%m%d_%H%M%S)
        log "Backed up existing .env file"
    fi
    
    # Read existing .env or create new
    if [ -f "${BACKEND_DIR}/.env" ]; then
        # Update existing CORS_ORIGIN
        if grep -q "^CORS_ORIGIN=" ${BACKEND_DIR}/.env; then
            # Update existing line
            sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://${VPS_IP},https://${DOMAIN_NAME},http://localhost:3000|" ${BACKEND_DIR}/.env
            log "Updated existing CORS_ORIGIN"
        else
            # Add new line
            echo "" >> ${BACKEND_DIR}/.env
            echo "# CORS Configuration" >> ${BACKEND_DIR}/.env
            echo "CORS_ORIGIN=http://${VPS_IP},https://${DOMAIN_NAME},http://localhost:3000" >> ${BACKEND_DIR}/.env
            log "Added CORS_ORIGIN"
        fi
    else
        # Create new .env file
        warning ".env file not found, creating new one..."
        cat > ${BACKEND_DIR}/.env <<EOF
# Backend Environment Variables
# Generated: $(date)

# MongoDB Configuration (update with actual credentials)
MONGODB=mongodb://growthai_user:CHANGE_PASSWORD@localhost:27017/growthai?authSource=admin

# Session Secret
sessionSecret=$(openssl rand -base64 32)

# JWT Configuration
jwtSecret=$(openssl rand -base64 32)
jwtExpirationDate=7d

# OpenAI API Key (REQUIRED - Update this!)
OPENAI_API_KEY=your_openai_api_key_here

# CORS Configuration
CORS_ORIGIN=http://${VPS_IP},https://${DOMAIN_NAME},http://localhost:3000

# Server Port
PORT=5000
EOF
        log "Created new .env file"
    fi
    
    chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/.env
    chmod 600 ${BACKEND_DIR}/.env
    
    log "Backend .env updated:"
    log "  CORS_ORIGIN=http://${VPS_IP},https://${DOMAIN_NAME},http://localhost:3000"
}

# Verify app.js has CORS fix
verify_backend_cors() {
    log "Verifying backend CORS configuration in app.js..."
    
    if grep -q "172.166.106.2" ${BACKEND_DIR}/app.js 2>/dev/null; then
        log "Backend app.js already has IP in CORS check"
    else
        warning "Backend app.js might not have the CORS fix"
        warning "Make sure you've uploaded the updated app.js file"
    fi
}

# Restart backend
restart_backend() {
    log "Restarting backend..."
    
    # Check if PM2 is running
    if ! sudo -u ${APP_USER} pm2 ping >/dev/null 2>&1; then
        warning "PM2 not responding, starting fresh..."
        cd ${BACKEND_DIR}
        sudo -u ${APP_USER} pm2 start app.js --name growth-ai-backend || {
            error "Failed to start backend"
            return 1
        }
    else
        # Restart existing process
        sudo -u ${APP_USER} pm2 restart growth-ai-backend || {
            warning "Backend not found in PM2, starting new..."
            cd ${BACKEND_DIR}
            sudo -u ${APP_USER} pm2 start app.js --name growth-ai-backend
        }
    fi
    
    # Wait a moment
    sleep 2
    
    # Check status
    if sudo -u ${APP_USER} pm2 list | grep -q "growth-ai-backend.*online"; then
        log "Backend restarted successfully"
    else
        error "Backend might not be running, check logs:"
        error "sudo -u ${APP_USER} pm2 logs growth-ai-backend"
    fi
}

# Rebuild and restart frontend
rebuild_frontend() {
    log "Rebuilding frontend (this may take a few minutes)..."
    
    cd ${FRONTEND_DIR}
    
    # Rebuild Next.js app to pick up new environment variables
    sudo -u ${APP_USER} npm run build || {
        error "Frontend build failed"
        error "Check logs for errors"
        return 1
    }
    
    log "Frontend rebuilt successfully"
    
    # Restart frontend
    log "Restarting frontend..."
    
    if ! sudo -u ${APP_USER} pm2 ping >/dev/null 2>&1; then
        warning "PM2 not responding, starting fresh..."
        sudo -u ${APP_USER} pm2 start npm --name growth-ai-frontend -- start || {
            error "Failed to start frontend"
            return 1
        }
    else
        sudo -u ${APP_USER} pm2 restart growth-ai-frontend || {
            warning "Frontend not found in PM2, starting new..."
            sudo -u ${APP_USER} pm2 start npm --name growth-ai-frontend -- start
        }
    fi
    
    # Wait a moment
    sleep 2
    
    # Check status
    if sudo -u ${APP_USER} pm2 list | grep -q "growth-ai-frontend.*online"; then
        log "Frontend restarted successfully"
    else
        error "Frontend might not be running, check logs:"
        error "sudo -u ${APP_USER} pm2 logs growth-ai-frontend"
    fi
}

# Test CORS
test_cors() {
    log "Testing CORS configuration..."
    
    # Wait for services to be ready
    sleep 3
    
    # Test OPTIONS request
    RESPONSE=$(curl -s -X OPTIONS "http://${VPS_IP}/api/v1/users/register" \
        -H "Origin: http://${VPS_IP}" \
        -H "Access-Control-Request-Method: POST" \
        -w "\n%{http_code}" 2>/dev/null || echo "FAILED")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
        log "CORS test passed! (HTTP $HTTP_CODE)"
        return 0
    else
        warning "CORS test returned HTTP $HTTP_CODE"
        warning "This might be normal if Nginx is handling the request"
        return 1
    fi
}

# Display summary
display_summary() {
    log ""
    log "========================================="
    log "Configuration Fix Complete!"
    log "========================================="
    log ""
    log "Frontend Configuration:"
    log "  URL: http://${VPS_IP}"
    log "  API: http://${VPS_IP}/api"
    log ""
    log "Backend Configuration:"
    log "  CORS Origins: http://${VPS_IP}, https://${DOMAIN_NAME}"
    log ""
    log "Next Steps:"
    log "1. Verify backend is running: sudo -u ${APP_USER} pm2 status"
    log "2. Check backend logs: sudo -u ${APP_USER} pm2 logs growth-ai-backend"
    log "3. Check frontend logs: sudo -u ${APP_USER} pm2 logs growth-ai-frontend"
    log "4. Test registration in browser: http://${VPS_IP}"
    log ""
    log "If issues persist:"
    log "  - Check .env files are correct"
    log "  - Verify app.js has CORS fix"
    log "  - Check Nginx configuration"
    log ""
}

# Main function
main() {
    log "========================================="
    log "Growth AI - Domain/IP Fix Script"
    log "========================================="
    log ""
    
    check_root
    
    log "VPS IP: ${VPS_IP}"
    log "Domain: ${DOMAIN_NAME}"
    log ""
    
    # Fix configurations
    fix_frontend_env
    fix_backend_env
    verify_backend_cors
    
    # Restart services
    restart_backend
    rebuild_frontend
    
    # Test
    test_cors
    
    # Display summary
    display_summary
    
    log "Fix script completed!"
}

# Run main function
main

