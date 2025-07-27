# Production Deployment Guide

## Overview

This guide covers deploying the European Night Train Advocacy Platform to `pyjama-party.back-on-track.eu` on a Linux server.

## Server Requirements

### Minimum Specifications
- **CPU**: 4 cores (ARM64 preferred)
- **Memory**: 8GB RAM
- **Storage**: 100GB SSD
- **Network**: 1TB/month bandwidth
- **Location**: Europe (Frankfurt/Amsterdam recommended)

### Software Stack
- **OS**: Ubuntu 22.04 LTS
- **Node.js**: 20.x LTS
- **PostgreSQL**: 15.x
- **Nginx**: Latest stable
- **SSL**: Let's Encrypt
- **Process Manager**: PM2

## Pre-Deployment Setup

### 1. Domain Configuration
Work with Back-on-Track IT admin to configure:
```bash
# DNS A record
pyjama-party.back-on-track.eu → [server-ip]

# SSL certificate (Let's Encrypt)
certbot certonly --nginx -d pyjama-party.back-on-track.eu
```

### 2. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-client-15

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Database Setup
```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE pyjama_party;
CREATE USER pyjama_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pyjama_party TO pyjama_user;
ALTER USER pyjama_user CREATEDB;
\q

# Load database schema
psql -h localhost -U pyjama_user -d pyjama_party < data/places-setup.sql
```

## Application Deployment

### 1. Clone and Build
```bash
# Create application directory
sudo mkdir -p /var/www/pyjama-party
sudo chown $USER:$USER /var/www/pyjama-party

# Clone repository
cd /var/www/pyjama-party
git clone [repository-url] .

# Install dependencies
npm ci --only=production

# Build application
npm run build
```

### 2. Environment Configuration
Create `/var/www/pyjama-party/.env.production`:
```bash
NODE_ENV=production

# Database
DATABASE_URL=postgresql://pyjama_user:secure_password@localhost:5432/pyjama_party

# Mapbox (required)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_production_token

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External APIs
OPENRAILMAPS_API_KEY=your_production_key

# Monitoring
SENTRY_DSN=your_production_sentry_dsn

# Communication
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook
SMTP_HOST=smtp.eu.mailgun.org
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Security
JWT_SECRET=your_very_secure_jwt_secret
CSRF_SECRET=your_csrf_secret
```

### 3. PM2 Configuration
Create `/var/www/pyjama-party/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'pyjama-party',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/pyjama-party',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pyjama-party/error.log',
    out_file: '/var/log/pyjama-party/access.log',
    log_file: '/var/log/pyjama-party/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

### 4. Start Application
```bash
# Create log directory
sudo mkdir -p /var/log/pyjama-party
sudo chown $USER:$USER /var/log/pyjama-party

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

## Nginx Configuration

Create `/etc/nginx/sites-available/pyjama-party.back-on-track.eu`:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=2r/s;

server {
    listen 80;
    server_name pyjama-party.back-on-track.eu;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pyjama-party.back-on-track.eu;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/pyjama-party.back-on-track.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pyjama-party.back-on-track.eu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Static Files Caching
    location /_next/static {
        alias /var/www/pyjama-party/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /assets {
        alias /var/www/pyjama-party/public/assets;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # API Rate Limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
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
    
    # General Rate Limiting
    location / {
        limit_req zone=general burst=10 nodelay;
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
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/pyjama-party.back-on-track.eu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## CI/CD Pipeline

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/pyjama-party
            git pull origin main
            npm ci --only=production
            npm run build
            pm2 reload pyjama-party
```

### GitHub Secrets
Configure in repository settings:
- `SERVER_HOST`: Server IP address
- `SERVER_USER`: SSH username
- `SERVER_SSH_KEY`: Private SSH key

## Database Backup Strategy

### Automated Backups
Create `/var/www/pyjama-party/scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pyjama-party"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pyjama_party"
DB_USER="pyjama_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://pyjama-party-backups/
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /var/www/pyjama-party/scripts/backup.sh
```

## Monitoring & Logging

### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor PM2 processes
pm2 monit

# Check application logs
pm2 logs pyjama-party

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks
Create `/var/www/pyjama-party/scripts/health-check.sh`:
```bash
#!/bin/bash
HEALTH_URL="https://pyjama-party.back-on-track.eu/api/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $STATUS -eq 200 ]; then
    echo "$(date): Health check passed"
else
    echo "$(date): Health check failed with status $STATUS"
    # Restart application
    pm2 restart pyjama-party
fi
```

## Security Considerations

### Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL only from localhost
sudo ufw allow from 127.0.0.1 to any port 5432
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Environment Security
```bash
# Secure environment file
chmod 600 /var/www/pyjama-party/.env.production
chown root:root /var/www/pyjama-party/.env.production
```

## Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check PM2 logs
pm2 logs pyjama-party --lines 50

# Check environment variables
pm2 env pyjama-party

# Restart application
pm2 restart pyjama-party
```

**Database connection issues:**
```bash
# Test database connection
psql -h localhost -U pyjama_user -d pyjama_party -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql
```

**Nginx configuration issues:**
```bash
# Test configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Reload configuration
sudo systemctl reload nginx
```

### Performance Tuning

**Node.js optimization:**
```bash
# Increase memory limit in PM2
pm2 restart pyjama-party --node-args="--max_old_space_size=2048"
```

**PostgreSQL optimization:**
```sql
-- Add to /etc/postgresql/15/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 2GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
```

## Maintenance

### Regular Tasks
- Monitor disk space and logs
- Update dependencies monthly
- Review security updates weekly
- Test backup restoration quarterly
- Performance monitoring daily

### Update Procedure
```bash
# Pull latest changes
cd /var/www/pyjama-party
git pull origin main

# Update dependencies
npm ci --only=production

# Run database migrations (if any)
npm run db:migrate

# Build application
npm run build

# Restart application
pm2 restart pyjama-party

# Verify deployment
curl -f https://pyjama-party.back-on-track.eu/api/health
```

## Support

For deployment issues, contact:
- Back-on-Track IT admin for DNS/server access
- Development team for application issues
- System administrator for server maintenance

---

This deployment guide ensures a secure, performant, and maintainable production environment for the European Night Train Advocacy Platform.