#!/bin/bash

################################################################################
# Growth AI - User and Directory Setup Module
# Creates application user and directories
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Create application user
create_app_user() {
    section_header "Application User Setup"
    
    if id "${APP_USER}" &>/dev/null; then
        warning "User ${APP_USER} already exists"
    else
        log "Creating application user: ${APP_USER}..."
        useradd -m -s /bin/bash ${APP_USER}
        
        # Add user to necessary groups
        usermod -aG sudo ${APP_USER} 2>/dev/null || true
        
        log "User ${APP_USER} created successfully"
    fi
}

# Setup application directory
setup_app_directory() {
    log "Setting up application directory..."
    
    # Create directories
    mkdir -p ${APP_DIR}
    mkdir -p ${APP_DIR}/logs
    
    # Set ownership
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
    
    # Set permissions
    chmod 755 ${APP_DIR}
    chmod 755 ${APP_DIR}/logs
    
    log "Application directory created: ${APP_DIR}"
    log "Logs directory created: ${APP_DIR}/logs"
}

# Main function
main() {
    check_root
    create_app_user
    setup_app_directory
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

