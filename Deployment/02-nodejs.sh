#!/bin/bash

################################################################################
# Growth AI - Node.js Installation Module
# Installs Node.js and npm
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Install Node.js
install_nodejs() {
    section_header "Node.js Installation"
    
    if command_exists node; then
        NODE_VERSION=$(node -v)
        warning "Node.js is already installed: $NODE_VERSION"
        
        # Check if version is compatible
        NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            warning "Node.js version is below 18, consider upgrading"
        fi
        return 0
    fi
    
    log "Installing Node.js ${NODE_VERSION}.x..."
    
    # Add NodeSource repository
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
    
    # Install Node.js
    apt-get install -y nodejs
    
    # Verify installation
    if command_exists node && command_exists npm; then
        log "Node.js installed successfully: $(node -v)"
        log "npm installed successfully: $(npm -v)"
    else
        error "Node.js installation failed"
        exit 1
    fi
    
    # Update npm to latest version
    log "Updating npm to latest version..."
    npm install -g npm@latest
    
    log "Node.js installation completed"
}

# Main function
main() {
    check_root
    install_nodejs
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

