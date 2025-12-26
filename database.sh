#!/bin/bash

################################################################################
# Growth AI - MongoDB Installation and Database Setup Script
# This script installs MongoDB, configures it, and sets up the database
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration variables
MONGO_DB_NAME="${MONGO_DB_NAME:-growthai}"
MONGO_USER="${MONGO_USER:-growthai_user}"
MONGO_PASSWORD="${MONGO_PASSWORD:-$(openssl rand -base64 32)}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DATA_DIR="${MONGO_DATA_DIR:-/var/lib/mongodb}"
MONGO_LOG_DIR="${MONGO_LOG_DIR:-/var/log/mongodb}"

# Logging function
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
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "Please run as root (use sudo)"
        exit 1
    fi
}

# Check if MongoDB is already installed
check_mongodb_installed() {
    if command -v mongod &> /dev/null; then
        MONGO_VERSION=$(mongod --version | head -n 1)
        warning "MongoDB is already installed: $MONGO_VERSION"
        read -p "Do you want to continue with database setup? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Exiting..."
            exit 0
        fi
        return 0
    fi
    return 1
}

# Install MongoDB
install_mongodb() {
    log "Installing MongoDB..."
    
    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        error "Cannot detect OS"
        exit 1
    fi
    
    # Install MongoDB based on OS
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        log "Detected Ubuntu/Debian system"
        
        # Import MongoDB GPG key
        log "Importing MongoDB GPG key..."
        curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
        
        # Add MongoDB repository
        log "Adding MongoDB repository..."
        if [ "$VERSION_ID" = "22.04" ] || [ "$VERSION_ID" = "20.04" ]; then
            echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        else
            error "Unsupported Ubuntu version: $VERSION_ID"
            error "This script supports Ubuntu 20.04 and 22.04"
            exit 1
        fi
        
        # Update and install
        apt-get update -y
        apt-get install -y mongodb-org
        
    elif [ "$OS" = "rhel" ] || [ "$OS" = "centos" ] || [ "$OS" = "fedora" ]; then
        log "Detected RHEL/CentOS/Fedora system"
        error "RHEL/CentOS installation not yet implemented"
        error "Please install MongoDB manually or use the official MongoDB documentation"
        exit 1
    else
        error "Unsupported operating system: $OS"
        exit 1
    fi
    
    log "MongoDB installed successfully"
}

# Configure MongoDB
configure_mongodb() {
    log "Configuring MongoDB..."
    
    # Create data and log directories if they don't exist
    mkdir -p ${MONGO_DATA_DIR}
    mkdir -p ${MONGO_LOG_DIR}
    
    # Set proper permissions
    chown -R mongodb:mongodb ${MONGO_DATA_DIR}
    chown -R mongodb:mongodb ${MONGO_LOG_DIR}
    
    # Start MongoDB service
    log "Starting MongoDB service..."
    systemctl start mongod
    systemctl enable mongod
    
    # Wait for MongoDB to be ready
    log "Waiting for MongoDB to start..."
    sleep 5
    
    # Check if MongoDB is running
    if ! systemctl is-active --quiet mongod; then
        error "MongoDB failed to start"
        error "Check logs: sudo journalctl -u mongod"
        exit 1
    fi
    
    log "MongoDB is running"
}

# Create database and user
create_database() {
    log "Creating database and user..."
    
    # Create admin user and application database
    log "Setting up database: ${MONGO_DB_NAME}"
    log "Creating user: ${MONGO_USER}"
    
    mongosh <<EOF
// Switch to admin database
use admin

// Create admin user if it doesn't exist
try {
    db.createUser({
        user: "${MONGO_USER}",
        pwd: "${MONGO_PASSWORD}",
        roles: [
            { role: "readWrite", db: "${MONGO_DB_NAME}" },
            { role: "dbAdmin", db: "${MONGO_DB_NAME}" },
            { role: "readWrite", db: "admin" }
        ]
    })
    print("User created successfully")
} catch(e) {
    if (e.code === 51003) {
        print("User already exists, updating password...")
        db.updateUser("${MONGO_USER}", {
            pwd: "${MONGO_PASSWORD}",
            roles: [
                { role: "readWrite", db: "${MONGO_DB_NAME}" },
                { role: "dbAdmin", db: "${MONGO_DB_NAME}" },
                { role: "readWrite", db: "admin" }
            ]
        })
        print("User updated successfully")
    } else {
        throw e
    }
}

// Switch to application database
use ${MONGO_DB_NAME}

// Create collections (MongoDB creates them automatically on first insert, but we'll create them explicitly)
db.createCollection("users")
db.createCollection("assignements")
db.createCollection("conversations")
db.createCollection("simpletests")
db.createCollection("advancedtests")
db.createCollection("companydetails")

print("Collections created successfully")

// Create indexes for better performance
print("Creating indexes...")

// Users indexes
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Assignements indexes
db.assignements.createIndex({ owner: 1 })
db.assignements.createIndex({ assignedTo: 1 })
db.assignements.createIndex({ type: 1 })
db.assignements.createIndex({ status: 1 })
db.assignements.createIndex({ createdAt: -1 })

// Conversations indexes
db.conversations.createIndex({ userId: 1 })
db.conversations.createIndex({ createdAt: -1 })

// SimpleTests indexes
db.simpletests.createIndex({ user: 1 })
db.simpletests.createIndex({ status: 1 })
db.simpletests.createIndex({ createdAt: -1 })

// AdvancedTests indexes
db.advancedtests.createIndex({ user: 1 })
db.advancedtests.createIndex({ status: 1 })
db.advancedtests.createIndex({ createdAt: -1 })

// CompanyDetails indexes
db.companydetails.createIndex({ user: 1 }, { unique: true })

print("Indexes created successfully")
print("Database setup completed!")
EOF

    if [ $? -eq 0 ]; then
        log "Database and user created successfully"
    else
        error "Failed to create database and user"
        exit 1
    fi
}

