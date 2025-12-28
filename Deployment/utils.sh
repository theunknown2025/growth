#!/bin/bash

################################################################################
# Growth AI - Deployment Utilities
# Shared utility functions for all deployment scripts
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "Please run as root (use sudo)"
        exit 1
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Load configuration
load_config() {
    if [ -f "$(dirname "$0")/config.sh" ]; then
        source "$(dirname "$0")/config.sh"
    else
        error "Configuration file not found: config.sh"
        exit 1
    fi
}

# Display section header
section_header() {
    echo ""
    log "========================================="
    log "$1"
    log "========================================="
    echo ""
}

