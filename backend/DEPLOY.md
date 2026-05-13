# Backend Deployment Guide

## Quick Start (Recommended: Railway)

### 1. Deploy to Railway (5 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project from backend directory
cd backend
railway init --name statementwise-api

# Add PostgreSQL
railway add --database postgres

# Add Redis
railway add --database redis

# Set environment variables for a smoke-test deployment.
# Use ENV=staging until all production secrets below are configured.
railway variables set ENV="staging"
railway variables set MOONSHOT_API_KEY="sk-kimi-..."
railway variables set WORKERS="2"

# Deploy
railway up

# Get the deployed URL
railway domain
```

### 2. Alternative: Render (5 minutes)

1. Go to https://dashboard.render.com/
2. Click **New +** → **Blueprint**
3. Connect your GitHub repo: `attm1122/statementwise`
4. Select the `backend/render.yaml` blueprint
5. Set `MOONSHOT_API_KEY` environment variable
6. Click **Apply**

### 3. Alternative: Fly.io (10 minutes)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch
cd backend
fly launch --name statementwise-api --region iad

# Set secrets
fly secrets set MOONSHOT_API_KEY="sk-kimi-..."
fly secrets set DATABASE_URL="..."  # From Fly Postgres
fly secrets set REDIS_URL="..."      # From Upstash Redis

# Deploy
fly deploy
```

### 4. Alternative: VPS / Self-Hosted (30 minutes)

```bash
# On your VPS (Ubuntu 22.04+):

# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone repo
git clone https://github.com/attm1122/statementwise.git
cd statementwise/backend

# 3. Create .env file
cat > .env << 'EOF'
ENV=production
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql+asyncpg://sw_user:sw_pass@postgres:5432/statementwise
REDIS_URL=redis://redis:6379/0
MOONSHOT_API_KEY=sk-kimi-...
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=$(openssl rand -hex 16)
EOF

# 4. Start everything
docker compose up -d

# 5. Check health
curl http://localhost:8000/health
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MOONSHOT_API_KEY` | **YES for conversions** | Your Moonshot API key |
| `SECRET_KEY` | **YES in production** | JWT signing key (generate with `openssl rand -hex 32`) |
| `DATABASE_URL` | **YES in production** | PostgreSQL connection string |
| `REDIS_URL` | **YES in production** | Redis for caching/rate limiting |
| `ENV` | No | `development` (default), `staging`, or `production` |
| `PORT` | No | Server port (default: 8000) |
| `WORKERS` | No | Uvicorn workers (default: 4) |
| `S3_ENDPOINT` | **YES in production** | S3/MinIO endpoint for file storage |
| `S3_ACCESS_KEY` | **YES in production** | S3 access key |
| `S3_SECRET_KEY` | **YES in production** | S3 secret key |
| `ENABLE_BILLING` | No | Set `true` only after Stripe Checkout/webhooks are implemented |
| `STRIPE_SECRET_KEY` | If billing enabled | Stripe secret key |

`ENV=production` intentionally fails startup if required live services or secrets
are missing. Use `ENV=staging` on Railway while wiring databases, storage, and
payment infrastructure.

---

## Verification

After deployment, verify:

```bash
# Health check
curl https://YOUR-API-URL/health

# Should return:
# {"status": "healthy", "version": "1.0.0", "environment": "production"}
```

---

## Connecting Frontend to Backend

Update your frontend environment variable:

```bash
# In Vercel dashboard → Project → Settings → Environment Variables
VITE_API_URL=https://your-api-url/v1
```

Or update `src/services/api.ts` line 6:
```typescript
const API_BASE_URL = "https://your-api-url/v1";
```
