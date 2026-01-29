# ESME Onboarding Portal - Deployment Guide

This guide provides step-by-step instructions to deploy the ESME Onboarding Portal on an Ubuntu server.

## Prerequisites

- Ubuntu 18.04 or higher
- Root or sudo access
- Internet connection

## System Requirements

- RAM: 2GB minimum (4GB recommended)
- Disk: 5GB minimum
- Node.js: v16.0.0 or higher
- npm: v7.0.0 or higher
- MongoDB: v4.4 or higher

## Step 1: Initial Setup

```bash
cd /opt
sudo git clone https://github.com/akkkshat07/Esme_Onboarding.git
cd Esme_Onboarding
sudo chown -R $USER:$USER .
```

## Step 2: Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

## Step 3: Install MongoDB

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 4: Install Frontend Dependencies

```bash
cd /opt/Esme_Onboarding/esme-consumer-portal
npm install
```

## Step 5: Install Backend Dependencies

```bash
cd /opt/Esme_Onboarding/esme-consumer-portal/server
npm install
```

## Step 6: Environment Configuration

### Backend (.env)

Create a `.env` file in `esme-consumer-portal/server/`:

```env
MONGODB_URI=mongodb://localhost:27017/esme_onboarding
PORT=3000
NODE_ENV=production
```

### Frontend (Vite Configuration)

The frontend is already configured to proxy API calls to the backend on port 3000.

## Step 7: Build Frontend for Production

```bash
cd /opt/Esme_Onboarding/esme-consumer-portal
npm run build
```

This creates a `dist/` folder with optimized production files.

## Step 8: Setup PM2 Process Manager (Recommended)

PM2 ensures your services restart automatically after reboot and handles process management.

### Install PM2 globally:

```bash
sudo npm install -g pm2
```

### Create ecosystem.config.js in root directory:

```bash
cat > /opt/Esme_Onboarding/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'esme-backend',
      script: './esme-consumer-portal/server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGODB_URI: 'mongodb://localhost:27017/esme_onboarding'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log'
    },
    {
      name: 'esme-frontend',
      script: 'npx',
      args: 'vite --port 5174 --host 0.0.0.0',
      cwd: './esme-consumer-portal',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log'
    }
  ]
};
EOF
```

### Create logs directory:

```bash
mkdir -p /opt/Esme_Onboarding/logs
```

### Start services with PM2:

```bash
cd /opt/Esme_Onboarding
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 9: Setup Nginx as Reverse Proxy (Optional but Recommended)

### Install Nginx:

```bash
sudo apt-get install -y nginx
```

### Create Nginx configuration:

```bash
sudo tee /etc/nginx/sites-available/esme-onboarding << 'EOF'
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:5174;
}

server {
    listen 80;
    server_name your_domain_or_ip;

    client_max_body_size 10M;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### Enable Nginx configuration:

```bash
sudo ln -s /etc/nginx/sites-available/esme-onboarding /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 10: Verify Services

```bash
pm2 status
pm2 logs
lsof -i :3000,5174
```

Check application at:
- **Frontend**: http://your_server_ip:5174 (or http://your_server_ip if using Nginx)
- **Backend API**: http://your_server_ip:3000/api

## Step 11: Database Initialization

The MongoDB connection will be established automatically. The first super admin user will be created:

- **Email**: admin@esmeconsumer.in
- **Password**: Esme@consumer2019

## Useful Commands

### Monitor Services:
```bash
pm2 monit
```

### View Logs:
```bash
pm2 logs esme-backend
pm2 logs esme-frontend
```

### Restart Services:
```bash
pm2 restart all
```

### Stop Services:
```bash
pm2 stop all
```

### Update Code:
```bash
cd /opt/Esme_Onboarding
git pull origin main
cd esme-consumer-portal
npm install
npm run build
pm2 restart esme-backend esme-frontend
```

## SSL/HTTPS Setup (Using Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain
```

## Troubleshooting

### MongoDB not connecting:
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```

### Port already in use:
```bash
lsof -i :3000
kill -9 <PID>
```

### PM2 not starting after reboot:
```bash
pm2 startup
pm2 save
```

### High memory usage:
```bash
pm2 restart all
pm2 kill
pm2 start ecosystem.config.js
```

## Support

For issues or questions, refer to the project repository or contact the development team.

