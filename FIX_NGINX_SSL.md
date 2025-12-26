# Fix Nginx SSL Configuration

If you encountered the error:
```
nginx: [emerg] no "ssl_certificate" is defined for the "listen ... ssl" directive
```

## Quick Fix

Run these commands in PuTTY:

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/growth-ai
```

**Find this section:**
```nginx
server {
    listen 443 ssl http2;
    ...
    # ssl_certificate ... (commented out)
```

**Change it to:**
```nginx
server {
    listen 80;  # Changed from 443 ssl http2
    ...
    # Remove or comment out SSL certificate lines
```

**Or simply replace the HTTPS server block with HTTP only:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # ... rest of configuration
}
```

**Then test and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## After SSL Certificate is Installed

Once you install SSL with:
```bash
sudo certbot --nginx -d yourdomain.com
```

Certbot will automatically update the Nginx configuration to use SSL. You don't need to manually edit it.

## Alternative: Use Updated deploy.sh

The updated `deploy.sh` script now creates an HTTP-only configuration initially. You can:

1. Pull the latest version from GitHub:
```bash
cd /var/www/growth-ai
sudo -u growthai git pull origin main
```

2. Or re-run the deployment script (it will update the config)

3. Or manually fix the Nginx config as shown above

