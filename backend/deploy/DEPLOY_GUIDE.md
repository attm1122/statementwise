# Statementwise.ai Deployment Guide

## Prerequisites

- Docker Engine 24+ and Docker Compose
- Domain name configured (e.g., `api.statementwise.ai`)
- SSL certificate (Let's Encrypt recommended)
- Moonshot AI API key from https://platform.moonshot.ai

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/statementwise/backend.git
cd backend
cp deploy/.env.example .env
# Edit .env with your values
```

### 2. Generate Secrets

```bash
# Generate a strong JWT secret
openssl rand -hex 32

# Add to .env:
SECRET_KEY=<generated-secret>
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check health
docker-compose ps
curl http://localhost:8000/health
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec api alembic upgrade head

# Create admin user (optional)
docker-compose exec api python -c "
import asyncio
from scripts.create_admin import create_admin
asyncio.run(create_admin('admin@statementwise.ai', 'SecurePassword123!', 'Admin User'))
"
```

### 5. Configure SSL

```bash
# Install certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d api.statementwise.ai

# Copy to nginx
cp /etc/letsencrypt/live/api.statementwise.ai/fullchain.pem deploy/ssl/
cp /etc/letsencrypt/live/api.statementwise.ai/privkey.pem deploy/ssl/
```

### 6. Restart with SSL

```bash
docker-compose restart nginx
```

## Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Set strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS origins
- [ ] Set up firewall (allow only 443, 80)
- [ ] Enable audit logging
- [ ] Configure rate limits
- [ ] Set up DDoS protection (Cloudflare)

### Monitoring
- [ ] Configure health checks
- [ ] Set up log aggregation
- [ ] Enable Prometheus metrics
- [ ] Configure alerts (PagerDuty/Slack)
- [ ] Set up database monitoring

### Backups
- [ ] Configure PostgreSQL backups
- [ ] Set up S3 bucket versioning
- [ ] Test backup restoration
- [ ] Configure automated backups

### Scaling
- [ ] Set up load balancer
- [ ] Configure auto-scaling
- [ ] Enable database replication
- [ ] Set up CDN for assets

## Troubleshooting

### Check logs
```bash
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Database issues
```bash
# Reset database (WARNING: deletes all data!)
docker-compose down -v
docker-compose up -d postgres
```

### Moonshot API issues
```bash
# Test connectivity
curl https://api.moonshot.cn/v1/models \
  -H "Authorization: Bearer $MOONSHOT_API_KEY"
```

### Performance tuning
- Increase `WORKERS` in environment
- Add PostgreSQL read replicas
- Enable Redis clustering
- Use CDN for static assets

## Update Procedure

```bash
# Pull latest code
git pull origin main

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d

# Verify
curl http://localhost:8000/health
```
