# GitHub Repository Setup Guide

This guide will help you create a GitHub repository and push the Growth AI project to it.

## 📋 Prerequisites

- GitHub account
- Git installed on your local machine
- Project files ready to push

## 🚀 Step-by-Step Setup

### Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit [https://github.com](https://github.com)
2. **Click "New"** or go to [https://github.com/new](https://github.com/new)
3. **Repository Settings**:
   - **Repository name**: `growth-ai` (or your preferred name)
   - **Description**: "Growth AI - Full-stack application with Next.js and Node.js"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. **Click "Create repository"**

### Step 2: Initialize Git in Your Project

Open terminal/command prompt in your project root directory:

```bash
# Navigate to project root
cd /path/to/Growth

# Initialize git repository (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Growth AI project with deployment scripts"
```

### Step 3: Connect to GitHub Repository

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/growth-ai.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/growth-ai.git

# Verify remote
git remote -v
```

### Step 4: Push to GitHub

```bash
# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)
  - Create one at: [https://github.com/settings/tokens](https://github.com/settings/tokens)
  - Select scope: `repo`

### Step 5: Verify Upload

Visit your repository on GitHub to verify all files are uploaded:
```
https://github.com/YOUR_USERNAME/growth-ai
```

## 🔐 Using SSH (Recommended)

For easier authentication, set up SSH keys:

### Generate SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519
```

### Add SSH Key to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to GitHub Settings → SSH and GPG keys → New SSH key
3. Paste your public key
4. Save

### Update Remote URL

```bash
# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/growth-ai.git

# Verify
git remote -v
```

## 📝 .gitignore Configuration

The project already includes `.gitignore` files that exclude:
- `node_modules/`
- `.env` files
- Build artifacts
- Log files
- IDE files

**Important**: Never commit:
- `.env` files
- `.env.local` files
- MongoDB credentials
- API keys
- Private keys

## 🔄 Updating Repository

After making changes:

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

## 🚀 Using GitHub Repository in Deployment

### Option 1: Set Environment Variable

```bash
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export DOMAIN_NAME=yourdomain.com
sudo ./deploy.sh
```

### Option 2: Edit deploy.sh

Edit the `deploy.sh` file and set:
```bash
GITHUB_REPO="https://github.com/YOUR_USERNAME/growth-ai.git"
```

### Option 3: Use Different Branch

```bash
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export GITHUB_BRANCH=production
sudo ./deploy.sh
```

## 🔒 Private Repository Access

If your repository is private, you have two options:

### Option 1: SSH (Recommended)

Use SSH URL in `GITHUB_REPO`:
```bash
export GITHUB_REPO=git@github.com:YOUR_USERNAME/growth-ai.git
```

### Option 2: Personal Access Token

1. Create a Personal Access Token:
   - Go to: [https://github.com/settings/tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scope: `repo`
   - Copy the token

2. Use token in URL:
   ```bash
   export GITHUB_REPO=https://TOKEN@github.com/YOUR_USERNAME/growth-ai.git
   ```

**Note**: This exposes the token in process list. SSH is more secure.

## 📋 Repository Structure

Your repository should have this structure:

```
growth-ai/
├── api-gateway-growth/      # Backend
├── growth-ai/              # Frontend
├── deploy.sh               # Deployment script
├── DEPLOYMENT.md           # Deployment guide
├── PROJECT_AUDIT.md        # Project audit
├── env.template            # Environment template
├── GITHUB_SETUP.md         # This file
├── QUICK_START.md          # Quick start guide
└── README.md               # Project README (optional)
```

## ✅ Verification Checklist

- [ ] Repository created on GitHub
- [ ] Git initialized in project
- [ ] Remote added
- [ ] Files committed
- [ ] Pushed to GitHub
- [ ] All files visible on GitHub
- [ ] `.env` files NOT in repository
- [ ] `node_modules` NOT in repository
- [ ] Deployment script works with `GITHUB_REPO` set

## 🆘 Troubleshooting

### Authentication Failed

**Problem**: `Permission denied` when pushing

**Solution**:
- Use Personal Access Token instead of password
- Or set up SSH keys

### Repository Already Exists

**Problem**: `remote origin already exists`

**Solution**:
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/growth-ai.git
```

### Large Files

**Problem**: Files too large for GitHub

**Solution**:
- Ensure `node_modules` is in `.gitignore`
- Use Git LFS for large files if needed
- Remove large files from history if already committed

### Branch Name Issues

**Problem**: Branch name mismatch

**Solution**:
```bash
# Rename branch
git branch -M main

# Or use existing branch name in GITHUB_BRANCH
export GITHUB_BRANCH=master
```

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [SSH Keys Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Next Steps**: After setting up GitHub, proceed with deployment using the updated `deploy.sh` script with `GITHUB_REPO` environment variable set.

