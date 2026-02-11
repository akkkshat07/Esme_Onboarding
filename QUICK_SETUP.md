# 🚀 Quick Reference: Service Account Setup

## 📝 For Ubuntu Server Deployment

### Step 1: Create Service Account (Google Cloud Console)
1. Go to: https://console.cloud.google.com
2. Create project → Enable Drive API
3. IAM & Admin → Service Accounts → Create
4. Download JSON key file

### Step 2: Share Google Drive Folder
1. Create folder: "ESME Onboarding Documents"
2. Share with service account email (from JSON: `client_email`)
3. Give **Editor** access
4. Copy folder ID from URL

### Step 3: Configure Server
```bash
cd /var/www/esme-onboarding/esme-consumer-portal/server
nano .env
```

Add these from the JSON file:
```env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=folder-id-from-drive-url
```

### Step 4: Test Connection
```bash
# Start server
node index.js

# Test (in another terminal)
curl http://localhost:3000/api/auth/google/status

# Should see:
# {"connected":true,"message":"Service Account connected successfully"}
```

---

## 🎯 Helper Script

```bash
# Extract credentials automatically
./setup-service-account.sh /path/to/service-account.json

# Copy output to .env file
```

---

## ✅ Multiple HRs - No Google Login Required!

Each HR:
1. Opens: https://yourdomain.com
2. Logs in with **ESME credentials** (email/password)
3. Uses admin dashboard normally

**Service Account handles all Google Drive operations in the background!**

---

## 📊 Verify Setup

```bash
# Check if service account is working
curl http://localhost:3000/api/auth/google/status

# Check backend logs
pm2 logs esme-backend

# Test file upload
# Login as admin → Create candidate → Upload document
# Check if folder appears in Google Drive
```

---

## 🆘 Troubleshooting

### "Service Account error"
- ✓ Check if GOOGLE_PRIVATE_KEY has quotes and \n characters
- ✓ Verify Drive folder is shared with service account email
- ✓ Check all env variables are set

### "GOOGLE_DRIVE_FOLDER_ID not configured"
- ✓ Get folder ID from Drive URL: `drive.google.com/drive/folders/FOLDER_ID`
- ✓ Add to .env file

### Files not uploading
- ✓ Verify service account has Editor access to folder
- ✓ Check backend logs: `pm2 logs esme-backend`

---

## 🔄 Quick Commands

```bash
# Restart backend
pm2 restart esme-backend

# Check logs
pm2 logs esme-backend

# Check status
pm2 status

# View .env
cat /var/www/esme-onboarding/esme-consumer-portal/server/.env
```

---

## 📞 Need Help?

Full documentation: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Service Account vs OAuth:**
- ❌ OAuth: Requires browser login, token management, expiration issues
- ✅ Service Account: No login, JSON credentials, works everywhere

Your setup is ready when:
- ✅ `/api/auth/google/status` returns `connected: true`
- ✅ HRs can login with ESME credentials
- ✅ Documents upload to Google Drive automatically