# Enable MongoDB authentication
enable_authentication() {
    log "Enabling MongoDB authentication..."
    
    # Backup original config
    if [ ! -f /etc/mongod.conf.backup ]; then
        cp /etc/mongod.conf /etc/mongod.conf.backup
        log "MongoDB config backed up to /etc/mongod.conf.backup"
    fi
    
    # Check if security section exists
    if grep -q "^security:" /etc/mongod.conf; then
        # Update existing security section
        sed -i '/^security:/,/^[^ ]/ { /^  authorization:/d }' /etc/mongod.conf
        sed -i '/^security:/a\  authorization: enabled' /etc/mongod.conf
    else
        # Add security section
        echo "" >> /etc/mongod.conf
        echo "# Security" >> /etc/mongod.conf
        echo "security:" >> /etc/mongod.conf
        echo "  authorization: enabled" >> /etc/mongod.conf
    fi
    
    # Restart MongoDB to apply changes
    log "Restarting MongoDB to apply authentication..."
    systemctl restart mongod
    
    # Wait for restart
    sleep 5
    
    # Verify MongoDB is running
    if ! systemctl is-active --quiet mongod; then
        error "MongoDB failed to restart"
        error "Restoring backup config..."
        cp /etc/mongod.conf.backup /etc/mongod.conf
        systemctl restart mongod
        exit 1
    fi
    
    log "MongoDB authentication enabled"
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    # Test connection with authentication
    mongosh "mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:${MONGO_PORT}/${MONGO_DB_NAME}?authSource=admin" <<EOF
use ${MONGO_DB_NAME}
db.stats()
print("Connection test successful!")
EOF

    if [ $? -eq 0 ]; then
        log "Database connection test passed"
    else
        error "Database connection test failed"
        exit 1
    fi
}

# Save credentials
save_credentials() {
    log "Saving database credentials..."
    
    CREDENTIALS_FILE="/root/.mongo_credentials"
    
    cat > ${CREDENTIALS_FILE} <<EOF
# MongoDB Credentials
# Generated on: $(date)
# DO NOT SHARE THESE CREDENTIALS

MONGO_DB_NAME=${MONGO_DB_NAME}
MONGO_USER=${MONGO_USER}
MONGO_PASSWORD=${MONGO_PASSWORD}
MONGO_PORT=${MONGO_PORT}
MONGO_HOST=localhost

# Connection String
MONGODB=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:${MONGO_PORT}/${MONGO_DB_NAME}?authSource=admin
EOF

    chmod 600 ${CREDENTIALS_FILE}
    log "Credentials saved to: ${CREDENTIALS_FILE}"
    
    # Also save to a location accessible by the app
    APP_CREDENTIALS_FILE="/var/www/growth-ai/.mongo_credentials"
    if [ -d "/var/www/growth-ai" ]; then
        cp ${CREDENTIALS_FILE} ${APP_CREDENTIALS_FILE}
        chown growthai:growthai ${APP_CREDENTIALS_FILE} 2>/dev/null || true
        log "Credentials also saved to: ${APP_CREDENTIALS_FILE}"
    fi
}

# Display connection information
display_info() {
    log ""
    log "========================================="
    log "MongoDB Setup Complete!"
    log "========================================="
    log ""
    log "Database Information:"
    log "  Database Name: ${MONGO_DB_NAME}"
    log "  Username: ${MONGO_USER}"
    log "  Password: ${MONGO_PASSWORD}"
    log "  Host: localhost"
    log "  Port: ${MONGO_PORT}"
    log ""
    log "Connection String:"
    log "  mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:${MONGO_PORT}/${MONGO_DB_NAME}?authSource=admin"
    log ""
    log "Credentials saved to: /root/.mongo_credentials"
    log ""
    log "Collections Created:"
    log "  - users"
    log "  - assignements"
    log "  - conversations"
    log "  - simpletests"
    log "  - advancedtests"
    log "  - companydetails"
    log ""
    log "Next Steps:"
    log "1. Update your application .env file with the connection string"
    log "2. Test the connection from your application"
    log "3. View credentials: cat /root/.mongo_credentials"
    log ""
}

# Main function
main() {
    log "========================================="
    log "Growth AI - MongoDB Setup Script"
    log "========================================="
    log ""
    
    check_root
    
    # Check if MongoDB is installed
    if ! check_mongodb_installed; then
        install_mongodb
        configure_mongodb
    else
        log "MongoDB is already installed, proceeding with database setup..."
    fi
    
    # Create database and user
    create_database
    
    # Enable authentication
    enable_authentication
    
    # Test connection
    test_connection
    
    # Save credentials
    save_credentials
    
    # Display information
    display_info
    
    log "MongoDB setup completed successfully!"
}

# Run main function
main

