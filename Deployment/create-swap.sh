#!/bin/bash

################################################################################
# Growth AI - Swap Creation Script
# Creates swap file to help with memory issues
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root (use sudo)"
    exit 1
fi

SWAP_SIZE="${1:-2G}"  # Default 2GB, can override

log "Creating ${SWAP_SIZE} swap file..."

# Check if swap already exists
if swapon --show | grep -q swapfile; then
    warning "Swap file already exists and is active"
    swapon --show
    read -p "Do you want to create additional swap? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Exiting..."
        exit 0
    fi
fi

# Check if swapfile exists but not active
if [ -f /swapfile ]; then
    warning "Swap file exists but may not be active"
    log "Activating existing swap file..."
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    log "Swap file activated"
    swapon --show
    exit 0
fi

# Create swap file
log "Allocating ${SWAP_SIZE} for swap file..."
if command -v fallocate &> /dev/null; then
    fallocate -l ${SWAP_SIZE} /swapfile || {
        error "fallocate failed, trying dd method..."
        dd if=/dev/zero of=/swapfile bs=1024 count=$(($(echo ${SWAP_SIZE} | sed 's/G/*1024*1024/' | bc))) 2>/dev/null || {
            # Fallback: 2GB
            log "Using fallback: creating 2GB swap file..."
            dd if=/dev/zero of=/swapfile bs=1024 count=2097152
        }
    }
else
    # Calculate size in KB (2GB = 2097152 KB)
    if [[ "$SWAP_SIZE" == *"G" ]]; then
        SIZE_GB=$(echo $SWAP_SIZE | sed 's/G//')
        SIZE_KB=$((SIZE_GB * 1024 * 1024))
    else
        SIZE_KB=2097152  # Default 2GB
    fi
    dd if=/dev/zero of=/swapfile bs=1024 count=${SIZE_KB}
fi

# Set permissions
log "Setting swap file permissions..."
chmod 600 /swapfile

# Make swap
log "Formatting swap file..."
mkswap /swapfile

# Enable swap
log "Enabling swap..."
swapon /swapfile

# Make permanent
if ! grep -q '/swapfile' /etc/fstab; then
    log "Making swap permanent..."
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Verify
log "Verifying swap..."
swapon --show
free -h

log "Swap file created and activated successfully!"
log "Total swap: $(swapon --show | awk 'NR==2{print $3}')"

