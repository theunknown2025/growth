#!/bin/bash

################################################################################
# Growth AI - Main Deployment Script
# Orchestrates all deployment modules
################################################################################

set -e  # Exit on any error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load utilities and config
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Display welcome message
welcome() {
    echo ""
    log "========================================="
    log "Growth AI - Modular VPS Deployment"
    log "========================================="
    echo ""
    log "Configuration:"
    log "  Domain: ${DOMAIN_NAME}"
    log "  GitHub: ${GITHUB_REPO}"
    log "  Branch: ${GITHUB_BRANCH}"
    log "  App Directory: ${APP_DIR}"
    log "  Backend Port: ${BACKEND_PORT}"
    log "  Frontend Port: ${FRONTEND_PORT}"
    echo ""
}

# Run deployment modules
run_deployment() {
    log "Starting deployment process..."
    echo ""
    
    # System setup
    log "Step 1/12: System Update"
    bash "${SCRIPT_DIR}/01-system-update.sh"
    
    log "Step 2/12: Node.js Installation"
    bash "${SCRIPT_DIR}/02-nodejs.sh"
    
    log "Step 3/12: MongoDB Installation"
    bash "${SCRIPT_DIR}/03-mongodb.sh"
    
    log "Step 4/12: Nginx Installation"
    bash "${SCRIPT_DIR}/04-nginx.sh"
    
    log "Step 5/12: PM2 Installation"
    bash "${SCRIPT_DIR}/05-pm2.sh"
    
    log "Step 6/12: Firewall Configuration"
    bash "${SCRIPT_DIR}/06-firewall.sh"
    
    log "Step 7/12: User and Directory Setup"
    bash "${SCRIPT_DIR}/07-user-setup.sh"
    
    log "Step 8/12: Repository Setup"
    bash "${SCRIPT_DIR}/08-repository.sh"
    
    log "Step 9/12: Backend Deployment"
    bash "${SCRIPT_DIR}/09-backend.sh"
    
    log "Step 10/12: Frontend Deployment"
    bash "${SCRIPT_DIR}/10-frontend.sh"
    
    log "Step 11/12: PM2 Process Setup"
    bash "${SCRIPT_DIR}/11-pm2-setup.sh"
    
    log "Step 12/12: SSL Certificate Setup (Optional)"
    bash "${SCRIPT_DIR}/12-ssl.sh"
}

# Display summary
display_summary() {
    echo ""
    log "========================================="
    log "Deployment Summary"
    log "========================================="
    echo ""
    log "✓ System packages updated"
    log "✓ Node.js installed"
    log "✓ MongoDB installed and configured"
    log "✓ Nginx installed and configured"
    log "✓ PM2 installed and configured"
    log "✓ Firewall configured"
    log "✓ Applications deployed"
    echo ""
    log "MongoDB Credentials: ${APP_DIR}/.mongo_credentials"
    echo ""
    log "Next Steps:"
    log "1. Update backend .env with OpenAI API key:"
    log "   sudo nano ${BACKEND_DIR}/.env"
    log "2. Restart backend: sudo -u ${APP_USER} pm2 restart growth-ai-backend"
    log "3. Check status: sudo -u ${APP_USER} pm2 status"
    log "4. View logs: sudo -u ${APP_USER} pm2 logs"
    echo ""
    log "Backend URL: http://localhost:${BACKEND_PORT}"
    log "Frontend URL: http://localhost:${FRONTEND_PORT}"
    log "Public URL: http://${DOMAIN_NAME} (https:// after SSL)"
    echo ""
    log "Deployment completed successfully!"
    echo ""
}

# Main function
main() {
    check_root
    welcome
    run_deployment
    display_summary
}

# Run main function
main "$@"

