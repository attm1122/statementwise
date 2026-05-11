# Cost & Scaling Analysis for Statementwise.ai

## 1. Per-Conversion Cost Breakdown

### Assumptions

| Parameter | Value | Notes |
|---|---|---|
| Average pages per statement | 3 pages | Consumer checking |
| Tokens per page (image, vision model) | ~2,500 tokens | Includes image encoding |
| System prompt + schema tokens | ~1,500 tokens | Cached after first call (75% discount) |
| Output JSON tokens | ~800 tokens | ~40 transactions |
| Currency | USD | All costs in USD |

### Cost Components

| Component | Tokens | Rate (/1M) | Cost |
|---|---|---|---|
| System prompt (cached, -75%) | 1,500 | $0.25 | **$0.000375** |
| PDF content (3 pages) | 7,500 | $1.00 | **$0.00750** |
| Output JSON | 800 | $3.00 | **$0.00240** |
| **Total per conversion** | **9,800** | | **~$0.0103** |

### Model Selection Cost Comparison

| Pages | Model | Input Cost | Output Cost | Total |
|---|---|---|---|---|
| 1-2 | moonshot-v1-8k-vision | $0.20/M | $2.00/M | **~$0.005** |
| 3-15 | moonshot-v1-32k-vision | $1.00/M | $3.00/M | **~$0.010** |
| 16-50 | moonshot-v1-128k-vision | $2.00/M | $5.00/M | **~$0.025** |
| 50+ | kimi-k2-0711-preview | $0.60/M | $3.00/M | **~$0.030** |

### Competitor Comparison (per conversion, 3 pages)

| Provider | Cost | Savings vs Moonshot |
|---|---|---|
| **Moonshot v1-32k-vision** | **~$0.010** | — |
| OpenAI GPT-4o | ~$0.045 | **78% more expensive** |
| Anthropic Claude 3.5 Sonnet | ~$0.075 | **86% more expensive** |
| Google Gemini 1.5 Pro | ~$0.025 | **60% more expensive** |

---

## 2. Monthly Cost Projections

### At Different Volumes

| Monthly Conversions | Avg Pages | Moonshot Cost | GPT-4o Cost | Claude 3.5 Cost |
|---|---|---|---|---|
| **1,000** | 3 | **$10.30** | $45 | $75 |
| **5,000** | 3 | **$51.50** | $225 | $375 |
| **10,000** | 3 | **$103.00** | $450 | $750 |
| **25,000** | 3 | **$257.50** | $1,125 | $1,875 |
| **50,000** | 3 | **$515.00** | $2,250 | $3,750 |
| **100,000** | 3 | **$1,030.00** | $4,500 | $7,500 |

### Including Infrastructure

| Component | 1K conv/mo | 10K conv/mo | 100K conv/mo |
|---|---|---|---|
| Moonshot API | $10 | $103 | $1,030 |
| Compute (2 vCPU, 4GB) | $30 | $75 | $300 |
| PostgreSQL (RDS) | $15 | $50 | $200 |
| Redis (Elasticache) | $10 | $25 | $75 |
| S3/MinIO Storage | $5 | $20 | $80 |
| Monitoring | $10 | $15 | $50 |
| **Total** | **$80** | **$288** | **$1,735** |

### With Revenue (at $0.50/conversion)

| Volume | Cost | Revenue | Margin | Profit |
|---|---|---|---|---|
| 1,000 | $80 | $500 | 84% | $420 |
| 10,000 | $288 | $5,000 | 94% | $4,712 |
| 100,000 | $1,735 | $50,000 | 97% | $48,265 |

---

## 3. Scaling Strategies

### 3.1 Caching

| Cache Type | Hit Rate | Cost Savings |
|---|---|---|
| **System prompt caching** (built-in) | 100% after first | 75% on input tokens |
| **PDF hash dedup** | 5-15% | Avoids reprocessing identical files |
| **Result caching** (Redis) | 20-30% | Avoids LLM call for repeated queries |
| **Export file caching** | 40-50% | Avoids re-generating exports |

**Estimated combined savings**: 30-40% on LLM costs

### 3.2 Model Selection Optimization

```python
MODEL_SELECTION_RULES = {
    "pages <= 2":   "moonshot-v1-8k-vision",    # $0.005/conv (50% cheaper)
    "pages 3-15":   "moonshot-v1-32k-vision",   # $0.010/conv (primary)
    "pages 16-50":  "moonshot-v1-128k-vision",  # $0.025/conv
    "pages > 50":   "kimi-k2-0711-preview",     # $0.030/conv
}
```

