#!/bin/bash

################################################################################
# Growth AI - Backend Deployment Module
# Deploys the backend application
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Deploy backend
deploy_backend() {
    section_header "Backend Deployment"
    
    if [ ! -d "${BACKEND_DIR}" ]; then
        error "Backend directory not found: ${BACKEND_DIR}"
        exit 1
    fi
    
    cd ${BACKEND_DIR}
    
    # Install dependencies
    if [ -f "package.json" ]; then
        log "Installing backend dependencies..."
        sudo -u ${APP_USER} npm install --production || {
            error "Failed to install backend dependencies"
            exit 1
        }
        log "Backend dependencies installed"
    else
        error "package.json not found in ${BACKEND_DIR}"
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f "${BACKEND_DIR}/.env" ]; then
        log "Creating backend .env file..."
        cat > ${BACKEND_DIR}/.env <<EOF
# MongoDB Configuration
MONGODB=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:${MONGO_PORT}/${MONGO_DB_NAME}?authSource=admin

# Session Secret
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
    else
        log "Backend .env file already exists"
    fi
    
    log "Backend deployment completed"
}

# Main function
main() {
    check_root
    deploy_backend
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

