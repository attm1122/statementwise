# Statementwise.ai - Secure Deployment Checklist

**Document Version:** 1.0  
**Date:** 2025-01-15  
**Classification:** CONFIDENTIAL - INTERNAL USE ONLY  
**Owner:** Chief Information Security Officer (CISO) / DevOps Lead  
**Usage:** Required for every production deployment  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Pre-Deployment Verification](#2-pre-deployment-verification)
3. [SSL/TLS Configuration](#3-ssltls-configuration)
4. [Security Headers](#4-security-headers)
5. [Content Security Policy](#5-content-security-policy)
6. [File Permissions](#6-file-permissions)
7. [Environment Variables](#7-environment-variables)
8. [Database Security](#8-database-security)
9. [Network Security](#9-network-security)
10. [Monitoring and Alerting](#10-monitoring-and-alerting)
11. [Backup Verification](#11-backup-verification)
12. [Incident Response Readiness](#12-incident-response-readiness)
13. [Communication Plan](#13-communication-plan)
14. [Deployment Sign-Off](#14-deployment-sign-off)
15. [Post-Deployment Verification](#15-post-deployment-verification)

---

## 1. Overview

This checklist must be completed before every production deployment. It ensures that all security controls are verified and operational before new code or infrastructure changes are exposed to users.

### 1.1 Usage Instructions

1. **Download** a fresh copy of this checklist for each deployment
2. **Complete** all mandatory checks (marked with [M])
3. **Document** results with evidence/screenshots
4. **Escalate** any failed checks before deployment
5. **Obtain** sign-off from required approvers
6. **Archive** completed checklist with deployment records

### 1.2 Deployment Classification

| Type | Description | Checklist Scope | Approvers |
|------|-------------|----------------|-----------|
| **Standard** | Routine deployment of pre-approved changes | Sections 1-10 | DevOps Lead |
| **Major** | Significant feature release or infrastructure change | All sections | DevOps Lead + Security Lead |
| **Emergency** | Critical security patch or hotfix | Sections 1-10 (abbreviated) | On-call DevOps + On-call Security |
| **Infrastructure** | Changes to cloud infrastructure, networking, or IAM | All sections | DevOps Lead + Security Lead + CISO |

### 1.3 Checklist Summary

| Category | Checks | Mandatory | Status |
|----------|--------|-----------|--------|
| Pre-Deployment | 12 | All | [ ] |
| SSL/TLS | 8 | All | [ ] |
| Security Headers | 18 | All | [ ] |
| CSP | 10 | All | [ ] |
| File Permissions | 8 | All | [ ] |
| Environment Variables | 10 | All | [ ] |
| Database Security | 10 | All | [ ] |
| Network Security | 10 | All | [ ] |
| Monitoring | 8 | All | [ ] |
| Backup Verification | 5 | All | [ ] |
| IR Readiness | 5 | All | [ ] |
| Communication | 4 | Major/Infra | [ ] |
| **TOTAL** | **108** | | |

---

## 2. Pre-Deployment Verification

### 2.1 Code and Build Verification

| # | Check | Priority | Status | Evidence | Notes |
|---|-------|----------|--------|----------|-------|
| 2.1.1 | [M] Code review completed by at least one senior engineer | P0 | [ ] | PR approval | |
| 2.1.2 | [M] Security review completed for all changes | P0 | [ ] | Security approval | |
| 2.1.3 | [M] No secrets or credentials in code | P0 | [ ] | git-secrets scan result | |
| 2.1.4 | [M] All dependencies scanned for vulnerabilities | P0 | [ ] | Snyk/Dependabot report | |
| 2.1.5 | [M] No high/critical vulnerability findings | P0 | [ ] | Scan results | |
| 2.1.6 | [M] Container image scanned before deployment | P0 | [ ] | Trivy/Clair scan | |
| 2.1.7 | [M] Build provenance documented (commit hash, build ID) | P1 | [ ] | Build log | |
| 2.1.8 | [M] Rollback plan documented and tested | P1 | [ ] | Rollback procedure | |
| 2.1.9 | [M] Staging deployment tested and passed | P0 | [ ] | Test results | |
| 2.1.10 | [M] Integration tests passed | P0 | [ ] | CI/CD pipeline | |
| 2.1.11 | [M] Performance impact assessed | P1 | [ ] | Performance test results | |
| 2.1.12 | [M] Database migration plan reviewed | P1 | [ ] | Migration review | |

### 2.2 Change Control

| # | Check | Priority | Status | Evidence | Notes |
|---|-------|----------|--------|----------|-------|
| 2.2.1 | [M] Change request documented | P0 | [ ] | Change ticket | |
| 2.2.2 | [M] Backward compatibility verified | P1 | [ ] | Test results | |
| 2.2.3 | [M] Feature flags configured if needed | P1 | [ ] | Flag config | |
| 2.2.4 | [M] Rollback window identified | P1 | [ ] | Deployment plan | |

---

## 3. SSL/TLS Configuration

### 3.1 TLS Configuration Verification

| # | Check | Priority | Status | Evidence | Notes |
|---|-------|----------|--------|----------|-------|
| 3.1.1 | [M] TLS 1.3 enforced (no fallback to older versions) | P0 | [ ] | SSL Labs scan | Command: `nmap --script ssl-enum-ciphers -p 443 app.statementwise.ai` |
| 3.1.2 | [M] TLS 1.2 minimum for legacy compatibility (if needed) | P0 | [ ] | SSL Labs scan | Document exception if enabled |
| 3.1.3 | [M] SSL v2/v3 disabled | P0 | [ ] | SSL Labs scan | |
| 3.1.4 | [M] Weak cipher suites disabled | P0 | [ ] | SSL Labs scan | No RC4, DES, 3DES, MD5, SHA1 |
| 3.1.5 | [M] Perfect Forward Secrecy (PFS) enabled | P0 | [ ] | SSL Labs scan | ECDHE/DHE cipher suites |
| 3.1.6 | [M] HSTS header configured | P0 | [ ] | Header check | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| 3.1.7 | [M] Valid certificate (not expired, correct domain) | P0 | [ ] | Certificate check | |
| 3.1.8 | [M] Certificate chain complete and trusted | P0 | [ ] | SSL Labs scan | |

### 3.2 TLS Configuration Reference

```nginx
# TLS Configuration (Nginx/ALB equivalent)
ssl_protocols TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 3.3 TLS Verification Commands

```bash
# SSL Labs scan
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=app.statementwise.ai

# Command-line verification
echo "=== TLS Version Check ==="
openssl s_client -connect app.statementwise.ai:443 -tls1_3 2>/dev/null | grep "Protocol"

echo "=== Cipher Suites ==="
nmap --script ssl-enum-ciphers -p 443 app.statementwise.ai

echo "=== HSTS Header ==="
curl -sI https://app.statementwise.ai | grep -i strict-transport-security

echo "=== Certificate Expiry ==="
echo | openssl s_client -connect app.statementwise.ai:443 2>/dev/null | openssl x509 -noout -dates

echo "=== Overall Grade ==="
# Expected: A+ on SSL Labs
```

---

## 4. Security Headers

### 4.1 Security Headers Checklist

| # | Header | Expected Value | Priority | Status | Evidence |
|---|--------|---------------|----------|--------|----------|
| 4.1.1 | [M] Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | P0 | [ ] | curl output |
| 4.1.2 | [M] Content-Security-Policy | [See Section 5] | P0 | [ ] | curl output |
| 4.1.3 | [M] X-Content-Type-Options | `nosniff` | P0 | [ ] | curl output |
| 4.1.4 | [M] X-Frame-Options | `DENY` | P0 | [ ] | curl output |
| 4.1.5 | [M] X-XSS-Protection | `1; mode=block` | P1 | [ ] | curl output |
| 4.1.6 | [M] Referrer-Policy | `strict-origin-when-cross-origin` | P1 | [ ] | curl output |
| 4.1.7 | [M] Permissions-Policy | See reference below | P1 | [ ] | curl output |
| 4.1.8 | [M] Cross-Origin-Embedder-Policy | `require-corp` | P1 | [ ] | curl output |
| 4.1.9 | [M] Cross-Origin-Opener-Policy | `same-origin` | P1 | [ ] | curl output |
| 4.1.10 | [M] Cross-Origin-Resource-Policy | `same-origin` | P1 | [ ] | curl output |
| 4.1.11 | [M] Cache-Control (sensitive pages) | `no-store, no-cache, must-revalidate, proxy-revalidate` | P0 | [ ] | curl output |
| 4.1.12 | [M] Pragma (sensitive pages) | `no-cache` | P1 | [ ] | curl output |
| 4.1.13 | [M] Expires (sensitive pages) | `0` | P1 | [ ] | curl output |
| 4.1.14 | [M] Clear-Site-Data (on logout) | `"cookies", "storage", "cache"` | P2 | [ ] | curl output |
| 4.1.15 | [M] Server header sanitized | Remove or generic value | P2 | [ ] | curl output |
| 4.1.16 | [M] X-Powered-By removed | Header absent | P2 | [ ] | curl output |
| 4.1.17 | [M] X-AspNet-Version removed | Header absent | P2 | [ ] | curl output |
| 4.1.18 | [M] X-AspNetMvc-Version removed | Header absent | P2 | [ ] | curl output |

### 4.2 Security Headers Reference Configuration

```python
# FastAPI Security Headers Middleware
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # HSTS
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'nonce-{nonce}' https://cdn.statementwise.ai; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: blob: https://cdn.statementwise.ai; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://api.statementwise.ai wss://*.statementwise.ai; "
            "media-src 'self'; "
            "object-src 'none'; "
            "frame-ancestors 'none'; "
            "frame-src 'none'; "
            "worker-src 'self'; "
            "manifest-src 'self'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "upgrade-insecure-requests; "
            "block-all-mixed-content"
        )
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS Protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), "
            "camera=(), "
            "geolocation=(), "
            "gyroscope=(), "
            "magnetometer=(), "
            "microphone=(), "
            "payment=(), "
            "usb=(), "
            "interest-cohort=()"
        )
        
        # Cross-Origin policies
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        
        # Cache control for sensitive data
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = (
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            )
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        # Remove server information
        response.headers.pop("Server", None)
        response.headers.pop("X-Powered-By", None)
        
        return response
```

### 4.3 Header Verification Commands

```bash
#!/bin/bash
echo "=== Security Headers Verification ==="

URL="https://app.statementwise.ai"

echo ""
echo "--- Checking all security headers ---"
curl -sI "$URL" | grep -E "^(Strict-Transport-Security|Content-Security-Policy|X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Referrer-Policy|Permissions-Policy|Cross-Origin)"

echo ""
echo "--- Checking for information disclosure headers ---"
curl -sI "$URL" | grep -iE "^(Server|X-Powered-By|X-AspNet)"
if [ $? -ne 0 ]; then
    echo "PASS: No information disclosure headers found"
fi

echo ""
echo "--- Checking cache headers for API ---"
curl -sI "${URL}/api/v1/user" | grep -E "^(Cache-Control|Pragma|Expires)"

echo ""
echo "--- Security Headers Score ---"
# Use securityheaders.com scan
echo "Visit: https://securityheaders.com/?q=${URL}&followRedirects=on"
echo "Expected: A+ rating"
```

---

## 5. Content Security Policy

### 5.1 CSP Validation Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 5.1.1 | [M] `default-src 'self'` set | P0 | [ ] | Header output |
| 5.1.2 | [M] No `unsafe-inline` in script-src (use nonces/hashes) | P0 | [ ] | Header output |
| 5.1.3 | [M] No `unsafe-eval` in script-src | P0 | [ ] | Header output |
| 5.1.4 | [M] `object-src 'none'` set | P0 | [ ] | Header output |
| 5.1.5 | [M] `frame-ancestors 'none'` set | P0 | [ ] | Header output |
| 5.1.6 | [M] `upgrade-insecure-requests` directive present | P1 | [ ] | Header output |
| 5.1.7 | [M] `block-all-mixed-content` directive present | P1 | [ ] | Header output |
| 5.1.8 | [M] Wildcards (*) not used in critical directives | P0 | [ ] | Header output |
| 5.1.9 | [M] `data:` scheme restricted in script-src | P0 | [ ] | Header output |
| 5.1.10 | [M] CSP violation reporting configured | P1 | [ ] | Report URI config |

### 5.2 CSP Testing

```bash
# Test CSP with report-only mode first
echo "=== CSP Testing ==="

# 1. Check CSP header exists
echo "CSP Header:"
curl -sI https://app.statementwise.ai | grep -i content-security-policy

# 2. Test for CSP bypass vectors
echo ""
echo "--- Testing script-src for unsafe-inline ---"
curl -sI https://app.statementwise.ai | grep -i "script-src" | grep -i "unsafe-inline" && echo "FAIL: unsafe-inline found" || echo "PASS: no unsafe-inline"

echo "--- Testing for wildcard ---"
curl -sI https://app.statementwise.ai | grep -i "script-src" | grep "\*" && echo "FAIL: wildcard found" || echo "PASS: no wildcard"

# 3. Test CSP violation reporting
echo "--- CSP Report URI ---"
curl -sI https://app.statementwise.ai | grep -i "report-uri\|report-to"
```

### 5.3 CSP Report-Only Testing

Before enforcing CSP in production:

```python
# Phase 1: Report-Only (monitor for 2 weeks)
response.headers["Content-Security-Policy-Report-Only"] = CSP_POLICY

# Phase 2: Review violations
# Check CSP reporting endpoint for violations

# Phase 3: Enforce (after violations resolved)
response.headers["Content-Security-Policy"] = CSP_POLICY
```

---

## 6. File Permissions

### 6.1 File and Directory Permission Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 6.1.1 | [M] Application files not writable by web server user | P0 | [ ] | Permission check |
| 6.1.2 | [M] Configuration files readable only by application user | P0 | [ ] | Permission check |
| 6.1.3 | [M] Log files writable only by application user | P0 | [ ] | Permission check |
| 6.1.4 | [M] Temporary upload directory isolated and restricted | P0 | [ ] | Permission check |
| 6.1.5 | [M] No world-writable files in application directory | P0 | [ ] | Permission check |
| 6.1.6 | [M] SSH keys and certificates protected (600) | P0 | [ ] | Permission check |
| 6.1.7 | [M] No sensitive files in web root (logs, configs, backups) | P0 | [ ] | File listing |
| 6.1.8 | [M] Container runs as non-root user | P0 | [ ] | Dockerfile review |

### 6.2 Container Security Permissions

```dockerfile
# Dockerfile - Security Hardened
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set secure permissions
WORKDIR /app
COPY --chown=appuser:appuser . .
RUN chmod -R 755 /app && \
    chmod 644 /app/*.py /app/*.json /app/*.toml && \
    chmod 600 /app/secrets/* 2>/dev/null || true

# Switch to non-root user
USER appuser

# Run application
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6.3 Permission Verification

```bash
#!/bin/bash
echo "=== File Permission Verification ==="

# Container permission check
echo "--- Container runs as non-root ---"
docker run --rm statementwise-api:latest id
# Expected: uid=999(appuser) gid=999(appuser)

echo "--- File permissions in container ---"
docker run --rm statementwise-api:latest ls -la /app

echo "--- No world-writable files ---"
docker run --rm statementwise-api:latest find /app -type f -perm -002
# Expected: No output

echo "--- Secret file permissions ---"
docker run --rm statementwise-api:latest ls -la /app/secrets/ 2>/dev/null || echo "No secrets directory in image (good - should use Secrets Manager)"

# S3 bucket permissions
echo ""
echo "=== S3 Bucket Permissions ==="
aws s3api get-public-access-block --bucket statementwise-documents-production
# Expected: BlockPublicAcls=true, IgnorePublicAcls=true, BlockPublicPolicy=true, RestrictPublicBuckets=true

echo "--- Bucket policy ---"
aws s3api get-bucket-policy --bucket statementwise-documents-production

echo "--- Bucket ACL ---"
aws s3api get-bucket-acl --bucket statementwise-documents-production
# Expected: No grants to AllUsers or AuthenticatedUsers
```

---

## 7. Environment Variables

### 7.1 Environment Variable Security Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 7.1.1 | [M] No secrets in code repository | P0 | [ ] | git-secrets scan | |
| 7.1.2 | [M] No secrets in container image layers | P0 | [ ] | Build scan | |
| 7.1.3 | [M] Secrets stored in AWS Secrets Manager | P0 | [ ] | Secret inventory | |
| 7.1.4 | [M] No secrets in environment variables (use Secrets Manager) | P0 | [ ] | ECS task definition | |
| 7.1.5 | [M] Database credentials rotated | P1 | [ ] | Rotation log | |
| 7.1.6 | [M] API keys rotated | P1 | [ ] | Rotation log | |
| 7.1.7 | [M] JWT signing key strong and rotated | P1 | [ ] | Key config | |
| 7.1.8 | [M] Debug mode disabled in production | P0 | [ ] | Config check | |
| 7.1.9 | [M] Log level set to WARNING or ERROR (not DEBUG) | P1 | [ ] | Config check | |
| 7.1.10 | [M] Error display disabled (no stack traces to users) | P0 | [ ] | Response check | |

### 7.2 Secret Management Reference

```python
# Secure Secret Retrieval (FastAPI)
import boto3
from botocore.exceptions import ClientError
import json

class SecretManager:
    def __init__(self):
        self.client = boto3.client('secretsmanager')
    
    def get_secret(self, secret_name: str) -> dict:
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            if 'SecretString' in response:
                return json.loads(response['SecretString'])
            else:
                # Binary secret
                return response['SecretBinary']
        except ClientError as e:
            raise RuntimeError(f"Failed to retrieve secret {secret_name}: {e}")

# Usage - NEVER hardcode secrets
secret_manager = SecretManager()
db_credentials = secret_manager.get_secret("statementwise/production/database")
moonshot_api_key = secret_manager.get_secret("statementwise/production/moonshot-api-key")
stripe_api_key = secret_manager.get_secret("statementwise/production/stripe")
```

### 7.3 Environment Variable Verification

```bash
#!/bin/bash
echo "=== Environment Variable Security Check ==="

# Check for secrets in code
echo "--- Git secrets scan ---"
git secrets --scan
if [ $? -ne 0 ]; then
    echo "FAIL: Secrets found in code"
    exit 1
fi
echo "PASS: No secrets in code"

# Check ECS task definition for secrets
echo ""
echo "--- ECS Task Definition Secret Configuration ---"
aws ecs describe-task-definition \
    --task-definition statementwise-api-production \
    --query 'taskDefinition.containerDefinitions[*].secrets'
# Expected: References to Secrets Manager ARNs, not plaintext

# Verify no plaintext secrets
echo ""
echo "--- Checking for plaintext secrets in task definition ---"
aws ecs describe-task-definition \
    --task-definition statementwise-api-production \
    --query 'taskDefinition.containerDefinitions[*].environment' \
    --output text | grep -iE "(password|secret|key|token|api_key)"
if [ $? -eq 0 ]; then
    echo "WARNING: Potential plaintext secrets found"
else
    echo "PASS: No plaintext secrets in environment"
fi

# Check for debug mode
echo ""
echo "--- Debug Mode Check ---"
# Verify via application config endpoint or environment check
# Expected: DEBUG=false
```

---

## 8. Database Security

### 8.1 Database Security Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 8.1.1 | [M] Database encryption at rest enabled (TDE) | P0 | [ ] | RDS config | |
| 8.1.2 | [M] Database encryption in transit enforced (TLS) | P0 | [ ] | Parameter group | |
| 8.1.3 | [M] Database not publicly accessible | P0 | [ ] | VPC config | |
| 8.1.4 | [M] Database in private subnet | P0 | [ ] | VPC config | |
| 8.1.5 | [M] Strong database passwords | P0 | [ ] | Password policy | |
| 8.1.6 | [M] Database access restricted to application security group | P0 | [ ] | Security group | |
| 8.1.7 | [M] Row-level security (RLS) policies active | P0 | [ ] | RLS config | |
| 8.1.8 | [M] Audit logging enabled | P1 | [ ] | RDS config | |
| 8.1.9 | [M] Automated backups enabled | P0 | [ ] | Backup config | |
| 8.1.10 | [M] Database parameter group hardened | P1 | [ ] | Parameter group | |

### 8.2 PostgreSQL Hardening Configuration

```sql
-- Database Security Verification Script
-- Run as admin user

-- 1. Verify encryption at rest
SHOW ssl;
-- Expected: on

-- 2. Verify TLS is required
SHOW ssl_min_protocol_version;
-- Expected: TLSv1.3

-- 3. Verify RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('statements', 'transactions', 'users', 'firms');
-- Expected: rowsecurity = true for all tables

-- 4. Verify RLS policies exist
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Verify no superuser access for application
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb 
FROM pg_roles 
WHERE rolname LIKE 'statementwise%';
-- Expected: rolsuper = false for application user

-- 6. Verify audit logging
SHOW log_connections;
SHOW log_disconnections;
SHOW log_statement;
-- Expected: log_connections = on, log_disconnections = on, log_statement = 'mod' or 'all'

-- 7. Check for unauthorized users
SELECT usename, usesuper, usecreatedb 
FROM pg_user 
WHERE usename NOT IN ('rdsadmin', 'postgres', 'statementwise_app');
-- Expected: Only authorized users

-- 8. Verify password encryption
SHOW password_encryption;
-- Expected: scram-sha-256
```

### 8.3 RDS Security Verification

```bash
#!/bin/bash
echo "=== RDS Security Verification ==="

DB_INSTANCE="statementwise-production"

echo "--- Storage Encryption ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].StorageEncrypted'
# Expected: true

echo "--- Public Accessibility ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].PubliclyAccessible'
# Expected: false

echo "--- VPC Security Groups ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].VpcSecurityGroups'

echo "--- Backup Retention ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].BackupRetentionPeriod'
# Expected: >= 7 days

echo "--- Auto Minor Version Upgrade ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].AutoMinorVersionUpgrade'
# Expected: true

echo "--- Multi-AZ ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].MultiAZ'
# Expected: true

echo "--- Deletion Protection ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].DeletionProtection'
# Expected: true

echo "--- IAM Authentication ---"
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE \
    --query 'DBInstances[0].IAMDatabaseAuthenticationEnabled'
# Expected: true (if using IAM auth)
```

---

## 9. Network Security

### 9.1 Network Security Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 9.1.1 | [M] VPC properly configured with public/private subnets | P0 | [ ] | VPC config | |
| 9.1.2 | [M] Security groups follow least privilege | P0 | [ ] | Security group rules | |
| 9.1.3 | [M] No unrestricted inbound access (0.0.0.0/0) except required ports | P0 | [ ] | Security group rules | |
| 9.1.4 | [M] WAF enabled and configured | P0 | [ ] | WAF config | |
| 9.1.5 | [M] DDoS protection enabled (AWS Shield) | P0 | [ ] | Shield config | |
| 9.1.6 | [M] Network ACLs configured | P1 | [ ] | NACL config | |
| 9.1.7 | [M] VPC Flow Logs enabled | P1 | [ ] | Flow log config | |
| 9.1.8 | [M] No direct database access from internet | P0 | [ ] | Security group | |
| 9.1.9 | [M] CloudFront origin access identity configured | P1 | [ ] | CloudFront config | |
| 9.1.10 | [M] Network segmentation verified (app/db/cache separation) | P0 | [ ] | VPC diagram | |

### 9.2 Network Architecture Reference

```
VPC: 10.0.0.0/16
|
+-- Public Subnets (10.0.1.0/24, 10.0.2.0/24) - ALB, NAT Gateway
|   |
|   +-- ALB (10.0.1.0/24) - Accepts 443 from CloudFront
|   +-- NAT Gateway (10.0.1.0/24) - Outbound only
|
+-- Application Subnets (10.0.10.0/24, 10.0.11.0/24) - ECS Tasks
|   |
|   +-- ECS Tasks (10.0.10.0/24) - Accepts from ALB only
|   +-- No direct internet access (via NAT only)
|
+-- Data Subnets (10.0.20.0/24, 10.0.21.0/24) - RDS, ElastiCache
    |
    +-- RDS (10.0.20.0/24) - Accepts from App subnet only
    +-- ElastiCache (10.0.20.0/24) - Accepts from App subnet only
    +-- No internet access
```

### 9.3 Security Group Rules Reference

```bash
#!/bin/bash
echo "=== Network Security Verification ==="

# ALB Security Group
echo "--- ALB Security Group ---"
aws ec2 describe-security-groups \
    --group-ids $ALB_SG_ID \
    --query 'SecurityGroups[0].IpPermissions[]'
# Expected Inbound:
#   - Port 443 from CloudFront prefix list only
# Expected Outbound:
#   - Port 8000 to ECS security group

# ECS Security Group
echo ""
echo "--- ECS Security Group ---"
aws ec2 describe-security-groups \
    --group-ids $ECS_SG_ID \
    --query 'SecurityGroups[0].IpPermissions[]'
# Expected Inbound:
#   - Port 8000 from ALB security group only
# Expected Outbound:
#   - Port 5432 to RDS security group
#   - Port 6379 to ElastiCache security group
#   - Port 443 to everywhere (for API calls)

# RDS Security Group
echo ""
echo "--- RDS Security Group ---"
aws ec2 describe-security-groups \
    --group-ids $RDS_SG_ID \
    --query 'SecurityGroups[0].IpPermissions[]'
# Expected Inbound:
#   - Port 5432 from ECS security group only
# Expected Outbound:
#   - None (RDS doesn't initiate connections)

# WAF Configuration
echo ""
echo "--- WAF WebACL Rules ---"
aws wafv2 list-web-acls --scope CLOUDFRONT --query 'WebACLs[*].Name'

# Check for 0.0.0.0/0 in security groups
echo ""
echo "--- Checking for unrestricted access ---"
aws ec2 describe-security-groups \
    --query 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]].{Name:GroupName,Id:GroupId}'
# Expected: Only ALB security group on 443, and only from CloudFront
```

### 9.4 WAF Rule Configuration

```hcl
# Terraform WAF Configuration
resource "aws_wafv2_web_acl" "main" {
  name        = "statementwise-production"
  description = "WAF rules for Statementwise.ai"
  scope       = "CLOUDFRONT"

  # AWS Managed Rules - Common Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action { none {} }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
        
        rule_action_override {
          action_to_use { count {} }
          name = "SizeRestrictions_BODY"
        }
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    
    override_action { none {} }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - SQL Injection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3
    
    override_action { none {} }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesSQLiRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # Rate Limiting Rule
  rule {
    name     = "RateLimitRule"
    priority = 4
    
    action { block {} }
    
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  # Geographic Blocking (Optional)
  rule {
    name     = "GeoBlockRule"
    priority = 5
    
    action { block {} }
    
    statement {
      geo_match_statement {
        country_codes = ["CN", "RU", "KP", "IR"]  # Block high-risk countries
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "GeoBlockRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "statementwise-waf"
    sampled_requests_enabled   = true
  }
}
```

---

## 10. Monitoring and Alerting

### 10.1 Monitoring Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 10.1.1 | [M] SIEM/log aggregation configured | P0 | [ ] | CloudWatch/ELK config | |
| 10.1.2 | [M] Alerting rules configured for security events | P0 | [ ] | Alert configuration | |
| 10.1.3 | [M] Intrusion detection enabled (GuardDuty) | P0 | [ ] | GuardDuty config | |
| 10.1.4 | [M] Failed login alerting configured | P0 | [ ] | Alert rule | |
| 10.1.5 | [M] Unusual data access alerting configured | P0 | [ ] | Alert rule | |
| 10.1.6 | [M] Application error rate monitoring | P1 | [ ] | Sentry/Datadog | |
| 10.1.7 | [M] Infrastructure monitoring (CPU, memory, disk) | P1 | [ ] | CloudWatch | |
| 10.1.8 | [M] Log tampering protection (immutable storage) | P0 | [ ] | S3 Object Lock | |

### 10.2 Required Security Alerts

| Alert Name | Condition | Severity | Channel |
|-----------|-----------|----------|---------|
| Brute Force Login | > 5 failed logins per 15 min per IP | HIGH | PagerDuty |
| Distributed Brute Force | > 20 failed logins per 5 min globally | CRITICAL | PagerDuty |
| Admin Login Off Hours | Admin login outside 08:00-18:00 UTC | MEDIUM | Slack |
| Impossible Travel | Login from two locations > 500km apart within 1 hour | HIGH | PagerDuty |
| WAF Block Spike | > 1000 blocks per 5 minutes | MEDIUM | Slack |
| GuardDuty Finding | Medium or High severity | HIGH | PagerDuty |
| Unauthorized S3 Access | Access from unexpected IP or role | CRITICAL | PagerDuty |
| Database Anomaly | Unusual query patterns or volume | HIGH | PagerDuty |
| Privilege Escalation Attempt | Non-admin attempting admin action | HIGH | PagerDuty |
| Data Exfiltration Pattern | Large volume of data downloads | CRITICAL | PagerDuty |
| SSL Certificate Expiry | < 30 days until expiry | MEDIUM | Email |
| Security Group Change | Any security group modification | MEDIUM | Slack |
| IAM Policy Change | Any IAM policy modification | MEDIUM | Slack |

### 10.3 Monitoring Verification

```bash
#!/bin/bash
echo "=== Monitoring Configuration Verification ==="

# GuardDuty
echo "--- GuardDuty Status ---"
aws guardduty list-detectors --query 'DetectorIds[0]'
# Expected: Active detector ID

# CloudWatch Alarms
echo ""
echo "--- CloudWatch Security Alarms ---"
aws cloudwatch describe-alarms --alarm-name-prefix "security-" \
    --query 'MetricAlarms[*].{Name:AlarmName,State:StateValue}'

# Verify log groups exist
echo ""
echo "--- CloudWatch Log Groups ---"
aws logs describe-log-groups --log-group-name-prefix "/statementwise" \
    --query 'logGroups[*].logGroupName'
# Expected: /statementwise/api, /statementwise/auth, /statementwise/audit

# Verify CloudTrail
echo ""
echo "--- CloudTrail Status ---"
aws cloudtrail describe-trails --query 'trailList[*].{Name:Name,IsLogging:IsLogging}'

# Verify S3 Object Lock on audit bucket
echo ""
echo "--- S3 Object Lock on Audit Bucket ---"
aws s3api get-object-lock-configuration --bucket statementwise-audit-logs-production
# Expected: ObjectLockEnabled=Enabled, Retention Mode=COMPLIANCE
```

---

## 11. Backup Verification

### 11.1 Backup Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 11.1.1 | [M] Automated database backups enabled | P0 | [ ] | RDS config | |
| 11.1.2 | [M] Backup retention period adequate (>= 7 days) | P0 | [ ] | RDS config | |
| 11.1.3 | [M] Cross-region backup replication enabled | P0 | [ ] | S3/RDS config | |
| 11.1.4 | [M] Point-in-time recovery enabled | P0 | [ ] | RDS config | |
| 11.1.5 | [M] Backup integrity verified (test restore) | P1 | [ ] | Restore test result | |

### 11.2 Backup Verification Commands

```bash
#!/bin/bash
echo "=== Backup Verification ==="

# RDS Automated Backups
echo "--- RDS Backup Configuration ---"
aws rds describe-db-instances \
    --db-instance-identifier statementwise-production \
    --query 'DBInstances[0].{BackupRetentionPeriod:BackupRetentionPeriod, MultiAZ:MultiAZ, DeletionProtection:DeletionProtection}'
# Expected: BackupRetentionPeriod >= 7, MultiAZ=true, DeletionProtection=true

# Latest Automated Snapshot
echo ""
echo "--- Latest Automated Snapshot ---"
aws rds describe-db-snapshots \
    --snapshot-type automated \
    --db-instance-identifier statementwise-production \
    --query 'DBSnapshots | sort_by(@, &SnapshotCreateTime) | [-1].{ID:DBSnapshotIdentifier, Time:SnapshotCreateTime, Status:Status}'

# S3 Cross-Region Replication
echo ""
echo "--- S3 Cross-Region Replication ---"
aws s3api get-bucket-replication --bucket statementwise-documents-production

# Backup Restoration Test (Monthly)
echo ""
echo "=== Monthly Backup Restoration Test ==="
RESTORE_INSTANCE="statementwise-backup-test-$(date +%Y%m%d)"

aws rds restore-db-instance-to-point-in-time \
    --source-db-instance-identifier statementwise-production \
    --target-db-instance-identifier $RESTORE_INSTANCE \
    --restore-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
    --no-publicly-accessible

echo "Restore initiated: $RESTORE_INSTANCE"
echo "Verify data integrity after restore completes, then delete test instance."
```

---

## 12. Incident Response Readiness

### 12.1 IR Readiness Checklist

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 12.1.1 | [M] Incident response plan accessible to on-call team | P0 | [ ] | Doc access | |
| 12.1.2 | [M] Emergency contacts current | P0 | [ ] | Contact list | |
| 12.1.3 | [M] PagerDuty/on-call rotation active | P0 | [ ] | PagerDuty config | |
| 12.1.4 | [M] Forensics tools accessible | P1 | [ ] | Tool inventory | |
| 12.1.5 | [M] Communication channels tested | P1 | [ ] | Channel test | |

### 12.2 IR Readiness Verification

```bash
#!/bin/bash
echo "=== Incident Response Readiness Verification ==="

# PagerDuty on-call
echo "--- Current On-Call ---"
# curl -H "Authorization: Bearer $PAGERDUTY_API_KEY" \
#      "https://api.pagerduty.com/oncalls"

# Verify IR documentation access
echo ""
echo "--- IR Plan Accessibility ---"
curl -s -o /dev/null -w "%{http_code}" \
    https://wiki.statementwise.ai/security/incident-response
# Expected: 200

# Verify emergency contact list
echo ""
echo "--- Emergency Contact List ---"
# Verify the file exists and is current
ls -la /security/emergency-contacts.md
# Expected: Modified within last 30 days
```

---

## 13. Communication Plan

### 13.1 Communication Checklist (Major/Infrastructure Deployments)

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 13.1.1 | [M] Maintenance window scheduled and communicated | P0 | [ ] | Calendar invite | |
| 13.1.2 | [M] Status page updated before deployment | P0 | [ ] | Statuspage.io | |
| 13.1.3 | [M] Rollback plan communicated to team | P1 | [ ] | Deployment plan | |
| 13.1.4 | [M] Post-deployment communication prepared | P1 | [ ] | Communication draft | |

### 13.2 Communication Templates

```
Subject: [Scheduled Maintenance] Statementwise.ai - [Date] [Time] UTC

We will be performing scheduled maintenance on Statementwise.ai on:

Date: [Date]
Time: [Start Time] - [End Time] UTC
Duration: Expected [N] hours
Impact: [Brief description of potential impact]

During this window:
- [Expected behavior]
- [Any service limitations]

No action is required on your part.

We will post updates at: https://status.statementwise.ai

Thank you for your patience.

Statementwise.ai Team
```

---

## 14. Deployment Sign-Off

### 14.1 Approvals

| Role | Name | Signature | Date | Notes |
|------|------|-----------|------|-------|
| DevOps Lead | | _____________ | | Infrastructure readiness |
| Security Lead | | _____________ | | Security verification complete |
| Engineering Lead | | _____________ | | Code quality and testing |
| Product Owner | | _____________ | | Feature readiness (if applicable) |
| CISO (Major/Infra) | | _____________ | | Risk acceptance |

### 14.2 Risk Acceptance

If any checks are marked as failed with risk acceptance:

| Check ID | Risk | Mitigation | Accepted By | Date | Expiry |
|----------|------|-----------|-------------|------|--------|
| | | | | | |

### 14.3 Deployment Record

| Field | Value |
|-------|-------|
| Deployment ID | DEP-2025-XXX |
| Date | YYYY-MM-DD |
| Time (UTC) | HH:MM |
| Type | Standard / Major / Emergency / Infrastructure |
| Version | vX.Y.Z |
| Git Commit | SHA |
| Deployed By | Name |
| Duration | N minutes |
| Status | Success / Rollback |
| Notes | |

---

## 15. Post-Deployment Verification

### 15.1 Immediate Verification (Within 1 Hour)

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 15.1.1 | [M] Application health checks passing | P0 | [ ] | /health endpoint | |
| 15.1.2 | [M] All API endpoints responding | P0 | [ ] | API test | |
| 15.1.3 | [M] Authentication working | P0 | [ ] | Login test | |
| 15.1.4 | [M] Database connectivity confirmed | P0 | [ ] | Query test | |
| 15.1.5 | [M] SSL/TLS still valid | P0 | [ ] | SSL check | |
| 15.1.6 | [M] Security headers present | P0 | [ ] | Header check | |
| 15.1.7 | [M] Error rate normal | P0 | [ ] | Sentry/Datadog | |
| 15.1.8 | [M] No security alerts triggered | P0 | [ ] | Alert dashboard | |

### 15.2 24-Hour Verification

| # | Check | Priority | Status | Evidence |
|---|-------|----------|--------|----------|
| 15.2.1 | [M] Error rate stable | P1 | [ ] | Monitoring | |
| 15.2.2 | [M] Performance metrics normal | P1 | [ ] | Monitoring | |
| 15.2.3 | [M] No unexpected security events | P1 | [ ] | SIEM | |
| 15.2.4 | [M] User feedback positive | P2 | [ ] | Support tickets | |
| 15.2.5 | [M] Backup completed successfully | P1 | [ ] | Backup log | |

### 15.3 Post-Deployment Test Script

```bash
#!/bin/bash
echo "=== Post-Deployment Verification ==="

BASE_URL="https://app.statementwise.ai"
API_URL="https://api.statementwise.ai"

# Health check
echo "[1/8] Health Check"
curl -sf "${API_URL}/health" > /dev/null && echo "PASS" || echo "FAIL"

# SSL check
echo "[2/8] SSL/TLS Check"
echo | openssl s_client -connect app.statementwise.ai:443 -tls1_3 2>/dev/null | grep "Protocol" && echo "PASS" || echo "FAIL"

# Security headers
echo "[3/8] Security Headers"
curl -sfI "${BASE_URL}" | grep -q "X-Frame-Options: DENY" && echo "PASS" || echo "FAIL"

# Authentication
echo "[4/8] Authentication"
# Test login endpoint responds correctly
curl -sf -X POST "${API_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    | grep -q "error" && echo "PASS" || echo "FAIL"

# Database connectivity (via API)
echo "[5/8] API Response"
curl -sf "${API_URL}/api/v1/health/database" > /dev/null && echo "PASS" || echo "FAIL"

# CSP Header
echo "[6/8] CSP Header"
curl -sfI "${BASE_URL}" | grep -q "Content-Security-Policy" && echo "PASS" || echo "FAIL"

# HSTS
echo "[7/8] HSTS Header"
curl -sfI "${BASE_URL}" | grep -q "Strict-Transport-Security" && echo "PASS" || echo "FAIL"

# Error rate (check Sentry/Datadog)
echo "[8/8] Error Rate"
# Query Datadog/Sentry API for error rate in last hour
# Expected: < 1%
echo "MANUAL CHECK REQUIRED"

echo ""
echo "=== Post-Deployment Verification Complete ==="
```

---

**END OF CHECKLIST**
