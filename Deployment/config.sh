#!/bin/bash

################################################################################
# Growth AI - Deployment Configuration
# Shared configuration variables for all deployment scripts
################################################################################

# Application Configuration
export DOMAIN_NAME="${DOMAIN_NAME:-yourdomain.com}"
export APP_USER="${APP_USER:-growthai}"
export APP_DIR="${APP_DIR:-/var/www/growth-ai}"
export BACKEND_DIR="${APP_DIR}/api-gateway-growth"
export FRONTEND_DIR="${APP_DIR}/growth-ai}"

# Database Configuration
export MONGO_DB_NAME="${MONGO_DB_NAME:-growthai}"
export MONGO_USER="${MONGO_USER:-growthai_user}"
export MONGO_PASSWORD="${MONGO_PASSWORD:-$(openssl rand -base64 32)}"
export MONGO_PORT="${MONGO_PORT:-27017}"

# Port Configuration
export BACKEND_PORT="${BACKEND_PORT:-5000}"
export FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# GitHub Configuration
export GITHUB_REPO="${GITHUB_REPO:-https://github.com/theunknown2025/growth.git}"
export GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

# Node.js Version
export NODE_VERSION="${NODE_VERSION:-20}"

# MongoDB Version
export MONGO_VERSION="${MONGO_VERSION:-7.0}"

