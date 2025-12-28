#!/bin/bash

################################################################################
# Growth AI - Frontend Deployment Module
# Deploys the frontend application
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Deploy frontend
deploy_frontend() {
    section_header "Frontend Deployment"
    
    if [ ! -d "${FRONTEND_DIR}" ]; then
        error "Frontend directory not found: ${FRONTEND_DIR}"
        exit 1
    fi
    
    cd ${FRONTEND_DIR}
    
    # Install dependencies
    if [ -f "package.json" ]; then
        log "Installing frontend dependencies..."
        
        # Check available memory
        AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        log "Available memory: ${AVAILABLE_MEM}MB"
        
        # If low memory, use memory-efficient install
        if [ "$AVAILABLE_MEM" -lt 1024 ]; then
            warning "Low memory detected (${AVAILABLE_MEM}MB). Using memory-efficient installation..."
            
            # Ensure swap is active
            if ! swapon --show | grep -q swapfile; then
                if [ -f /swapfile ]; then
                    log "Activating existing swap file..."
                    swapon /swapfile
                fi
            fi
            
            # Use memory-efficient npm install
            log "Installing with memory-efficient flags..."
            sudo -u ${APP_USER} npm install --legacy-peer-deps --no-optional --prefer-offline --no-audit || {
                error "Failed to install frontend dependencies"
                exit 1
            }
        else
            # Normal installation
            sudo -u ${APP_USER} npm install --legacy-peer-deps || {
                error "Failed to install frontend dependencies"
                exit 1
            }
        fi
        
        log "Frontend dependencies installed"
    else
        error "package.json not found in ${FRONTEND_DIR}"
        exit 1
    fi
    
    # Create .env.local file if it doesn't exist
    if [ ! -f "${FRONTEND_DIR}/.env.local" ]; then
        log "Creating frontend .env.local file..."
        cat > ${FRONTEND_DIR}/.env.local <<EOF
# API Configuration (use http:// for IP addresses, https:// for domains)
NEXT_PUBLIC_SERVER_URL=$(if [[ "${DOMAIN_NAME}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo "http://${DOMAIN_NAME}"; else echo "https://${DOMAIN_NAME}"; fi)
NEXT_PUBLIC_BASE_URL=$(if [[ "${DOMAIN_NAME}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo "http://${DOMAIN_NAME}/api"; else echo "https://${DOMAIN_NAME}/api"; fi)
EOF
        chown ${APP_USER}:${APP_USER} ${FRONTEND_DIR}/.env.local
        chmod 600 ${FRONTEND_DIR}/.env.local
        log "Frontend .env.local file created"
    else
        log "Frontend .env.local file already exists"
    fi
    
    # Build frontend
    log "Building frontend application (this may take a few minutes)..."
    sudo -u ${APP_USER} npm run build || {
        error "Frontend build failed"
        exit 1
    }
    
    log "Frontend deployment completed"
}

# Main function
main() {
    check_root
    deploy_frontend
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

