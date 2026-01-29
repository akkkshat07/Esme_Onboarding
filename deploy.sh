#!/bin/bash

set -e

echo "========================================="
echo "ESME Onboarding Portal - Setup Script"
echo "========================================="
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "This script must be run with sudo"
    exit 1
fi

INSTALL_DIR="/opt/Esme_Onboarding"

echo "Step 1: Updating system packages..."
apt-get update
apt-get upgrade -y

echo ""
echo "Step 2: Installing Node.js v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

echo ""
echo "Step 3: Installing MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt-get update
apt-get install -y mongodb-org

systemctl start mongod
systemctl enable mongod

echo ""
echo "Step 4: Cloning repository..."
if [ ! -d "$INSTALL_DIR" ]; then
    git clone https://github.com/akkkshat07/Esme_Onboarding.git "$INSTALL_DIR"
else
    echo "Repository already exists at $INSTALL_DIR"
    cd "$INSTALL_DIR"
    git pull origin main
fi

cd "$INSTALL_DIR"

echo ""
echo "Step 5: Installing frontend dependencies..."
cd "$INSTALL_DIR/esme-consumer-portal"
npm install

echo ""
echo "Step 6: Installing backend dependencies..."
cd "$INSTALL_DIR/esme-consumer-portal/server"
npm install

echo ""
echo "Step 7: Building frontend for production..."
cd "$INSTALL_DIR/esme-consumer-portal"
npm run build

echo ""
echo "Step 8: Installing PM2 globally..."
npm install -g pm2

echo ""
echo "Step 9: Creating ecosystem.config.js..."
cat > "$INSTALL_DIR/ecosystem.config.js" << 'ECOSYSTEM_EOF'
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
ECOSYSTEM_EOF

echo ""
echo "Step 10: Creating logs directory..."
mkdir -p "$INSTALL_DIR/logs"

echo ""
echo "Step 11: Starting services with PM2..."
cd "$INSTALL_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup -u root --hp /root

echo ""
echo "Step 12: Installing Nginx..."
apt-get install -y nginx

echo ""
echo "Step 13: Configuring Nginx..."
cat > /etc/nginx/sites-available/esme-onboarding << 'NGINX_EOF'
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:5174;
}

server {
    listen 80;
    server_name _;

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
NGINX_EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/esme-onboarding /etc/nginx/sites-enabled/

nginx -t
systemctl restart nginx
systemctl enable nginx

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Application is ready at:"
echo "  → http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Services Status:"
pm2 status
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@esmeconsumer.in"
echo "  Password: Esme@consumer2019"
echo ""
echo "Useful commands:"
echo "  → pm2 logs         (View logs)"
echo "  → pm2 monit        (Monitor services)"
echo "  → pm2 restart all  (Restart all services)"
echo ""
