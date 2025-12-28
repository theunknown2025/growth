#!/bin/bash

################################################################################
# Growth AI - PM2 Process Setup Module
# Configures and starts applications with PM2
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Setup PM2 processes
setup_pm2() {
    section_header "PM2 Process Setup"
    
    # Create logs directory
    mkdir -p ${APP_DIR}/logs
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}/logs
    
    # Backend PM2 config
    log "Creating backend PM2 configuration..."
    cat > ${BACKEND_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'growth-ai-backend',
    script: 'app.js',
    cwd: '${BACKEND_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${BACKEND_PORT}
    },
    error_file: '${APP_DIR}/logs/backend-error.log',
    out_file: '${APP_DIR}/logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
EOF

    # Frontend PM2 config
    log "Creating frontend PM2 configuration..."
    cat > ${FRONTEND_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'growth-ai-frontend',
    script: 'npm',
    args: 'start',
    cwd: '${FRONTEND_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${FRONTEND_PORT}
    },
    error_file: '${APP_DIR}/logs/frontend-error.log',
    out_file: '${APP_DIR}/logs/frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

    # Set ownership
    chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/ecosystem.config.js
    chown ${APP_USER}:${APP_USER} ${FRONTEND_DIR}/ecosystem.config.js
    
    # Start backend
    log "Starting backend with PM2..."
    cd ${BACKEND_DIR}
    sudo -u ${APP_USER} pm2 start ecosystem.config.js || {
        error "Failed to start backend"
        exit 1
    }
    
    # Start frontend
    log "Starting frontend with PM2..."
    cd ${FRONTEND_DIR}
    sudo -u ${APP_USER} pm2 start ecosystem.config.js || {
        error "Failed to start frontend"
        exit 1
    }
    
    # Save PM2 configuration
    sudo -u ${APP_USER} pm2 save
    
    log "PM2 processes configured and started"
    
    # Show status
    log "PM2 Status:"
    sudo -u ${APP_USER} pm2 status
}

# Main function
main() {
    check_root
    setup_pm2
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

