# 🚀 ESME Onboarding Portal - Ubuntu Deployment Guide

## Prerequisites
- Ubuntu Server (20.04 LTS or higher)
- Node.js 18+ and npm
- MongoDB installed and running
- Domain name (optional but recommended)
- Google Cloud Project with Service Account

---

## 📋 Step 1: Google Cloud Service Account Setup

### 1.1 Create Service Account (One-time setup)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. **Enable APIs:**
   - Google Drive API
   - Google Sheets API (if using)

4. **Create Service Account:**
   - Go to: `IAM & Admin` > `Service Accounts`
   - Click: `Create Service Account`
   - Name: `esme-onboarding-service`
   - Click: `Create and Continue`
   - Skip role assignment (click Continue)
   - Click: `Done`

5. **Generate JSON Key:**
   - Click on the newly created service account
   - Go to `Keys` tab
   - Click: `Add Key` > `Create new key`
   - Select: `JSON`
   - Click: `Create`
   - **Save this file securely!** (e.g., `esme-service-account.json`)

### 1.2 Setup Google Drive Folder

1. Open Google Drive
2. Create a parent folder: `ESME Onboarding Documents`
3. Right-click folder > `Share`
4. Add the service account email (from JSON file: `client_email`)
5. Give it **Editor** access
6. Click `Share`
7. Copy the folder ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

---

## 💻 Step 2: Ubuntu Server Setup

### 2.1 Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version

# Install MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### 2.2 Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/esme-onboarding
sudo chown -R $USER:$USER /var/www/esme-onboarding

# Clone your repository
cd /var/www/esme-onboarding
git clone https://github.com/yourusername/Esme_Onboarding.git .

# Or upload files via SCP/SFTP
```

---

## ⚙️ Step 3: Backend Configuration

### 3.1 Setup Server Environment

```bash
cd /var/www/esme-onboarding/esme-consumer-portal/server

# Install dependencies
npm install

# Create .env file
nano .env
```

### 3.2 Configure .env File

Open the downloaded service account JSON file and extract values:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/esme_onboarding

# Server
PORT=3000
NODE_ENV=production

# Google Drive Service Account (from JSON file)
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=esme-onboarding-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFA...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-from-drive-url

# Google Sheets (optional, use same service account)
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# MSG91 SMS Service
MSG91_AUTH_KEY=your-msg91-key
MSG91_TEMPLATE_ID=your-template-id
MSG91_SENDER_ID=ESMEHR

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Session Secret (generate random string)
SESSION_SECRET=some-very-random-secret-string-here
```

**Important:** 
- The `GOOGLE_PRIVATE_KEY` must be in quotes
- Keep the `\n` characters for line breaks
- Never commit this file to git!

### 3.3 Test Backend

```bash
# Test the server
node index.js

# You should see:
# ✅ Connected to MongoDB
# 🚀 Server running on port 3000

# Test in another terminal:
curl http://localhost:3000/api/auth/google/status

# Should return:
# {"connected":true,"message":"Service Account connected successfully","serviceAccount":"..."}
```

---

## 🎨 Step 4: Frontend Configuration

### 4.1 Build Frontend

```bash
cd /var/www/esme-onboarding/esme-consumer-portal

# Install dependencies
npm install

# Update API URL in vite.config.js
nano vite.config.js
```

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend URL
        changeOrigin: true,
      }
    }
  }
})
```

```bash
# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

---

## 🔄 Step 5: Process Management with PM2

### 5.1 Start Backend with PM2

```bash
cd /var/www/esme-onboarding/esme-consumer-portal/server

# Start backend
pm2 start index.js --name "esme-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it shows

# Check status
pm2 status
pm2 logs esme-backend
```

---

## 🌐 Step 6: Nginx Configuration

### 6.1 Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/esme-onboarding
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (static files)
    root /var/www/esme-onboarding/esme-consumer-portal/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

### 6.2 Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/esme-onboarding /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 7: SSL Certificate (Optional but Recommended)

### 7.1 Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## ✅ Step 8: Verification

### 8.1 Test the Application

1. **Backend Health:**
   ```bash
   curl https://yourdomain.com/api/auth/google/status
   ```

2. **Open in Browser:**
   ```
   https://yourdomain.com
   ```

3. **Test Google Drive:**
   - Login as admin
   - Create a test candidate
   - Upload a document
   - Check if folder is created in Google Drive

### 8.2 Monitor Logs

```bash
# Backend logs
pm2 logs esme-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Step 9: Useful Commands

### Application Management

```bash
# Restart backend
pm2 restart esme-backend

# Stop backend
pm2 stop esme-backend

# View logs
pm2 logs esme-backend

# Monitor resources
pm2 monit

# Pull latest code and rebuild
cd /var/www/esme-onboarding
git pull origin main
cd esme-consumer-portal
npm install
npm run build
pm2 restart esme-backend
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### MongoDB Management

```bash
# Check MongoDB status
sudo systemctl status mongodb

# Access MongoDB shell
mongo

# Backup database
mongodump --db esme_onboarding --out /backup/esme_$(date +%Y%m%d)

# Restore database
mongorestore --db esme_onboarding /backup/esme_20260211/esme_onboarding
```

---

## 🔐 Security Best Practices

1. **Firewall Setup:**
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Secure .env File:**
   ```bash
   chmod 600 /var/www/esme-onboarding/esme-consumer-portal/server/.env
   ```

3. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update
   ```

4. **MongoDB Security:**
   ```bash
   # Enable authentication
   sudo nano /etc/mongodb.conf
   # Add: auth = true
   
   # Create admin user in MongoDB
   mongo
   use admin
   db.createUser({user:"admin", pwd:"strong_password", roles:[{role:"root", db:"admin"}]})
   ```

---

## 📊 Step 10: Multiple HRs Access

### ✅ **NO Google Login Required for HRs!**

Each HR will:
1. Open: `https://yourdomain.com`
2. Login with their **ESME credentials** (email/password)
3. Access the admin dashboard
4. Upload/download documents normally

**The Service Account handles all Google Drive operations automatically in the background!**

### Creating HR Accounts

```bash
# Super Admin creates HR accounts via:
# Dashboard > Admin Management > Create New Admin
```

---

## 🆘 Troubleshooting

### Issue: Google Drive not connected

**Solution:**
```bash
# Check service account credentials
curl http://localhost:3000/api/auth/google/status

# Verify .env file
cat /var/www/esme-onboarding/esme-consumer-portal/server/.env

# Check if Drive folder is shared with service account email
```

### Issue: Can't upload files

**Solution:**
```bash
# Check folder permissions
sudo chown -R $USER:$USER /var/www/esme-onboarding

# Check Nginx file size limit
sudo nano /etc/nginx/sites-available/esme-onboarding
# Ensure: client_max_body_size 10M;

# Restart services
sudo systemctl restart nginx
pm2 restart esme-backend
```

### Issue: MongoDB connection failed

**Solution:**
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb

# Check connection string in .env
```

---

## 📞 Support

For issues or questions, contact:
- Technical Support: tech@esmeconsumer.in
- Documentation: https://github.com/yourusername/Esme_Onboarding

---

## ✨ Summary

✅ **No browser login required** - Service Account handles everything  
✅ **Multiple HRs** can use different devices with their credentials  
✅ **Secure** - All files stored in your Google Drive  
✅ **Scalable** - PM2 handles process management  
✅ **Production-ready** - SSL, Nginx, MongoDB  

Your ESME Onboarding Portal is now live! 🎉
