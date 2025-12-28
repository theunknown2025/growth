#!/bin/bash

################################################################################
# Growth AI - SSL Certificate Setup Module
# Installs Certbot and provides SSL setup instructions
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Install Certbot
install_certbot() {
    section_header "SSL Certificate Setup"
    
    if command_exists certbot; then
        warning "Certbot is already installed"
    else
        log "Installing Certbot..."
        apt-get install -y certbot python3-certbot-nginx
        log "Certbot installed successfully"
    fi
    
    log ""
    log "To install SSL certificate, run:"
    log "  sudo certbot --nginx -d ${DOMAIN_NAME} -d www.${DOMAIN_NAME}"
    log ""
    log "Certbot will automatically:"
    log "  - Obtain SSL certificate from Let's Encrypt"
    log "  - Update Nginx configuration"
    log "  - Set up automatic renewal"
    log ""
    
    read -p "Do you want to install SSL certificate now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Installing SSL certificate..."
        certbot --nginx -d ${DOMAIN_NAME} -d www.${DOMAIN_NAME} || {
            warning "SSL certificate installation failed or was cancelled"
            warning "You can run it manually later:"
            warning "  sudo certbot --nginx -d ${DOMAIN_NAME}"
        }
    else
        log "SSL certificate installation skipped"
        log "Run manually when ready: sudo certbot --nginx -d ${DOMAIN_NAME}"
    fi
}

# Main function
main() {
    check_root
    install_certbot
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

