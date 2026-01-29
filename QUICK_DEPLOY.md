# Ubuntu Server Deployment - Quick Reference

## ⚡ One-Command Deployment

```bash
sudo bash deploy.sh
```

This single command will:
1. ✅ Update system packages
2. ✅ Install Node.js v18
3. ✅ Install MongoDB
4. ✅ Clone repository from GitHub
5. ✅ Install all dependencies
6. ✅ Build frontend for production
7. ✅ Setup PM2 process manager
8. ✅ Configure Nginx reverse proxy
9. ✅ Start all services automatically
10. ✅ Enable auto-start on server reboot

## 📋 Pre-Deployment Checklist

Before running the deployment script:

- [ ] Ubuntu 18.04 or higher installed
- [ ] Root or sudo access available
- [ ] Internet connection active
- [ ] At least 2GB RAM available
- [ ] At least 5GB disk space available
- [ ] Port 80 (HTTP) is available
- [ ] Port 443 (HTTPS) is available for SSL later

## 🚀 Deployment Steps

### Step 1: SSH into Ubuntu Server
```bash
ssh root@your_server_ip
```

### Step 2: Download and Run Deploy Script
```bash
cd /tmp
wget https://raw.githubusercontent.com/akkkshat07/Esme_Onboarding/main/deploy.sh
sudo bash deploy.sh
```

Or clone directly:
```bash
git clone https://github.com/akkkshat07/Esme_Onboarding.git
cd Esme_Onboarding
sudo bash deploy.sh
```

### Step 3: Wait for Completion
The script will take 5-15 minutes depending on server speed. Watch the output for:
```
✅ Setup Complete!
Application is ready at:
  → http://your_server_ip
```

## 🔐 Post-Deployment Security

### Change Default Admin Password (CRITICAL)
```bash
# This should be done immediately after deployment
# Login to http://your_server_ip with:
# Email: admin@esmeconsumer.in
# Password: Esme@consumer2019
```

### Setup SSL/HTTPS with Let's Encrypt
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

### Setup Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Accessing the Application

After deployment, your application will be available at:

- **Frontend**: `http://your_server_ip`
- **API**: `http://your_server_ip/api`
- **Admin Panel**: `http://your_server_ip` → Login with admin credentials

## 🛠️ Managing Services

### View Service Status
```bash
pm2 status
```

### View Real-time Logs
```bash
pm2 logs
```

### Monitor Resources
```bash
pm2 monit
```

### Restart All Services
```bash
pm2 restart all
```

### Stop All Services
```bash
pm2 stop all
```

### Start Services
```bash
pm2 start ecosystem.config.js
```

## 🔄 Update Application

To update the application with latest code:

```bash
cd /opt/Esme_Onboarding
git pull origin main
cd esme-consumer-portal
npm install
npm run build
pm2 restart all
```

## 🐛 Troubleshooting

### Check Services
```bash
lsof -i :80,3000,5174
pm2 status
```

### View Backend Logs
```bash
pm2 logs esme-backend
```

### View Frontend Logs
```bash
pm2 logs esme-frontend
```

### Restart MongoDB
```bash
sudo systemctl restart mongod
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Clear PM2 Logs
```bash
pm2 flush
```

## 📁 Important Directories

```
/opt/Esme_Onboarding/          # Application directory
├── esme-consumer-portal/       # Main app
├── ecosystem.config.js         # PM2 config
└── logs/                       # Service logs

/etc/nginx/sites-available/    # Nginx configs
/var/log/nginx/                # Nginx logs
```

## 📦 System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| OS | Ubuntu 18.04 | Ubuntu 22.04 LTS |
| RAM | 2GB | 4GB |
| CPU | 1 Core | 2+ Cores |
| Disk | 5GB | 20GB |
| Node.js | v14 | v18+ |
| MongoDB | v4.0 | v5.0+ |

## 🔑 Default Credentials

| Service | Username/Email | Password |
|---------|---|---|
| Admin Panel | admin@esmeconsumer.in | Esme@consumer2019 |

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 📞 Support & Troubleshooting

For detailed troubleshooting and advanced configurations, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `README.md` - Project overview and features
- GitHub Issues - Report problems

## 🔗 Links

- **Repository**: https://github.com/akkkshat07/Esme_Onboarding
- **Documentation**: See DEPLOYMENT_GUIDE.md in repository
- **Support**: admin@esmeconsumer.in

## ✨ Features After Deployment

- ✅ Candidate onboarding portal
- ✅ Admin dashboard with analytics
- ✅ Document upload and verification
- ✅ PDF form generation
- ✅ MongoDB database
- ✅ Real-time status tracking
- ✅ Dark mode interface
- ✅ Mobile responsive design
- ✅ Automated process management (PM2)
- ✅ Reverse proxy with Nginx
- ✅ SSL/HTTPS ready

## 🎉 You're All Set!

Your ESME Onboarding Portal is now live and ready for use!

```
Access: http://your_server_ip
Admin Email: admin@esmeconsumer.in
Default Password: Esme@consumer2019
```

Monitor services with:
```bash
pm2 monit
```

Update anytime with:
```bash
cd /opt/Esme_Onboarding && git pull && cd esme-consumer-portal && npm install && npm run build && pm2 restart all
```
