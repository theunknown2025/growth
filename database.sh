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

# Check if authentication is enabled
check_authentication() {
    log "Checking MongoDB authentication status..."
    
    # Try to run a command without authentication
    if mongosh --quiet --eval "db.adminCommand('connectionStatus')" 2>/dev/null | grep -q "authenticatedUsers"; then
        return 0  # Authentication is enabled
    else
        # Check config file
        if grep -q "authorization: enabled" /etc/mongod.conf 2>/dev/null; then
            return 0  # Authentication is enabled in config
        fi
        return 1  # Authentication is not enabled
    fi
}

# Get existing admin user (with timeout to avoid hanging)
get_admin_user() {
    # Use timeout to prevent hanging
    for user in "admin" "root" "mongodb"; do
        # Try with 2 second timeout
        if timeout 2 mongosh --quiet --eval "try { db.getUser('${user}'); print('exists') } catch(e) { print('') }" admin 2>/dev/null | grep -q "exists"; then
            echo "${user}"
            return 0
        fi
    done
    
    # Also check growthai_user
    if timeout 2 mongosh --quiet --eval "try { db.getUser('growthai_user'); print('exists') } catch(e) { print('') }" admin 2>/dev/null | grep -q "exists"; then
        echo "growthai_user"
        return 0
    fi
    
    return 1
}

# Create database and user
create_database() {
    log "Creating database and user..."
    
    # Check if authentication is enabled
    if check_authentication; then
        warning "MongoDB authentication is already enabled"
        log ""
        log "To create the database and user, you need admin credentials."
        log ""
        
        # Skip checking for users (hangs when auth is enabled)
        # Go directly to the prompt
        log "Options:"
        log "1. Temporarily disable authentication (recommended - script handles everything)"
        log "2. Provide admin credentials (if you have them)"
        log ""
        read -p "Temporarily disable authentication? (Y/n) " -n 1 -r
        echo
        log ""
        
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            # User chose to disable authentication (default/yes)
            log "Temporarily disabling authentication..."
            disable_authentication_temporarily
            log "Authentication disabled. Creating database and user..."
            create_database_without_auth
            log "Re-enabling authentication..."
            enable_authentication
        else
            # User chose to provide admin credentials
            log "You chose to provide admin credentials."
            log ""
            read -p "Enter admin username: " ADMIN_USER
            if [ -z "$ADMIN_USER" ]; then
                error "No username provided. Exiting."
                exit 1
            fi
            read -sp "Enter admin password: " ADMIN_PASSWORD
            echo
            log ""
            log "Authenticating as ${ADMIN_USER}..."
            create_database_with_auth "${ADMIN_USER}" "${ADMIN_PASSWORD}"
        fi
    else
        log "Authentication is not enabled, creating user without authentication..."
        create_database_without_auth
    fi
}

# Create database with authentication
create_database_with_auth() {
    local ADMIN_USER=$1
    local ADMIN_PASSWORD=$2
    
    log "Setting up database: ${MONGO_DB_NAME}"
    log "Creating user: ${MONGO_USER}"
    log "Authenticating as: ${ADMIN_USER}"
    
    mongosh -u "${ADMIN_USER}" -p "${ADMIN_PASSWORD}" --authenticationDatabase admin <<EOF
// Switch to admin database
use admin

// Create application user if it doesn't exist
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
        print("Error: " + e.message)
        throw e
    }
}

// Switch to application database
use ${MONGO_DB_NAME}

// Create collections (MongoDB creates them automatically on first insert, but we'll create them explicitly)
try {
    db.createCollection("users")
    print("Collection 'users' created")
} catch(e) {
    if (e.code !== 48) throw e  // 48 = collection already exists
}

