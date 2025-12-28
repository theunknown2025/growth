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
        sudo -u ${APP_USER} npm install --legacy-peer-deps || {
            error "Failed to install frontend dependencies"
            exit 1
        }
        log "Frontend dependencies installed"
    else
        error "package.json not found in ${FRONTEND_DIR}"
        exit 1
    fi
    
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