**Auto-downgrade**: If 8K model fails, retry with 32K (costs $0.005 more)
**Auto-upgrade**: If 32K context exceeded, auto-switch to 128K

### 3.3 Batching

| Batch Size | Pages | Cost/Conversion | Latency | Notes |
|---|---|---|---|---|
| Single | 3 | $0.010 | 3s | Standard |
| 2 statements | 6 | $0.018 | 5s | 10% cheaper per page |
| 5 statements | 15 | $0.045 | 8s | 15% cheaper per page |

**When to batch**: Only for same-portal, same-bank statements
**Risk**: Higher failure rate; harder to attribute errors

### 3.4 Async Processing

```
[Upload] → [Queue] → [Worker 1] → [LLM Call]
                    → [Worker 2] → [LLM Call]
                    → [Worker 3] → [LLM Call]
                    → [Worker N] → [LLM Call]
```

| Workers | Throughput | Queue Depth |
|---|---|---|
| 2 | ~40 conv/min | <10 |
| 5 | ~100 conv/min | <20 |
| 10 | ~200 conv/min | <50 |
| 20 | ~400 conv/min | <100 |

---

## 4. Fallback Strategy

### Primary Fallback Chain

```
1. moonshot-v1-32k-vision  →  Primary (99.5% success)
2. moonshot-v1-8k-vision   →  Smaller context (99.7% success)
3. kimi-k2-0711-preview    →  Larger context, text model (99.8% success)
4. moonshot-v1-128k-vision →  Largest context (99.9% success)
5. OpenAI GPT-4o           →  Fallback provider (99.99% success)
6. Manual review queue     →  Human review (100% eventually)
```

### Failure Detection & Response

| Error | Action | User Impact |
|---|---|---|
| Timeout (>120s) | Retry with exponential backoff | 5s delay |
| 5xx from Moonshot | Switch to next model | 3s delay |
| Invalid JSON | Retry with temperature=0 | 3s delay |
| Rate limit (429) | Queue + backpressure | Variable delay |
| All models fail | Queue for manual review | "Processing..." status |

### Circuit Breaker Pattern

```python
CIRCUIT_BREAKER = {
    "failure_threshold": 5,      # Open after 5 failures
    "recovery_timeout": 60,      # Try again after 60s
    "half_open_requests": 2,     # Allow 2 test requests
    "status": "closed",          # closed, open, half_open
}
```

---

## 5. Cost Optimization Checklist

- [x] **System prompt caching** — Automatic, 75% savings
- [x] **Model tier selection** — Use cheapest model that fits
- [x] **PDF deduplication** — SHA-256 hash cache in Redis
- [x] **Result caching** — Cache for 1 hour
- [x] **Export caching** — Cache for 24 hours
- [x] **Retry with fallback** — Cheaper model first
- [x] **Circuit breaker** — Prevent runaway costs during outages
- [x] **Token optimization** — Use minimal system prompt
- [x] **Temperature=0.1** — Reduce output token variance
- [x] **Monitoring** — Alert on cost spikes >200% of baseline

### Monitoring Alerts

| Alert | Condition | Action |
|---|---|---|
| Cost spike | >200% of baseline | Page on-call engineer |
| High error rate | >5% failures | Switch to fallback provider |
| Slow processing | >90th percentile latency | Scale workers |
| Low confidence | Average <0.85 | Review prompt version |
| Cache hit rate | <50% | Investigate cache config |

---

## 6. Long-Term Projections

### 12-Month Growth Scenario

| Month | Conversions | Moonshot Cost | Infra Cost | Total Cost |
|---|---|---|---|---|
| 1 | 500 | $5 | $50 | $55 |
| 3 | 2,000 | $21 | $65 | $86 |
| 6 | 5,000 | $52 | $85 | $137 |
| 9 | 15,000 | $155 | $130 | $285 |
| 12 | 30,000 | $309 | $200 | $509 |

### Revenue Projections (at $0.50/conversion)

| Month | Revenue | Cost | Margin |
|---|---|---|---|
| 1 | $250 | $55 | 78% |
| 6 | $2,500 | $137 | 95% |
| 12 | $15,000 | $509 | 97% |

### Annual Run Rate at Month 12

| Metric | Value |
|---|---|
| Monthly conversions | 30,000 |
| Monthly revenue | $15,000 |
| Monthly cost | $509 |
| **Monthly profit** | **$14,491** |
| **Annual revenue** | **$180,000** |
| **Annual cost** | **$6,108** |
| **Annual profit** | **$173,892** |
| **Net margin** | **96.6%** |
