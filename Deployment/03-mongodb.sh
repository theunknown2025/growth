#!/bin/bash

################################################################################
# Growth AI - MongoDB Installation Module
# Installs and configures MongoDB
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Install MongoDB
install_mongodb() {
    section_header "MongoDB Installation"
    
    if command_exists mongod; then
        MONGO_VER=$(mongod --version | head -n 1)
        warning "MongoDB is already installed: $MONGO_VER"
        return 0
    fi
    
    log "Installing MongoDB ${MONGO_VERSION}..."
    
    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        error "Cannot detect OS"
        exit 1
    fi
    
    # Install MongoDB based on OS
    if [ "$OS" = "ubuntu" ]; then
        if [ "$VERSION" = "22.04" ] || [ "$VERSION" = "20.04" ]; then
            log "Detected Ubuntu $VERSION"
            
            # Import MongoDB GPG key
            log "Importing MongoDB GPG key..."
            curl -fsSL https://www.mongodb.org/static/pgp/server-${MONGO_VERSION}.asc | \
                gpg -o /usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg --dearmor
            
            # Add MongoDB repository
            log "Adding MongoDB repository..."
            echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/${MONGO_VERSION} multiverse" | \
                tee /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list
            
            # Update and install
            apt-get update -y
            apt-get install -y mongodb-org
            
            # Start and enable MongoDB
            systemctl start mongod
            systemctl enable mongod
            
            log "MongoDB installed and started successfully"
            
            # Wait for MongoDB to be ready
            log "Waiting for MongoDB to initialize..."
            sleep 5
            
            # Verify MongoDB is running
            if systemctl is-active --quiet mongod; then
                log "MongoDB is running"
            else
                error "MongoDB failed to start"
                exit 1
            fi
        else
            error "Unsupported Ubuntu version: $VERSION"
            error "This script supports Ubuntu 20.04 and 22.04"
            exit 1
        fi
    else
        error "Unsupported operating system: $OS"
        exit 1
    fi
}

# Main function
main() {
    check_root
    install_mongodb
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

