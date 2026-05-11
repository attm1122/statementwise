# Statementwise.ai Backend Architecture

## 1. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Python | 3.11+ | Core language |
| **Framework** | FastAPI | 0.115+ | API framework |
| **Database** | PostgreSQL | 16 | Primary data store |
| **ORM** | SQLAlchemy | 2.0+ | Async ORM |
| **Migrations** | Alembic | 1.13+ | Schema migrations |
| **Cache** | Redis | 7.2+ | Caching, rate limiting, sessions |
| **Queue** | Celery + Redis | 5.3+ | Async task processing |
| **Storage** | MinIO (S3-compatible) | latest | File storage |
| **Container** | Docker + Compose | 24+ | Containerization |
| **Reverse Proxy** | Nginx | 1.25+ | Load balancing, SSL termination |
| **Monitoring** | Prometheus + Grafana | latest | Metrics and alerting |

---

## 2. Service Decomposition

```
                    +------------------+
                    |     Client       |
                    |  (React/TS App)  |
                    +--------+---------+
                             |
                    +--------v---------+
                    |   Nginx (LB)     |
                    +--------+---------+
                             |
            +----------------v------------------+
            |         FastAPI App                |
            |  +---------------------------+     |
            |  |   Middleware Layer        |     |
            |  | - CORS, Rate Limiting     |     |
            |  | - JWT/API Key Auth        |     |
            |  | - Request Logging         |     |
            |  +---------------------------+     |
            |  |   Router Layer              |     |
            |  | - auth, convert, dashboard  |     |
            |  | - portal, billing, api_keys |     |
            |  | - webhooks, admin           |     |
            |  +---------------------------+     |
            +-----------------+------------------+
                              |
            +-----------------+------------------+
            |                                  |
   +--------v----------+            +----------v---------+
   |   Celery Workers   |            |   PostgreSQL 16    |
   |  +--------------+  |            |  +--------------+  |
   |  | PDF Processor |  |            |  | Users        |  |
   |  | LLM Extractor |  |            |  | Conversions  |  |
   |  | Export Gen    |  |            |  | Transactions |  |
   |  | Email Sender  |  |            |  | Portals      |  |
   |  +--------------+  |            |  | Credits      |  |
   +--------+----------+            |  | API Keys     |  |
            |                       |  +--------------+  |
   +--------v----------+            +--------------------+
   |     Redis 7.2     |
   |  +--------------+ |
   |  | Task Queue    | |
   |  | Rate Limiting | |
   |  | Session Store | |
   |  | Result Cache  | |
   |  +--------------+ |
   +-------------------+
            |
   +--------v----------+
   |   MinIO (S3)      |
   |  +--------------+ |
   |  | PDF Uploads   | |
   |  | Export Files  | |
   |  | Result JSON   | |
   |  +--------------+ |
   +-------------------+
```

---

## 3. Database Schema

### 3.1 Users Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    company_name    VARCHAR(255),
    role            VARCHAR(20) NOT NULL DEFAULT 'user',
                    -- enum: user, admin, accountant, viewer
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
                    -- enum: active, suspended, deleted
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url      VARCHAR(500),
    timezone        VARCHAR(50) DEFAULT 'UTC',
    locale          VARCHAR(10) DEFAULT 'en',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
```

### 3.2 Conversions Table

```sql
CREATE TABLE conversions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portal_id           UUID REFERENCES portals(id) ON DELETE SET NULL,
    filename            VARCHAR(255) NOT NULL,
    original_file_key   VARCHAR(500) NOT NULL,
    file_size_bytes     BIGINT NOT NULL,
    page_count          INTEGER,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
                        -- enum: pending, processing, extracting, validating,
                        --       completed, failed, cancelled
    model_used          VARCHAR(50),
    credits_consumed    DECIMAL(10,4) NOT NULL DEFAULT 0,
    statement_metadata  JSONB,
    opening_balance     JSONB,
    closing_balance     JSONB,
    summary             JSONB,
    reconciliation      JSONB,
    error_message       TEXT,
    error_code          VARCHAR(50),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversions_user_id ON conversions(user_id);
CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_conversions_created_at ON conversions(created_at);
CREATE INDEX idx_conversions_portal_id ON conversions(portal_id);
```

### 3.3 Transactions Table

```sql
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_id   UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description     TEXT NOT NULL,
    reference       VARCHAR(255),
    category        VARCHAR(100),
    debit           DECIMAL(15,2),
    credit          DECIMAL(15,2),
    amount          DECIMAL(15,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    running_balance DECIMAL(15,2),
    confidence_score DECIMAL(3,2), -- LLM confidence
    raw_text        TEXT,         -- Original extracted text
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_conversion_id ON transactions(conversion_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### 3.4 Portals Table

```sql
CREATE TABLE portals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
                    -- enum: active, archived, suspended
    branding_color  VARCHAR(7) DEFAULT '#2563EB',
    logo_url        VARCHAR(500),
    custom_domain   VARCHAR(255),
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portals_owner_id ON portals(owner_id);
CREATE INDEX idx_portals_slug ON portals(slug);
```

### 3.5 Portal Members Table

```sql
CREATE TABLE portal_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portal_id   UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL DEFAULT 'viewer',
                -- enum: admin, accountant, viewer
    invited_by  UUID REFERENCES users(id),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(portal_id, user_id)
);

CREATE INDEX idx_portal_members_portal_id ON portal_members(portal_id);
CREATE INDEX idx_portal_members_user_id ON portal_members(user_id);
```

### 3.6 Credits Table

```sql
CREATE TABLE credits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance         DECIMAL(10,2) NOT NULL DEFAULT 0,
    lifetime_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    lifetime_used   DECIMAL(10,2) NOT NULL DEFAULT 0,
    subscription_plan VARCHAR(50),
    monthly_quota   INTEGER,
    resets_at       TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_credits_user_id ON credits(user_id);
```

### 3.7 Credit Transactions Table

```sql
CREATE TABLE credit_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversion_id   UUID REFERENCES conversions(id) ON DELETE SET NULL,
    type            VARCHAR(20) NOT NULL,
                    -- enum: purchase, usage, bonus, refund, grant
    amount          DECIMAL(10,2) NOT NULL,
    description     TEXT NOT NULL,
    stripe_payment_id VARCHAR(255),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

### 3.8 API Keys Table

```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    key_prefix      VARCHAR(8) NOT NULL,
    key_hash        VARCHAR(255) NOT NULL,
    permissions     JSONB NOT NULL DEFAULT '["read", "write"]',
    rate_limit_rpm  INTEGER DEFAULT 60,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

### 3.9 Prompt Versions Table

```sql
CREATE TABLE prompt_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version         VARCHAR(20) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    system_prompt   TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    json_schema     JSONB NOT NULL,
    few_shot_examples JSONB,
    temperature     DECIMAL(3,2) NOT NULL DEFAULT 0.1,
    model           VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    accuracy_score  DECIMAL(5,2),
    usage_count     INTEGER NOT NULL DEFAULT 0,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_versions_active ON prompt_versions(is_active);
```

---

## 4. File Pipeline

```
[Upload] → [Validation] → [Storage] → [OCR/Extraction] → [LLM] → [Validation] → [Storage]
   |             |              |              |           |          |           |
   |             |              |              |           |          |           |
   v             v              v              v           v          v           v
 Size/Page    Checksum     MinIO/S3     pdfplumber   Moonshot   Balance    JSON/DB
 Type Check   Duplicate    Presigned    pdf2image    API        Reconcile  Exports
```

### Pipeline Stages

| Stage | Component | Description |
|---|---|---|
| **1. Upload** | FastAPI endpoint | Accept multipart/form-data, stream to temp storage |
| **2. Validation** | `conversion.py` | File size (<50MB), type (PDF only), page count (<100) |
| **3. Storage** | MinIO/S3 | Upload original PDF with UUID key, generate presigned URL |
| **4. Text Extraction** | `pdfplumber` | Extract text from text-based PDFs, detect if scanned |
| **5. Image Extraction** | `pdf2image` | Convert scanned PDF pages to PNG for vision model |
| **6. LLM Extraction** | Moonshot API | Send images + prompt, receive structured JSON |
| **7. Validation** | `validation.py` | Balance reconciliation, schema validation |
| **8. Storage** | PostgreSQL | Store transactions, metadata, reconciliation results |

---

## 5. Queue System (Celery + Redis)

### Task Definitions

```python
# Celery task routing
task_routes = {
    'tasks.convert_pdf':         {'queue': 'conversion'},
    'tasks.extract_with_llm':    {'queue': 'llm'},
    'tasks.generate_export':     {'queue': 'export'},
    'tasks.send_webhook':        {'queue': 'webhooks'},
    'tasks.send_email':          {'queue': 'notifications'},
    'tasks.cleanup_old_files':   {'queue': 'maintenance'},
}
```

### Task Flow

```
[API Endpoint] → Celery task "convert_pdf" → Queue: conversion
       ↓
[Worker: conversion] → Extract text/images → Update DB status
       ↓
[Chain] → Celery task "extract_with_llm" → Queue: llm
       ↓
[Worker: llm] → Call Moonshot API → Parse JSON → Store results
       ↓
[Chain] → Celery task "validate_and_store" → Queue: conversion
       ↓
[Worker: conversion] → Validate balances → Update DB → Trigger webhooks
```

---

## 6. Caching Strategy

| Cache Type | Key Pattern | TTL | Purpose |
|---|---|---|---|
| **Rate limiting** | `rate_limit:{user_id}:{endpoint}` | 60s | Request throttling |
| **Credit balance** | `credits:{user_id}` | 30s | Fast credit checks |
| **Conversion result** | `conversion:{conversion_id}` | 1 hour | Repeated result queries |
| **PDF duplicate** | `pdf_hash:{sha256}` | 24 hours | Duplicate detection |
| **User session** | `session:{jwt_id}` | Token expiry | Session validation |
| **Export file** | `export:{conversion_id}:{format}` | 24 hours | Avoid re-generating exports |
| **Prompt version** | `prompt:active` | 5 minutes | Active prompt caching |

---

## 7. Security Architecture

### 7.1 Authentication Layers

```
[Request] → CORS Check → Rate Limit → Auth Layer → Handler
                          |            |
                          |            +-- JWT Cookie (web users)
                          |            +-- API Key Header (API users)
                          |            +-- OAuth2 Bearer (future)
                          |
                          +-- Redis sliding window counter
```

### 7.2 Security Measures

| Layer | Implementation |
|---|---|
| **Transport** | TLS 1.3 via Nginx; HSTS headers |
| **Auth Tokens** | JWT RS256 signed; 15-min access + 7-day refresh |
| **API Keys** | Hashed with bcrypt; prefix visible; rotate every 90 days |
| **Passwords** | Argon2id hashing; min 12 characters |
| **File Uploads** | Size limits; type validation; isolated temp storage; virus scan |
| **Data at Rest** | AES-256 encryption for sensitive fields (account numbers) |
| **Data in Transit** | TLS 1.3 for all internal/external communication |
| **Input Sanitization** | Pydantic validation; SQL injection prevention via ORM |
| **Output Encoding** | JSON serialization; XSS prevention headers |
| **Audit Logging** | All auth events, credit changes, data exports logged |
| **CORS** | Strict origin whitelist; credentials only for known domains |
| **Rate Limiting** | Tiered: Free (10/hr), Basic (100/hr), Pro (1000/hr), Enterprise (custom) |

### 7.3 Data Privacy

- **PII Masking**: Account numbers stored encrypted; only last 4 digits displayed
- **Data Retention**: PDFs deleted after 30 days; transaction data retained per plan
- **GDPR Compliance**: Right to erasure; data export; consent tracking
- **SOC 2 Alignment**: Audit logs; access controls; encryption

---

## 8. API Design

### Base URL
```
Production:  https://api.statementwise.ai/v1
Development: http://localhost:8000/v1
```

### Authentication
```
JWT (Web):    Cookie: access_token=<jwt>
API Key:      Header: X-API-Key: sw_<key>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "You need 1.0 more credits to perform this conversion",
    "details": { "required": 2.0, "available": 1.0 }
  }
}
```

---

## 9. Scaling Strategy

### Horizontal Scaling

```
                    +-----------------+
                    |   Cloud LB      |
                    +--------+--------+
                             |
              +--------------+--------------+
              |              |              |
       +------v------+ +-----v------+ +----v-------+
       | FastAPI #1  | | FastAPI #2 | | FastAPI #3 |
       |  (Docker)   | |  (Docker)  | |  (Docker)  |
       +------+------+ +-----+------+ +----+-------+
              |              |              |
              +--------------+--------------+
                             |
                    +--------v---------+
                    |   PostgreSQL     |
                    |   (Primary)      |
                    +--------+---------+
                             |
                    +--------v---------+
                    |   PostgreSQL     |
                    |   (Read Replica) |
                    +------------------+
                             |
                    +--------v---------+
                    |   Redis Cluster  |
                    +------------------+
                             |
                    +--------v---------+
                    |   MinIO Cluster  |
                    +------------------+
```

### Scaling Triggers

| Metric | Threshold | Action |
|---|---|---|
| API CPU > 70% | 2 min | Scale FastAPI containers (+1) |
| Queue depth > 100 | 1 min | Scale Celery workers (+2) |
| DB connections > 80% | 5 min | Enable read replica |
| Redis memory > 80% | 5 min | Evict oldest cache entries |
| Disk usage > 85% | Immediate | Cleanup old PDFs |

---

## 10. Monitoring & Observability

### Metrics

| Category | Metrics |
|---|---|
| **API** | Request rate, latency (p50/p95/p99), error rate |
| **Conversion** | Throughput, success rate, avg processing time |
| **LLM** | Cost per conversion, token usage, error rate |
| **Business** | Active users, conversion count, credit purchases |
| **Infrastructure** | CPU, memory, disk, DB connections, Redis memory |

### Alerting

| Severity | Condition | Channel |
|---|---|---|
| **Critical** | API down > 1 min, DB unavailable | PagerDuty + Slack |
| **High** | Error rate > 5%, LLM API down | Slack |
| **Medium** | Queue depth > 500, CPU > 85% | Slack |
| **Low** | Disk usage > 80%, cert expiry < 7 days | Email |
