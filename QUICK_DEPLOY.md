# ⚡ Quick Deploy - 3 Steps!

## Step 1: Upload deploy.sh
- Use **WinSCP**
- Upload `deploy.sh` to `/root/` on your VPS

## Step 2: Run in PuTTY
```bash
chmod +x deploy.sh
export DOMAIN_NAME=yourdomain.com
sudo ./deploy.sh
```

## Step 3: Configure API Key
```bash
sudo nano /var/www/growth-ai/api-gateway-growth/.env
# Update OPENAI_API_KEY
sudo -u growthai pm2 restart growth-ai-backend
```

## ✅ Done! Visit https://yourdomain.com

---

**The script automatically:**
- ✅ Clones from GitHub
- ✅ Installs everything
- ✅ Configures all services
- ✅ Deploys applications

**See [SIMPLE_DEPLOYMENT.md](SIMPLE_DEPLOYMENT.md) for details**

