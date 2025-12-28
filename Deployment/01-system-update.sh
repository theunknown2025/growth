#!/bin/bash

################################################################################
# Growth AI - System Update Module
# Updates system packages and installs essential tools
################################################################################

# Load utilities and config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"
source "${SCRIPT_DIR}/config.sh"

# Update system packages
update_system() {
    section_header "System Update"
    
    log "Updating package lists..."
    apt-get update -y
    
    log "Upgrading system packages..."
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
    
    log "Installing essential tools..."
    apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        python3 \
        python3-pip
    
    log "System packages updated successfully"
    log "Installed: curl, wget, git, build-essential, python3"
}

# Main function
main() {
    check_root
    update_system
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

