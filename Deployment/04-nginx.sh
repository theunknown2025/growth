#!/bin/bash

################################################################################
# Growth AI - Nginx Installation and Configuration Module
# Installs Nginx and configures reverse proxy
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Install Nginx
install_nginx() {
    section_header "Nginx Installation"
    
    if command_exists nginx; then
        NGINX_VER=$(nginx -v 2>&1 | cut -d'/' -f2)
        warning "Nginx is already installed: $NGINX_VER"
    else
        log "Installing Nginx..."
        apt-get install -y nginx
        
        # Start and enable Nginx
        systemctl start nginx
        systemctl enable nginx
        
        log "Nginx installed and started"
    fi
}

# Configure Nginx
configure_nginx() {
    section_header "Nginx Configuration"
    
    log "Creating Nginx configuration..."
    
    cat > /etc/nginx/sites-available/growth-ai <<EOF
# Backend API
upstream backend {
    server localhost:${BACKEND_PORT};
}

# Frontend
upstream frontend {
    server localhost:${FRONTEND_PORT};
}

# HTTP Server (initial setup - before SSL)
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
    
    # For Let's Encrypt certificate generation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API routes
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Documents (static files from backend)
    location /documents {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Increase body size for file uploads
    client_max_body_size 50M;
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/growth-ai /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    log "Testing Nginx configuration..."
    if nginx -t; then
        log "Nginx configuration is valid"
        systemctl reload nginx
        log "Nginx reloaded successfully"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
    
    log "Nginx configured successfully"
}

# Main function
main() {
    check_root
    install_nginx
    configure_nginx
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

