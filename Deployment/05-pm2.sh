#!/bin/bash

################################################################################
# Growth AI - PM2 Installation Module
# Installs PM2 process manager
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Install PM2
install_pm2() {
    section_header "PM2 Installation"
    
    if command_exists pm2; then
        PM2_VER=$(pm2 -v)
        warning "PM2 is already installed: v$PM2_VER"
    else
        log "Installing PM2..."
        npm install -g pm2
        
        # Setup PM2 startup script
        log "Configuring PM2 startup..."
        pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER} || {
            warning "PM2 startup configuration may need manual setup"
        }
        
        log "PM2 installed and configured"
    fi
    
    # Verify installation
    if command_exists pm2; then
        log "PM2 version: $(pm2 -v)"
    else
        error "PM2 installation failed"
        exit 1
    fi
}

# Main function
main() {
    check_root
    install_pm2
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