try {
    db.createCollection("assignements")
    print("Collection 'assignements' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("conversations")
    print("Collection 'conversations' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("simpletests")
    print("Collection 'simpletests' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("advancedtests")
    print("Collection 'advancedtests' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("companydetails")
    print("Collection 'companydetails' created")
} catch(e) {
    if (e.code !== 48) throw e
}

print("Collections created successfully")

// Create indexes for better performance
print("Creating indexes...")

// Users indexes
try {
    db.users.createIndex({ username: 1 }, { unique: true })
    print("Index created: users.username")
} catch(e) {
    if (e.code !== 85 && e.code !== 86) throw e  // 85 = index already exists, 86 = index options conflict
}

try {
    db.users.createIndex({ email: 1 }, { unique: true })
    print("Index created: users.email")
} catch(e) {
    if (e.code !== 85 && e.code !== 86) throw e
}

try {
    db.users.createIndex({ role: 1 })
    print("Index created: users.role")
} catch(e) {
    if (e.code !== 85) throw e
}

// Assignements indexes
try {
    db.assignements.createIndex({ owner: 1 })
    print("Index created: assignements.owner")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ assignedTo: 1 })
    print("Index created: assignements.assignedTo")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ type: 1 })
    print("Index created: assignements.type")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ status: 1 })
    print("Index created: assignements.status")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ createdAt: -1 })
    print("Index created: assignements.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// Conversations indexes
try {
    db.conversations.createIndex({ userId: 1 })
    print("Index created: conversations.userId")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.conversations.createIndex({ createdAt: -1 })
    print("Index created: conversations.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// SimpleTests indexes
try {
    db.simpletests.createIndex({ user: 1 })
    print("Index created: simpletests.user")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.simpletests.createIndex({ status: 1 })
    print("Index created: simpletests.status")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.simpletests.createIndex({ createdAt: -1 })
    print("Index created: simpletests.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// AdvancedTests indexes
try {
    db.advancedtests.createIndex({ user: 1 })
    print("Index created: advancedtests.user")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.advancedtests.createIndex({ status: 1 })
    print("Index created: advancedtests.status")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.advancedtests.createIndex({ createdAt: -1 })
    print("Index created: advancedtests.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// CompanyDetails indexes
try {
    db.companydetails.createIndex({ user: 1 }, { unique: true })
    print("Index created: companydetails.user")
} catch(e) {
    if (e.code !== 85 && e.code !== 86) throw e
}

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

# Create database without authentication
create_database_without_auth() {
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
try {
    db.createCollection("users")
    print("Collection 'users' created")
} catch(e) {
    if (e.code !== 48) throw e  // 48 = collection already exists
}

try {
    db.createCollection("assignements")
    print("Collection 'assignements' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("conversations")
    print("Collection 'conversations' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("simpletests")
    print("Collection 'simpletests' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("advancedtests")
    print("Collection 'advancedtests' created")
} catch(e) {
    if (e.code !== 48) throw e
}

try {
    db.createCollection("companydetails")
    print("Collection 'companydetails' created")
} catch(e) {
    if (e.code !== 48) throw e
}

print("Collections created successfully")

// Create indexes for better performance
print("Creating indexes...")

// Users indexes
try {
    db.users.createIndex({ username: 1 }, { unique: true })
    print("Index created: users.username")
} catch(e) {
    if (e.code !== 85 && e.code !== 86) throw e  // 85 = index already exists, 86 = index options conflict
}

try {
    db.users.createIndex({ email: 1 }, { unique: true })
    print("Index created: users.email")
} catch(e) {
    if (e.code !== 85 && e.code !== 86) throw e
}

try {
    db.users.createIndex({ role: 1 })
    print("Index created: users.role")
} catch(e) {
    if (e.code !== 85) throw e
}

// Assignements indexes
try {
    db.assignements.createIndex({ owner: 1 })
    print("Index created: assignements.owner")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ assignedTo: 1 })
    print("Index created: assignements.assignedTo")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ type: 1 })
    print("Index created: assignements.type")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ status: 1 })
    print("Index created: assignements.status")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.assignements.createIndex({ createdAt: -1 })
    print("Index created: assignements.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// Conversations indexes
try {
    db.conversations.createIndex({ userId: 1 })
    print("Index created: conversations.userId")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.conversations.createIndex({ createdAt: -1 })
    print("Index created: conversations.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// SimpleTests indexes
try {
    db.simpletests.createIndex({ user: 1 })
    print("Index created: simpletests.user")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.simpletests.createIndex({ status: 1 })
    print("Index created: simpletests.status")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.simpletests.createIndex({ createdAt: -1 })
    print("Index created: simpletests.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// AdvancedTests indexes
try {
    db.advancedtests.createIndex({ user: 1 })
    print("Index created: advancedtests.user")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.advancedtests.createIndex({ status: 1 })
    print("Index created: advancedtests.status")
} catch(e) {
    if (e.code !== 85) throw e
}

try {
    db.advancedtests.createIndex({ createdAt: -1 })
    print("Index created: advancedtests.createdAt")
} catch(e) {
    if (e.code !== 85) throw e
}

// CompanyDetails indexes
try {
    db.companydetails.createIndex({ user: 1 }, { unique: true })
    print("Index created: companydetails.user")
} catch(e) {
    if (e.code !== 85 && e.code !== 86) throw e
}

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

# Temporarily disable authentication
disable_authentication_temporarily() {
    log "Temporarily disabling MongoDB authentication..."
    
    # Backup original config if not already backed up
    if [ ! -f /etc/mongod.conf.backup ]; then
        cp /etc/mongod.conf /etc/mongod.conf.backup
        log "MongoDB config backed up to /etc/mongod.conf.backup"
    fi
    
    # Check MongoDB config format (YAML)
    # Comment out or remove authorization line
    if grep -q "^security:" /etc/mongod.conf; then
        # YAML format - comment out the authorization line
        sed -i '/^security:/,/^[^ ]/ { 
            /^  authorization: enabled/ s/^/#/
        }' /etc/mongod.conf
        
        # Also handle if it's on the same line as security
        sed -i 's/^security:.*authorization.*enabled/# &/' /etc/mongod.conf
        
        # If security section becomes empty, comment it out too
        if grep -A 2 "^security:" /etc/mongod.conf | grep -q "^[^#]" && ! grep -A 2 "^security:" /etc/mongod.conf | grep -q "authorization"; then
            # Security section has other settings, leave it
            true
        fi
    else
        # Try to find and comment authorization in any format
        sed -i 's/authorization: enabled/# authorization: enabled/g' /etc/mongod.conf
        sed -i 's/authorization=enabled/# authorization=enabled/g' /etc/mongod.conf
    fi
    
    # Test config before restarting
    log "Testing MongoDB configuration..."
    if ! mongod --config /etc/mongod.conf --test 2>/dev/null; then
        warning "Config test failed, but continuing..."
    fi
    
    # Restart MongoDB
    log "Restarting MongoDB..."
    systemctl restart mongod
    
    # Wait for restart
    sleep 8
    
    # Verify MongoDB is running
    if ! systemctl is-active --quiet mongod; then
        error "MongoDB failed to restart"
        error "Checking MongoDB logs..."
        systemctl status mongod --no-pager -l | tail -20
        
        error "Restoring backup config..."
        cp /etc/mongod.conf.backup /etc/mongod.conf
        systemctl restart mongod
        sleep 5
        
        if systemctl is-active --quiet mongod; then
            error "MongoDB restored but authentication is still enabled"
            error "Please manually edit /etc/mongod.conf to disable authentication"
            error "Or provide admin credentials instead"
        else
            error "MongoDB failed to start even with backup config"
            error "Please check: sudo journalctl -u mongod -n 50"
        fi
        exit 1
    fi
    
    log "Authentication temporarily disabled"
}

# Enable MongoDB authentication
enable_authentication() {
    log "Checking MongoDB authentication status..."
    
    # Check if authentication is already enabled
    if check_authentication; then
        warning "MongoDB authentication is already enabled"
        return 0
    fi
    
    log "Enabling MongoDB authentication..."
    
    # Backup original config
    if [ ! -f /etc/mongod.conf.backup ]; then
        cp /etc/mongod.conf /etc/mongod.conf.backup
        log "MongoDB config backed up to /etc/mongod.conf.backup"
    fi
    
    # Check if security section exists
    if grep -q "^security:" /etc/mongod.conf; then
        # Uncomment or add authorization line
        if grep -q "^#  authorization: enabled" /etc/mongod.conf; then
            # Uncomment existing line
            sed -i 's/^#  authorization: enabled/  authorization: enabled/' /etc/mongod.conf
        else
            # Add authorization line if it doesn't exist
            if ! grep -q "authorization: enabled" /etc/mongod.conf; then
                sed -i '/^security:/a\  authorization: enabled' /etc/mongod.conf
            fi
        fi
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

