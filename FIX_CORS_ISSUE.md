# Fix CORS and API Configuration Issues

## Problems Identified

1. **CORS Error**: Frontend accessing from `http://172.166.106.2` but backend only allows `https://yourdomain.com`
2. **Double `/api/api` in URL**: Base URL configuration issue
3. **CORS Preflight**: Backend not handling OPTIONS requests properly

## Quick Fixes

### Fix 1: Update Backend CORS Configuration

**On your VPS, edit the backend .env file:**

```bash
sudo nano /var/www/growth-ai/api-gateway-growth/.env
```

**Update CORS_ORIGIN to allow multiple origins:**

```env
# Allow both domain and IP access
CORS_ORIGIN=http://172.166.106.2,https://yourdomain.com,http://localhost:3000
```

**Or for development (allow all):**

```env
CORS_ORIGIN=*
```

**Restart backend:**

```bash
sudo -u growthai pm2 restart growth-ai-backend
```

### Fix 2: Fix Frontend API Base URL

**Edit frontend .env.local:**

```bash
sudo nano /var/www/growth-ai/growth-ai/.env.local
```

**Fix the base URL (remove /api if it's duplicated):**

```env
# If you're accessing via IP
NEXT_PUBLIC_SERVER_URL=http://172.166.106.2
NEXT_PUBLIC_BASE_URL=http://172.166.106.2/api

# Or if using domain
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com/api
```

**Important**: The `NEXT_PUBLIC_BASE_URL` should NOT end with `/api` if your endpoints already include `/api/v1/`.

**Rebuild frontend:**

```bash
cd /var/www/growth-ai/growth-ai
sudo -u growthai npm run build
sudo -u growthai pm2 restart growth-ai-frontend
```

### Fix 3: Update Backend Code (Already Fixed)

The backend code has been updated to handle CORS better. You need to:

1. **Pull latest code:**
```bash
cd /var/www/growth-ai
sudo -u growthai git pull origin main
```

2. **Restart backend:**
```bash
sudo -u growthai pm2 restart growth-ai-backend
```

## Verify Configuration

### Check Backend CORS

```bash
# Check backend logs
sudo -u growthai pm2 logs growth-ai-backend | grep -i cors
```

### Test API Endpoint

```bash
# Test from server
curl -X OPTIONS http://localhost:5000/api/v1/users/register \
  -H "Origin: http://172.166.106.2" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return CORS headers.

### Check Frontend Environment

```bash
# Verify frontend env vars
cat /var/www/growth-ai/growth-ai/.env.local
```

## Complete Fix Steps

1. **Update backend .env:**
   ```bash
   sudo nano /var/www/growth-ai/api-gateway-growth/.env
   # Set: CORS_ORIGIN=http://172.166.106.2,https://yourdomain.com
   ```

2. **Update frontend .env.local:**
   ```bash
   sudo nano /var/www/growth-ai/growth-ai/.env.local
   # Set: NEXT_PUBLIC_BASE_URL=http://172.166.106.2/api
   ```

3. **Pull latest code:**
   ```bash
   cd /var/www/growth-ai
   sudo -u growthai git pull origin main
   ```

4. **Restart services:**
   ```bash
   sudo -u growthai pm2 restart all
   ```

5. **Rebuild frontend (if needed):**
   ```bash
   cd /var/www/growth-ai/growth-ai
   sudo -u growthai npm run build
   sudo -u growthai pm2 restart growth-ai-frontend
   ```

## Expected Result

After fixes:
- ✅ CORS error should be resolved
- ✅ API calls should work from `http://172.166.106.2`
- ✅ No more double `/api/api` in URLs
- ✅ Registration should work

