#!/bin/bash

################################################################################
# Growth AI - Repository Setup Module
# Clones project from GitHub
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Clone from GitHub
clone_from_github() {
    section_header "Repository Setup"
    
    log "Setting up project from GitHub: ${GITHUB_REPO}"
    
    # Check if directory already exists and has content
    if [ -d "${APP_DIR}/.git" ]; then
        warning "Git repository already exists in ${APP_DIR}"
        log "Pulling latest changes from GitHub..."
        cd ${APP_DIR}
        sudo -u ${APP_USER} git pull origin ${GITHUB_BRANCH} || {
            warning "Git pull failed, continuing with existing files"
        }
        return 0
    fi
    
    # If directory exists with files but no .git, backup and remove
    if [ -d "${APP_DIR}" ] && [ "$(ls -A ${APP_DIR} 2>/dev/null)" ]; then
        warning "Directory ${APP_DIR} exists with files"
        log "Backing up existing directory..."
        BACKUP_DIR="${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        mv ${APP_DIR} ${BACKUP_DIR}
        warning "Existing directory backed up to: ${BACKUP_DIR}"
    fi
    
    # Remove directory if it exists but is empty
    if [ -d "${APP_DIR}" ]; then
        rmdir ${APP_DIR} 2>/dev/null || true
    fi
    
    # Clone the repository
    cd $(dirname ${APP_DIR})
    log "Cloning repository to ${APP_DIR}..."
    
    if ! git clone -b ${GITHUB_BRANCH} ${GITHUB_REPO} ${APP_DIR} 2>/dev/null; then
        error "Failed to clone from GitHub: ${GITHUB_REPO}"
        error "Please check:"
        error "  1. Internet connection"
        error "  2. Repository URL is correct"
        error "  3. Repository is accessible (public or you have access)"
        exit 1
    fi
    
    # Set ownership
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
    
    log "Repository cloned successfully"
    
    # Verify required directories exist
    if [ ! -d "${BACKEND_DIR}" ]; then
        error "Backend directory not found: ${BACKEND_DIR}"
        error "Please ensure the repository structure is correct"
        exit 1
    fi
    
    if [ ! -d "${FRONTEND_DIR}" ]; then
        error "Frontend directory not found: ${FRONTEND_DIR}"
        error "Please ensure the repository structure is correct"
        exit 1
    fi
    
    log "Repository structure verified"
    log "✓ Backend directory: ${BACKEND_DIR}"
    log "✓ Frontend directory: ${FRONTEND_DIR}"
}

# Main function
main() {
    check_root
    clone_from_github
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

