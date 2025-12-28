#!/bin/bash

################################################################################
# Growth AI - Firewall Configuration Module
# Configures UFW firewall rules
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Configure firewall
configure_firewall() {
    section_header "Firewall Configuration"
    
    if ! command_exists ufw; then
        warning "UFW not found, installing..."
        apt-get install -y ufw
    fi
    
    log "Configuring firewall rules..."
    
    # Enable firewall (non-interactive)
    ufw --force enable
    
    # Allow SSH (critical - do this first!)
    ufw allow 22/tcp comment 'SSH'
    log "✓ Allowed SSH (port 22)"
    
    # Allow HTTP
    ufw allow 80/tcp comment 'HTTP'
    log "✓ Allowed HTTP (port 80)"
    
    # Allow HTTPS
    ufw allow 443/tcp comment 'HTTPS'
    log "✓ Allowed HTTPS (port 443)"
    
    # Allow backend port (internal)
    ufw allow ${BACKEND_PORT}/tcp comment 'Backend API'
    log "✓ Allowed Backend (port ${BACKEND_PORT})"
    
    # Allow frontend port (internal)
    ufw allow ${FRONTEND_PORT}/tcp comment 'Frontend'
    log "✓ Allowed Frontend (port ${FRONTEND_PORT})"
    
    # Show firewall status
    log "Firewall status:"
    ufw status numbered
    
    log "Firewall configured successfully"
}

# Main function
main() {
    check_root
    configure_firewall
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

