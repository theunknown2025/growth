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
        
        # Check available memory
        AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        log "Available memory: ${AVAILABLE_MEM}MB"
        
        # If low memory, create swap or use memory-efficient install
        if [ "$AVAILABLE_MEM" -lt 512 ]; then
            warning "Low memory detected (${AVAILABLE_MEM}MB). Using memory-efficient installation..."
            
            # Try to create swap if it doesn't exist
            if [ ! -f /swapfile ]; then
                log "Creating 2GB swap file to help with installation..."
                fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=2097152
                chmod 600 /swapfile
                mkswap /swapfile
                swapon /swapfile
                echo '/swapfile none swap sw 0 0' >> /etc/fstab
                log "Swap file created and activated"
            fi
            
            # Use memory-efficient npm install
            log "Installing with memory-efficient flags..."
            sudo -u ${APP_USER} npm install --production --no-optional --prefer-offline --no-audit || {
                error "Failed to install backend dependencies"
                exit 1
            }
        else
            # Normal installation with some memory optimizations
            sudo -u ${APP_USER} npm install --production --no-optional || {
                error "Failed to install backend dependencies"
                exit 1
            }
        fi
        
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

# CORS Configuration (use http:// for IP addresses, https:// for domains)
CORS_ORIGIN=$(if [[ "${DOMAIN_NAME}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then echo "http://${DOMAIN_NAME}"; else echo "https://${DOMAIN_NAME}"; fi)

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

