# GitHub Integration - Summary

## ✅ What's Been Updated

### 1. **deploy.sh** - Enhanced with GitHub Support
   - Added `GITHUB_REPO` environment variable support
   - Added `GITHUB_BRANCH` environment variable (defaults to 'main')
   - Automatic repository cloning
   - Smart handling of existing repositories (pull updates)
   - Verification of project structure after cloning

### 2. **New Files Created**
   - `GITHUB_SETUP.md` - Complete guide for setting up GitHub repository
   - `push-to-github.sh` - Helper script to push project to GitHub
   - `.gitignore` - Root-level gitignore for the project
   - `README.md` - Main project README

### 3. **Updated Documentation**
   - `DEPLOYMENT.md` - Updated with GitHub cloning instructions
   - `QUICK_START.md` - Updated with GitHub setup steps

## 🚀 How to Use

### Step 1: Create GitHub Repository

Follow the guide in `GITHUB_SETUP.md` or:

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `growth-ai`
3. Copy the repository URL

### Step 2: Push Project to GitHub

**Option A: Use Helper Script**
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

**Option B: Manual Git Commands**
```bash
git init
git add .
git commit -m "Initial commit: Growth AI project"
git remote add origin https://github.com/YOUR_USERNAME/growth-ai.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Using GitHub

```bash
# Set environment variables
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export DOMAIN_NAME=yourdomain.com

# Run deployment
sudo ./deploy.sh
```

The script will:
1. Clone the repository automatically
2. Set up all dependencies
3. Configure the application
4. Deploy both backend and frontend

## 📋 Environment Variables

### For Deployment Script

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GITHUB_REPO` | GitHub repository URL | - | No* |
| `GITHUB_BRANCH` | Branch to clone | `main` | No |
| `DOMAIN_NAME` | Your domain name | `yourdomain.com` | No |
| `APP_USER` | Application user | `growthai` | No |
| `APP_DIR` | Application directory | `/var/www/growth-ai` | No |

*If not set, script assumes files are already in place

### Example Usage

```bash
# Public repository
export GITHUB_REPO=https://github.com/username/growth-ai.git

# Private repository (SSH)
export GITHUB_REPO=git@github.com:username/growth-ai.git

# Different branch
export GITHUB_BRANCH=production
```

## 🔄 Workflow

### Development Workflow

1. **Make changes locally**
2. **Commit changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

3. **Deploy updates**
   ```bash
   # On VPS
   cd /var/www/growth-ai
   sudo -u growthai git pull origin main
   sudo -u growthai pm2 restart all
   ```

### Fresh Deployment

```bash
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export DOMAIN_NAME=yourdomain.com
sudo ./deploy.sh
```

## 🔐 Security Considerations

### Private Repositories

For private repositories, use SSH:

```bash
export GITHUB_REPO=git@github.com:username/growth-ai.git
```

Or use Personal Access Token:

```bash
export GITHUB_REPO=https://TOKEN@github.com/username/growth-ai.git
```

**Note**: SSH is more secure than token in URL.

### Environment Variables

Never commit:
- `.env` files
- `.env.local` files
- MongoDB credentials
- API keys
- Private keys

These are already in `.gitignore`.

## 📝 Repository Structure

Your GitHub repository should have:

```
growth-ai/
├── api-gateway-growth/      # Backend
├── growth-ai/              # Frontend
├── deploy.sh               # Deployment script
├── push-to-github.sh       # GitHub helper
├── .gitignore              # Git ignore rules
├── README.md               # Project README
├── DEPLOYMENT.md           # Deployment guide
├── GITHUB_SETUP.md         # GitHub setup guide
├── PROJECT_AUDIT.md        # Project audit
├── env.template            # Environment template
└── [other documentation]
```

## ✅ Verification Checklist

- [ ] GitHub repository created
- [ ] Project pushed to GitHub
- [ ] All files visible on GitHub
- [ ] `.env` files NOT in repository
- [ ] `node_modules` NOT in repository
- [ ] `deploy.sh` works with `GITHUB_REPO` set
- [ ] Deployment successful from GitHub clone

## 🆘 Troubleshooting

### Clone Fails

**Issue**: `Permission denied` when cloning

**Solution**:
- Use SSH URL: `git@github.com:username/repo.git`
- Or set up SSH keys on VPS
- Or use Personal Access Token

### Repository Not Found

**Issue**: `Repository not found`

**Solution**:
- Verify repository URL is correct
- Check repository visibility (public/private)
- Verify access permissions

### Branch Not Found

**Issue**: `Branch 'main' not found`

**Solution**:
```bash
export GITHUB_BRANCH=master  # or your branch name
```

### Structure Verification Fails

**Issue**: Script can't find backend/frontend directories

**Solution**:
- Ensure repository structure matches expected layout
- Backend should be in `api-gateway-growth/`
- Frontend should be in `growth-ai/`

## 📚 Related Documentation

- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - Detailed GitHub setup
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[QUICK_START.md](QUICK_START.md)** - Quick reference

---

**Ready to deploy?** Set `GITHUB_REPO` and run `sudo ./deploy.sh`!

