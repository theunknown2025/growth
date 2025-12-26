#!/bin/bash

################################################################################
# Growth AI - GitHub Push Helper Script
# This script helps you push the project to GitHub
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    log "Initializing git repository..."
    git init
    log "Git repository initialized"
fi

# Get repository URL
echo ""
log "GitHub Repository Setup"
log "======================"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/growth-ai.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    error "Repository URL is required"
    exit 1
fi

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    CURRENT_URL=$(git remote get-url origin)
    warning "Remote 'origin' already exists: $CURRENT_URL"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$REPO_URL"
        log "Remote URL updated"
    else
        log "Keeping existing remote URL"
        REPO_URL="$CURRENT_URL"
    fi
else
    git remote add origin "$REPO_URL"
    log "Remote 'origin' added"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Ask for branch name
read -p "Enter branch name (default: $CURRENT_BRANCH): " BRANCH_NAME
BRANCH_NAME=${BRANCH_NAME:-$CURRENT_BRANCH}

# Create branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    git checkout -b $BRANCH_NAME 2>/dev/null || git checkout $BRANCH_NAME
    log "Branch '$BRANCH_NAME' created/checked out"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    log "Uncommitted changes detected"
    git status --short
    echo ""
    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Update project files"}
    
    log "Adding all changes..."
    git add .
    
    log "Committing changes..."
    git commit -m "$COMMIT_MSG"
    log "Changes committed"
else
    log "No uncommitted changes"
fi

# Push to GitHub
echo ""
log "Pushing to GitHub..."
log "Repository: $REPO_URL"
log "Branch: $BRANCH_NAME"
echo ""

# Try to push
if git push -u origin $BRANCH_NAME; then
    log "Successfully pushed to GitHub!"
    echo ""
    log "Repository URL: $REPO_URL"
    log "Branch: $BRANCH_NAME"
    echo ""
    log "You can now use this repository in deployment:"
    log "export GITHUB_REPO=$REPO_URL"
    log "export GITHUB_BRANCH=$BRANCH_NAME"
    log "sudo ./deploy.sh"
else
    error "Failed to push to GitHub"
    echo ""
    warning "Common issues:"
    warning "1. Authentication failed - set up SSH keys or use Personal Access Token"
    warning "2. Repository doesn't exist - create it on GitHub first"
    warning "3. Permission denied - check repository access"
    echo ""
    warning "See GITHUB_SETUP.md for detailed instructions"
    exit 1
fi

