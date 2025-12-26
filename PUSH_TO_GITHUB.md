# Quick Guide: Push to GitHub

## 🚀 Fastest Way to Push

### Step 1: Initialize and Push (One-time setup)

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit: Growth AI project with deployment scripts"

# Add your GitHub repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/growth-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Use Helper Script (Alternative)

```bash
# Make script executable
chmod +x push-to-github.sh

# Run the script
./push-to-github.sh
```

The script will guide you through the process.

## 📝 What Gets Pushed

✅ **Included:**
- All source code
- Configuration files
- Documentation
- Deployment scripts

❌ **Excluded (via .gitignore):**
- `node_modules/`
- `.env` files
- Build artifacts
- Logs
- Credentials

## 🔄 After Pushing

### Deploy from GitHub

```bash
# On your VPS
export GITHUB_REPO=https://github.com/YOUR_USERNAME/growth-ai.git
export DOMAIN_NAME=yourdomain.com
sudo ./deploy.sh
```

### Update Existing Deployment

```bash
# On your VPS
cd /var/www/growth-ai
sudo -u growthai git pull origin main
sudo -u growthai pm2 restart all
```

## 🔐 Authentication

### Option 1: Personal Access Token (HTTPS)

1. Create token: [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Use token as password when pushing
3. Or use in URL: `https://TOKEN@github.com/username/repo.git`

### Option 2: SSH Keys (Recommended)

1. Generate key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: [Settings → SSH Keys](https://github.com/settings/keys)
3. Use SSH URL: `git@github.com:username/growth-ai.git`

## ✅ Verify

After pushing, visit:
```
https://github.com/YOUR_USERNAME/growth-ai
```

You should see all your files.

## 📚 More Help

- **Detailed Setup**: See [GITHUB_SETUP.md](GITHUB_SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Start**: See [QUICK_START.md](QUICK_START.md)

---

**That's it!** Your project is now on GitHub and ready for deployment.

