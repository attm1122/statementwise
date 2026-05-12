# Statementwise.ai - Security Architecture

**Document Version:** 1.0  
**Date:** 2025-01-15  
**Classification:** CONFIDENTIAL - INTERNAL USE ONLY  
**Owner:** Chief Information Security Officer (CISO)  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Context Diagram](#2-system-context-diagram)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [Trust Boundaries](#4-trust-boundaries)
5. [Encryption Points](#5-encryption-points)
6. [Authentication Flows](#6-authentication-flows)
7. [Network Segmentation](#7-network-segmentation)
8. [Security Controls Mapping](#8-security-controls-mapping)
9. [Appendices](#9-appendices)

---

## 1. Architecture Overview

Statementwise.ai is a cloud-native SaaS platform built on AWS that processes sensitive financial documents (bank statements) using AI-powered extraction. The architecture follows defense-in-depth principles with multiple layers of security controls.

### 1.1 Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| **Defense in Depth** | Multiple security layers: network, application, data, identity |
| **Least Privilege** | RBAC at every layer, minimal permissions |
| **Zero Trust** | Verify every request, assume breach |
| **Encryption Everywhere** | TLS 1.3 in transit, AES-256 at rest |
| **Audit Everything** | Immutable audit logs for all actions |
| **Data Minimization** | Process only necessary data, minimize third-party sharing |
| **Resilience** | Multi-AZ, auto-scaling, disaster recovery |

### 1.2 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL 15 (RDS), Redis 7 (ElastiCache) |
| AI/ML | Moonshot AI API |
| Infrastructure | AWS (ECS Fargate, S3, CloudFront, ALB) |
| CI/CD | GitHub Actions, Terraform |
| Monitoring | CloudWatch, Datadog, Sentry |

---

## 2. System Context Diagram

### 2.1 High-Level Context

```
                        +-----------------------------+
                        |      EXTERNAL ENTITIES       |
                        |                              |
  +------------------+  |  +----------------------+   |  +------------------+
  |                  |  |  |                      |   |  |                  |
  |  End Users       |  |  |  Accounting Firms    |   |  |  Moonshot AI     |
  |  (Individuals)   |  |  |  (Multi-tenant)      |   |  |  (LLM Provider)  |
  |                  |  |  |                      |   |  |  China           |
  +--------+---------+  |  +----------+-----------+   |  +--------+---------+
           |            |             |               |           |
           | HTTPS      |             | HTTPS         |           | HTTPS
           | TLS 1.3    |             | TLS 1.3       |           | TLS 1.3
           | JWT Auth   |             | JWT + Firm    |           | API Key
           v            |             | Auth          |           v
+----------+-----------+|             |               |+----------+----------+
|                      ||             v               ||                      |
|   STATEMENTWISE.AI   ||  +--------+--------+       ||  +------------------+|
|   +---------------+  ||  |                 |       ||  |                  ||
|   |  React SPA    |  ||  |  Firm Portal    |       ||  |  LLM Processing  ||
|   |  (CloudFront) |  ||  |  (CloudFront)   |       ||  |  (API Endpoint)  ||
|   +---------------+  ||  +--------+--------+       ||  +------------------+|
|           |          |             |                |                      |
+-----------+----------+|             |                |+--------------------+
            |           |             |                |
            |           |   +---------v---------+      |
            |           |   |                   |      |
            +-----------+-->|  FastAPI Backend  |<-----+
                            |  (ECS/Fargate)    |
                            |                   |
                            +---------+---------+
                                      |
                            +---------+---------+
                            |                   |
               +------------v---+   +-----------v------+
               |  PostgreSQL    |   |  S3 (Documents)  |
               |  (RDS)         |   |  (Encrypted)     |
               +----------------+   +------------------+


                        +-----------------------------+
                        |    THIRD-PARTY SERVICES      |
                        |                              |
  +------------------+  |  +----------------------+   |  +------------------+
  |                  |  |  |                      |   |  |                  |
  |  Stripe          |  |  |  SendGrid            |   |  |  Analytics       |
  |  (Payments)      |  |  |  (Email)             |   |  |  (Mixpanel)      |
  |  TLS 1.3 +       |  |  |  TLS 1.3 +           |   |  |  TLS 1.3 +       |
  |  Webhook Sign    |  |  |  API Key             |   |  |  API Key         |
  +--------+---------+  |  +----------+-----------+   |  +--------+---------+
           |            |             |               |           |
           v            |             v               |           v
```

### 2.2 Component Legend

```
LEGEND
======
+---------+   External Entity (outside our control)
|  Box    |   Internal System Component
+---------+
    |       Data Flow (arrow indicates direction)
   [ ]      Security Control / Checkpoint
  (cloud)   Cloud Service
   <DB>     Database/Storage
   {key}    Encryption/Authentication
```

---

## 3. Data Flow Diagrams

### 3.1 Level 0 - Context DFD

```
+-------------+                                    +------------------+
|             |                                    |                  |
|   User      |----(1) Register/Login------------->|                  |
|   (Browser) |<---(2) JWT Token-------------------|                  |
|             |                                    |                  |
|             |----(3) Upload PDF----------------->|  Statementwise   |
|             |<---(4) Upload Confirmation---------|  .ai Platform    |
|             |                                    |                  |
|             |----(5) View/Export Data----------->|                  |
|             |<---(6) CSV/Excel/JSON-------------|                  |
|             |                                    |                  |
+-------------+                                    +--------+---------+
                                                            |
                              +-----------------------------+-----------------------------+
                              |                             |                             |
                    +---------v---------+        +----------v----------+     +------------v-----------+
                    |                   |        |                     |     |                        |
                    |  Moonshot AI      |        |  SendGrid           |     |  Stripe                |
                    |  (LLM Processing) |        |  (Email Delivery)   |     |  (Payment Processing)  |
                    |                   |        |                     |     |                        |
                    +-------------------+        +---------------------+     +------------------------+
```

**Data Flows:**

| ID | Source | Destination | Data | Protocol | Security |
|----|--------|-------------|------|----------|----------|
| 1 | User | Platform | Email, password, firm details | HTTPS | TLS 1.3, bcrypt hash |
| 2 | Platform | User | JWT access + refresh tokens | HTTPS | TLS 1.3, HttpOnly cookies |
| 3 | User | Platform | PDF bank statement (binary) | HTTPS | TLS 1.3, signed URL |
| 4 | Platform | User | Upload status, processing ID | HTTPS | TLS 1.3 |
| 5 | User | Platform | Statement ID, export format | HTTPS | TLS 1.3, JWT auth |
| 6 | Platform | User | Extracted data (CSV/XLSX/JSON) | HTTPS | TLS 1.3 |

### 3.2 Level 1 - Detailed Data Flow

```
                                    +------------------+
                                    |     USERS        |
                                    |  (Trust Zone 1)  |
                                    +--------+---------+
                                             |
                                             | HTTPS/TLS 1.3
                                             | JWT Bearer Token
                                             v
+--------------+    +--------------+    +-----------------+    +--------------+
|              |    |              |    |                 |    |              |
|  CloudFront  |--->|     WAF      |--->|   ALB (HTTPS)   |--->|  ECS Tasks   |
|  (CDN/Edge)  |    |  (Filtering) |    | (Load Balancer) |    | (FastAPI)    |
|              |    |              |    |                 |    |              |
+--------------+    +--------------+    +--------+--------+    +------+-------+
                                               |                        |
                                               |                        |
                                     +---------v---------+    +---------v---------+
                                     |                   |    |                   |
                                     |   S3 (Static)     |    |  PostgreSQL       |
                                     |   (React Build)   |    |  (User Data)      |
                                     |                   |    |                   |
                                     +-------------------+    +---------+---------+
                                                                       |
                                                               +-------v--------+
                                                               |  Redis Cache   |
                                                               |  (Sessions)    |
                                                               +----------------+
                                                                       |
                                                               +-------v--------+
                                                               |  S3 (PDFs)     |
                                                               |  (Documents)   |
                                                               +----------------+
                                                                       |
                                                               +-------v--------+
                                                               | Moonshot AI    |
                                                               | (LLM Extract)  |
                                                               +----------------+
```

### 3.3 Bank Statement Processing Flow

```
[USER] Uploads PDF Bank Statement
    |
    v
+----------------------+    +----------------------+
| 1. CLIENT VALIDATION |    | File type: PDF only  |
|    (Browser)         |    | File size: <= 25MB   |
|                      |    | Pages: <= 100        |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 2. API GATEWAY       |    | WAF inspection       |
|    (ALB + WAF)       |    | Rate limit check     |
|                      |    | Auth token validate  |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 3. UPLOAD HANDLER    |    | File hash (SHA-256)  |
|    (FastAPI)         |    | Virus scan           |
|                      |    | Metadata extraction  |
+----------------------+    +----------------------+
    |
    +--------------------------------------+
    |                                      |
    v                                      v
+----------------------+    +----------------------+
| 4a. S3 STORAGE       |    | AES-256 encryption   |
|    (Raw PDF)         |    | Object lock (WORM)   |
|                      |    | Bucket policy enforce|
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 5. PROCESSING QUEUE  |    | SQS queue            |
|    (Async)           |    | Dead letter queue    |
|                      |    | Retry logic (3x)     |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 6. EXTRACTOR SERVICE |    | PDF text extraction  |
|    (Background)      |    | Data sanitization    |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 7. MOONSHOT AI API   |    | TLS 1.3              |
|    (Data Minimized)  |    | API key auth         |
|                      |    | Stateless request    |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 8. RESPONSE HANDLER  |    | Schema validation    |
|                      |    | Content filtering    |
|                      |    | PII detection        |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 9. DATA STORAGE      |    | Row-level security   |
|    (PostgreSQL)      |    | Integrity hash       |
|                      |    | Audit log entry      |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 10. USER NOTIFICATION|    | WebSocket push       |
|    (Complete)        |    | Email notification   |
+----------------------+    +----------------------+
    |
    v
+----------------------+    +----------------------+
| 11. DATA RETENTION   |    | Raw PDF: 30 days     |
|    (Automated)       |    | Extracted: 7 years   |
|                      |    | Audit: 7 years       |
+----------------------+    +----------------------+
```

### 3.4 Data Flow with Security Controls

```
User (Browser)
    |
    | [TLS 1.3 + HSTS]
    v
+----------------------------------------+
| CloudFront (Edge)                      |
| + Signed URLs                          |
| + Origin Access Identity               |
+----------------------------------------+
    |
    | [Filtered Traffic]
    v
+----------------------------------------+
| WAF (AWS Managed Rules)                |
| + SQL Injection protection             |
| + XSS protection                       |
| + Rate limiting (2000 req/5min/IP)     |
| + Geo-blocking (optional)              |
| + Bot detection                        |
+----------------------------------------+
    |
    | [Allowed Traffic]
    v
+----------------------------------------+
| ALB (Application Load Balancer)        |
| + TLS 1.3 termination                  |
| + Health checks                        |
| + Connection logging                   |
+----------------------------------------+
    |
    | [Internal VPC Traffic]
    v
+----------------------------------------+
| ECS Fargate (Container)                |
| + Security Group (port 8000 only)      |
| + Non-root container user              |
| + Read-only root filesystem            |
| + No privilege escalation              |
+----------------------------------------+
    |
    +--[IAM Role]--> AWS Secrets Manager  (Credential retrieval)
    |
    +--[IAM Role]--> S3 (Document storage with SSE-KMS)
    |
    +--[Security Group]--> PostgreSQL RDS (Port 5432, app subnet only)
    |
    +--[Security Group]--> Redis ElastiCache (Port 6379, app subnet only)
    |
    +--[NAT Gateway]--> Moonshot AI API (HTTPS, API key, data minimized)
    |
    +--[NAT Gateway]--> SendGrid API (HTTPS, API key, no sensitive data)
    |
    +--[NAT Gateway]--> Stripe API (HTTPS, webhook signature verification)
```

---

## 4. Trust Boundaries

### 4.1 Trust Zone Architecture

```
+===========================================================================+
|                           TRUST ZONE 0: INTERNET                          |
|  (Untrusted - All traffic assumed hostile)                                |
|                                                                           |
|   Users --------+  Attackers --------+  Third-Party APIs ------+          |
|   (Browsers)    |  (Threat Actors)   |  (Moonshot, Stripe)    |          |
+=================+====================+==========================+=========+
                  |                    |                         |
                  v                    v                         v
+===========================================================================+
|                         TRUST ZONE 1: PERIMETER                           |
|  (Semi-Trusted - AWS Edge + Filtering)                                    |
|                                                                           |
|   +------------------+  +------------------+  +------------------+        |
|   | CloudFront CDN   |  | AWS WAF          |  | Route 53 DNS     |        |
|   | + Signed URLs    |  | + Rate Limiting  |  | + DNSSEC         |        |
|   | + Geo-restriction|  | + Bot Detection  |  | + Health Checks  |        |
|   +------------------+  +------------------+  +------------------+        |
+===========================================================================+
                  |
                  v
+===========================================================================+
|                        TRUST ZONE 2: APPLICATION                          |
|  (Trusted - Container Runtime)                                            |
|                                                                           |
|   +------------------+  +------------------+  +------------------+        |
|   | ALB              |  | ECS/Fargate      |  | Background       |        |
|   | + TLS Termination|  | + FastAPI App    |  |   Workers        |        |
|   | + Access Logs    |  | + React SPA      |  | + Celery/Async   |        |
|   +------------------+  +------------------+  +------------------+        |
|                                                                           |
|   Security Controls:                                                      |
|   - Container isolation (gVisor/Firecracker)                              |
|   - Security groups (port/protocol restrictions)                          |
|   - IAM roles (service-specific permissions)                              |
|   - Runtime monitoring                                                    |
+===========================================================================+
                  |
                  v
+===========================================================================+
|                          TRUST ZONE 3: DATA                               |
|  (Highly Trusted - No Direct Internet Access)                             |
|                                                                           |
|   +------------------+  +------------------+  +------------------+        |
|   | PostgreSQL       |  | S3 (Documents)   |  | Redis            |        |
|   | + TDE (AES-256)  |  | + SSE-KMS        |  | + Auth Required  |        |
|   | + Row-Level Sec  |  | + Object Lock    |  | + Encrypted      |        |
|   | + Private Subnet |  | + Versioning     |  | + Private Subnet |        |
|   +------------------+  +------------------+  +------------------+        |
|                                                                           |
|   +------------------+  +------------------+                              |
|   | CloudWatch Logs  |  | S3 (Audit Logs)  |                              |
|   | + Encrypted      |  | + Object Lock    |                              |
|   | + Retention      |  | + Cross-Region   |                              |
|   +------------------+  +------------------+                              |
+===========================================================================+
                  |
                  v
+===========================================================================+
|                       TRUST ZONE 4: MANAGEMENT                            |
|  (Highly Trusted - Administrative Access Only)                            |
|                                                                           |
|   +------------------+  +------------------+  +------------------+        |
|   | Admin VPN/Bastion|  | GitHub (Source)  |  | Terraform Cloud  |        |
|   | + MFA Required   |  | + Branch Protect |  | + State Encryption|       |
|   | + Session Logging|  | + Code Review    |  | + Locking        |        |
|   +------------------+  +------------------+  +------------------+        |
|                                                                           |
|   +------------------+  +------------------+                              |
|   | AWS Secrets Mgr  |  | AWS KMS          |                              |
|   | + Auto Rotation  |  | + Key Policies   |                              |
|   | + Access Audit   |  | + HSM Backing    |                              |
|   +------------------+  +------------------+                              |
+===========================================================================+
```

### 4.2 Trust Boundary Crossings

Every time data crosses a trust boundary, specific security controls must be applied:

| From Zone | To Zone | Boundary ID | Controls |
|-----------|---------|-------------|----------|
| Internet (0) | Perimeter (1) | TB-01 | TLS 1.3, WAF, DDoS protection |
| Perimeter (1) | Application (2) | TB-02 | ALB authentication, security groups |
| Application (2) | Data (3) | TB-03 | IAM roles, encryption, network ACLs |
| Application (2) | Third-Party | TB-04 | API keys, request signing, data minimization |
| Internet (0) | Management (4) | TB-05 | VPN, MFA, IP allowlisting |
| Management (4) | Application (2) | TB-06 | CI/CD pipeline, signed artifacts |
| Management (4) | Data (3) | TB-07 | IAM policies, audit logging |

### 4.3 Trust Boundary Verification Checklist

| Boundary | Control | Verification Method | Frequency |
|----------|---------|---------------------|-----------|
| TB-01 | TLS 1.3 enforced | SSL Labs scan | Weekly |
| TB-01 | WAF rules active | WAF metric dashboard | Continuous |
| TB-02 | Security groups correct | AWS Config rule | Continuous |
| TB-03 | IAM roles least privilege | IAM Access Analyzer | Weekly |
| TB-03 | Encryption at rest | KMS key audit | Monthly |
| TB-04 | API key rotation | Secrets Manager rotation log | Monthly |
| TB-04 | Data minimization | Traffic inspection | Monthly |
| TB-05 | VPN access logging | CloudTrail | Continuous |
| TB-06 | Artifact signing | CI/CD verification | Every build |
| TB-07 | Admin action audit | CloudTrail + SIEM | Continuous |

---

## 5. Encryption Points

### 5.1 Encryption Architecture

```
+---------------------------------------------------------------------------+
|                        ENCRYPTION ARCHITECTURE                            |
+---------------------------------------------------------------------------+

EXTERNAL COMMUNICATIONS (In Transit)
=====================================

User Browser                                         Statementwise Platform
    |                                                          |
    |<================== TLS 1.3 =============================>|
    |  Cipher: ECDHE-RSA-AES256-GCM-SHA384                     |
    |  Certificate: RSA 2048-bit (Let's Encrypt/ACM)           |
    |  PFS: Enabled (ECDHE key exchange)                       |
    |  HSTS: max-age=31536000                                  |
    |                                                          |

Statementwise Platform                               Moonshot AI API
    |                                                          |
    |<================== TLS 1.3 =============================>|
    |  Additional: API Key Authentication                      |
    |  Data: Minimized before transmission                     |
    |                                                          |

Statementwise Platform                               Stripe API
    |                                                          |
    |<================== TLS 1.3 =============================>|
    |  Additional: Webhook Signature Verification              |
    |  Data: Tokenized (no raw card data)                      |
    |                                                          |

INTERNAL COMMUNICATIONS (In Transit)
=====================================

ALB                                              ECS Container
  |                                                    |
  |<================== HTTPS ==========================>|
  |  Internal VPC network (isolated)                   |
  |  Security group restricted                         |
  |                                                    |

ECS Container                                    PostgreSQL
  |                                                    |
  |<================== TLS 1.3 =======================>|
  |  RDS force_ssl parameter: enabled                  |
  |  Security group: port 5432, app subnet only        |
  |                                                    |

ECS Container                                    Redis
  |                                                    |
  |<================== TLS + AUTH =====================>|
  |  Redis AUTH password required                      |
  |  Transit encryption enabled                        |
  |  Security group: port 6379, app subnet only        |

DATA AT REST
============

+-------------------+    +-------------------+    +-------------------+
|   PostgreSQL      |    |   S3 Documents    |    |   S3 Audit Logs   |
|   (RDS)           |    |   (PDFs)          |    |   (Immutable)     |
|                   |    |                   |    |                   |
| + TDE (AES-256)   |    | + SSE-KMS         |    | + SSE-S3          |
| + KMS CMK         |    | + Customer        |    | + Object Lock     |
| + Snapshots       |    |   Managed Key     |    |   (Compliance     |
|   Encrypted       |    | + Bucket Policy   |    |    Mode)          |
| + Automated       |    | + Object Lock     |    | + Cross-Region    |
|   Backups         |    | + Versioning      |    |   Replication     |
+-------------------+    +-------------------+    +-------------------+

APPLICATION-LEVEL ENCRYPTION
=============================

+-------------------+    +-------------------+    +-------------------+
|   JWT Tokens      |    |   Passwords       |    |   API Keys        |
|                   |    |                   |    |                   |
| + RS256 Signing   |    | + bcrypt (cost 12)|    | + AWS Secrets     |
| + 2048-bit RSA    |    | + Salt per user   |    |   Manager         |
| + Key rotation    |    | + Pepper (secret) |    | + Auto rotation   |
|   (monthly)       |    |                   |    | + Audit logging   |
+-------------------+    +-------------------+    +-------------------+
```

### 5.2 Encryption Key Management

```
+---------------------------------------------------------------------------+
|                         AWS KMS KEY HIERARCHY                             |
+---------------------------------------------------------------------------+

KMS Key: statementwise-master-key
  |
  +-- Alias: alias/statementwise/master
  |
  +-- Used For:
  |     +-- RDS Storage Encryption (TDE)
  |     +-- S3 SSE-KMS (Documents bucket)
  |     +-- Secrets Manager Encryption
  |     +-- EBS Volume Encryption
  |
  +-- Key Policy:
  |     +-- Key Administrator: Platform Team IAM Role
  |     +-- Key Users: Application IAM Role, ECS Task Role
  |     +-- No root account access
  |
  +-- Rotation:
        +-- Automatic: Annually (AWS managed)
        +-- Manual rotation: On suspected compromise
        +-- Rotation audit: Logged to CloudTrail

JWT Signing Keys:
  |
  +-- Primary Key: RS256, 2048-bit RSA
  +-- Rotation: Monthly
  +-- Storage: AWS Secrets Manager
  +-- Distribution: Runtime fetch (never in code)
  +-- Key ID in JWT header for smooth rotation
```

---

## 6. Authentication Flows

### 6.1 User Authentication Flow

```
+--------+                                          +---------------+
|        |                                          |               |
|  User  |                                          |  Statementwise|
|        |                                          |  Platform     |
+---+----+                                          +----+----------+
    |                                                    |
    | 1. POST /api/v1/auth/register                     |
    |    { email, password, firm_code? }                |
    +--------------------------------------------------->|
    |                                                    |
    |    2. Validate input (Pydantic)                    |
    |       Check password strength (zxcvbn)             |
    |       Check email uniqueness                       |
    |       Check breach database (HaveIBeenPwned)       |
    |       Hash password (bcrypt + pepper)              |
    |       Create user record                           |
    |<---------------------------------------------------+
    |    { user_id, requires_verification: true }        |
    |                                                    |
    | 3. Verify email (click link)                       |
    +--------------------------------------------------->|
    |    4. Mark email verified                          |
    |<---------------------------------------------------+
    |    { success: true }                               |
    |                                                    |
    | 5. POST /api/v1/auth/login                        |
    |    { email, password }                             |
    +--------------------------------------------------->|
    |    6. Verify credentials                           |
    |       Check account status                         |
    |       Check rate limiting (5 attempts/15min)       |
    |       Verify bcrypt hash                           |
    |       Generate tokens                              |
    |<---------------------------------------------------+
    |    Set-Cookie: access_token=xxx; HttpOnly;         |
    |                  Secure; SameSite=Strict;          |
    |                  Max-Age=900                       |
    |    Set-Cookie: refresh_token=xxx; HttpOnly;        |
    |                  Secure; SameSite=Strict;          |
    |                  Max-Age=604800                    |
    |    Body: { user: { ... }, token_type: "bearer" }   |
    |                                                    |
    | 7. Request /api/v1/statements                      |
    |    Cookie: access_token=xxx                        |
    +--------------------------------------------------->|
    |    8. Verify JWT signature                         |
    |       Check expiry                                 |
    |       Validate claims (iss, aud)                   |
    |       Check token blacklist (Redis)                |
    |       Load user context                            |
    |       Verify resource ownership (RLS)              |
    |<---------------------------------------------------+
    |    { statements: [...] }                           |
    |                                                    |
    | 9. Token expires (after 15 min)                    |
    |    POST /api/v1/auth/refresh                      |
    |    Cookie: refresh_token=xxx                       |
    +--------------------------------------------------->|
    |    10. Verify refresh token                        |
    |        Check rotation (prevent replay)              |
    |        Issue new access + refresh token pair        |
    |<---------------------------------------------------+
    |    New cookies set (same attributes)                |
```

### 6.2 Firm Authentication Flow

```
+--------------+                                      +----------------+
|              |                                      |                |
| Firm Admin   |                                      | Statementwise  |
|              |                                      | Platform       |
+------+-------+                                      +--------+-------+
       |                                                       |
       | 1. Register firm                                      |
       |    POST /api/v1/firms/register                       |
       |    { firm_name, admin_email, ... }                   |
       +------------------------------------------------------>|
       |                                                       |
       |    2. Create firm tenant                              |
       |       Generate firm_id (UUID)                         |
       |       Create firm schema partition (RLS)              |
       |       Create admin user (linked to firm)              |
       |<------------------------------------------------------+
       |    { firm_id, admin_invitation }                      |
       |                                                       |
       | 3. Admin accepts invitation, sets password            |
       +------------------------------------------------------>|
       |                                                       |
       | 4. Login as firm admin                                |
       |    POST /api/v1/auth/login                            |
       +------------------------------------------------------>|
       |    JWT includes: { firm_id: "uuid", role: "firm_admin" }|
       |<------------------------------------------------------+
       |                                                       |
       | 5. Invite team members                                |
       |    POST /api/v1/firms/invitations                     |
       |    { email, role: "firm_user" }                        |
       +------------------------------------------------------>|
       |                                                       |
       | 6. Team member accepts, creates account               |
       |    JWT includes: { firm_id: "uuid", role: "firm_user" } |
       +------------------------------------------------------>|
       |                                                       |
       | 7. Access client data                                  |
       |    GET /api/v1/clients/{client_id}/statements         |
       |    JWT: { firm_id: "uuid" }                            |
       +------------------------------------------------------>|
       |    8. Verify firm_id in JWT matches resource           |
       |       RLS policy: WHERE firm_id = current_setting      |
       |       Return 403 if firm_id mismatch                   |
       |<------------------------------------------------------+
       |    { statements: [...] } (only this firm's clients)    |
```

### 6.3 API Authentication Flow

```
+--------+           +-----------+           +------------+           +-------+
|        |           |           |           |            |           |       |
| Client |           | CloudFront|           | ALB        |           | FastAPI|
|        |           |           |           |            |           |       |
+---+----+           +-----+-----+           +-----+------+           +---+---+
    |                      |                       |                       |
    | Request + JWT        |                       |                       |
    +--------------------->|                       |                       |
    |                      | Forward request       |                       |
    |                      +---------------------->|                       |
    |                      |                       | Forward to target     |
    |                      |                       +---------------------->|
    |                      |                       |                       |
    |                      |                       |                       | Decode JWT
    |                      |                       |                       | Verify signature (RS256)
    |                      |                       |                       | Check expiry
    |                      |                       |                       | Validate claims
    |                      |                       |                       | Check token blacklist
    |                      |                       |                       | Load user + firm context
    |                      |                       |                       | Verify resource access
    |                      |                       |                       |
    |                      |                       | 200 + Data            |
    |                      |                       |<----------------------+
    |                      | 200 + Data            |                       |
    |                      |<----------------------|                       |
    | 200 + Data           |                       |                       |
    |<---------------------|                       |                       |

JWT Claims Structure:
{
    "sub": "user-uuid",
    "firm_id": "firm-uuid",
    "role": "user|firm_admin|firm_user|admin",
    "scope": "statements:read statements:write export:read",
    "iat": 1705312800,
    "exp": 1705313700,
    "iss": "statementwise.ai",
    "aud": "statementwise.ai",
    "jti": "unique-token-id"
}
```

---

## 7. Network Segmentation

### 7.1 VPC Architecture

```
+-------------------------------------------------------------------------+
|                              AWS VPC                                    |
|                         10.0.0.0/16 (65,536 IPs)                       |
|                                                                         |
|  +-------------------------+  +-------------------------+              |
|  |  AZ-1a                  |  |  AZ-1b                  |              |
|  |                         |  |                         |              |
|  |  Public Subnet          |  |  Public Subnet          |              |
|  |  10.0.1.0/24            |  |  10.0.2.0/24            |              |
|  |                         |  |                         |              |
|  |  [NAT Gateway]          |  |  [NAT Gateway]          |              |
|  |  [ALB]                  |  |  [ALB]                  |              |
|  +-----------+-------------+  +-----------+-------------+              |
|              |                           |                              |
|  +-----------v-------------+  +-----------v-------------+              |
|  |  Application Subnet     |  |  Application Subnet     |              |
|  |  10.0.10.0/24           |  |  10.0.11.0/24           |              |
|  |                         |  |                         |              |
|  |  [ECS Tasks - API]      |  |  [ECS Tasks - API]      |              |
|  |  [ECS Tasks - Workers]  |  |  [ECS Tasks - Workers]  |              |
|  +-----------+-------------+  +-----------+-------------+              |
|              |                           |                              |
|  +-----------v-------------+  +-----------v-------------+              |
|  |  Data Subnet            |  |  Data Subnet            |              |
|  |  10.0.20.0/24           |  |  10.0.21.0/24           |              |
|  |                         |  |                         |              |
|  |  [RDS Primary]          |  |  [RDS Standby]          |              |
|  |  [ElastiCache Primary]  |  |  [ElastiCache Replica]  |              |
|  +-------------------------+  +-------------------------+              |
|                                                                         |
|  VPC Endpoints (PrivateLink):                                           |
|  + S3 Gateway Endpoint                                                  |
|  + Secrets Manager Interface Endpoint                                   |
|  + CloudWatch Logs Interface Endpoint                                   |
|  + ECR Interface Endpoint                                               |
|                                                                         |
|  Internet Gateway: Attached to VPC (Public subnets only)               |
|                                                                         |
|  Network ACLs:                                                           |
|  + Public:  Allow 80,443 inbound; All outbound                          |
|  + App:     Allow from ALB SG only; Outbound to data SG + NAT           |
|  + Data:    Allow from App SG only; No outbound to internet             |
+-------------------------------------------------------------------------+
```

### 7.2 Security Group Rules

```
=====================================================================
SECURITY GROUP: alb-sg (Application Load Balancer)
=====================================================================
INBOUND:
  Type        Protocol  Port    Source                    Description
  HTTPS       TCP       443     CloudFront prefix list    From CloudFront only
  HTTPS       TCP       443     VPN security group        Admin VPN access

OUTBOUND:
  Type        Protocol  Port    Destination               Description
  HTTP        TCP       8000  ecs-sg                    To ECS tasks

=====================================================================
SECURITY GROUP: ecs-sg (ECS Fargate Tasks)
=====================================================================
INBOUND:
  Type        Protocol  Port    Source                    Description
  HTTP        TCP       8000  alb-sg                    From ALB only
  HTTPS       TCP       443   ecs-sg (self)             Inter-task communication

OUTBOUND:
  Type        Protocol  Port    Destination               Description
  HTTPS       TCP       443   0.0.0.0/0                 External APIs (via NAT)
  PostgreSQL  TCP       5432  rds-sg                    To RDS
  Redis       TCP       6379  elasticache-sg            To ElastiCache
  HTTPS       TCP       443   s3-gateway                S3 via VPC endpoint
  HTTPS       TCP       443   secrets-manager-endpoint  Secrets Manager

=====================================================================
SECURITY GROUP: rds-sg (PostgreSQL Database)
=====================================================================
INBOUND:
  Type        Protocol  Port    Source                    Description
  PostgreSQL  TCP       5432  ecs-sg                    From ECS only
  PostgreSQL  TCP       5432  bastion-sg                From bastion (admin)

OUTBOUND:
  None (RDS doesn't initiate connections)

=====================================================================
SECURITY GROUP: elasticache-sg (Redis Cache)
=====================================================================
INBOUND:
  Type        Protocol  Port    Source                    Description
  Redis       TCP       6379  ecs-sg                    From ECS only

OUTBOUND:
  None

=====================================================================
SECURITY GROUP: bastion-sg (Management Bastion)
=====================================================================
INBOUND:
  Type        Protocol  Port    Source                    Description
  SSH         TCP       22    admin-office-ip/32        Admin office only

OUTBOUND:
  Type        Protocol  Port    Destination               Description
  PostgreSQL  TCP       5432  rds-sg                    DB admin access
  HTTPS       TCP       443   0.0.0.0/0                 AWS Console access
```

### 7.3 Network Flow Diagram

```
Internet
    |
    v
+------------------------------------------------------------------+
|                         CLOUDFRONT                                |
|  - Geo-restriction: Allow US, EU, CA, AU                        |
|  - Signed URLs for uploads                                       |
|  - Origin Access Identity for S3                                 |
|  - WAF integration                                               |
+------------------------------------------------------------------+
    |
    v
+------------------------------------------------------------------+
|                         WAF (WebACL)                              |
|  Rules (Priority Order):                                         |
|  1. Rate Limiting (> 2000 req/5min/IP = Block)                   |
|  2. SQL Injection Protection (AWS Managed)                       |
|  3. XSS Protection (AWS Managed)                                 |
|  4. Known Bad Inputs (AWS Managed)                               |
|  5. Geo-blocking (CN, RU, KP, IR = Block)                        |
|  6. Bot Control (Rate-based)                                     |
+------------------------------------------------------------------+
    |
    v
+------------------------------------------------------------------+
|                         ALB (HTTPS:443)                           |
|  - TLS 1.3 only                                                  |
|  - Certificate: ACM                                              |
|  - Health checks: /health                                        |
|  - Access logs: S3                                               |
|  - Connection logs: CloudWatch                                    |
+------------------------------------------------------------------+
    |
    +-------------------+-------------------+
    |                   |                   |
    v                   v                   v
+--------+       +-----------+      +------------+
| ECS    |       | ECS       |      | ECS        |
| Task 1 |       | Task 2    |      | Task 3     |
| (API)  |       | (API)     |      | (Worker)   |
+---+----+       +----+------+      +-----+------+
    |                 |                   |
    |                 |                   |
    +--------+--------+                   |
             |                            |
             v                            v
    +----------------+           +------------------+
    | NAT Gateway    |           | SQS Queue         |
    | (Outbound only)|           | (Processing Jobs) |
    +--------+-------+           +---------+--------+
             |                             |
             v                             v
    +----------------+           +------------------+
    | External APIs  |           | ECS Worker Task   |
    | (Moonshot,     |           | (PDF Processing)  |
    |  Stripe,       |           +------------------+
    |  SendGrid)     |
    +----------------+

Database Access (Private Subnets):
----------------------------------
ECS Task --> Security Group Check --> RDS (Port 5432, TLS 1.3)
ECS Task --> Security Group Check --> ElastiCache (Port 6379, AUTH)

Storage Access:
--------------
ECS Task --> VPC Endpoint --> S3 (SSE-KMS)
```

---

## 8. Security Controls Mapping

### 8.1 Defense in Depth Layers

```
+-------------------------------------------------------------------------+
|                         DEFENSE IN DEPTH                                |
+-------------------------------------------------------------------------+

LAYER 1: PERIMETER                                                        
+------------------+  +------------------+  +------------------+          
| DDoS Protection  |  | WAF              |  | Geo-Restriction  |          
| (AWS Shield)     |  | (SQLi, XSS, Bot) |  | (CloudFront)     |          
+------------------+  +------------------+  +------------------+          

LAYER 2: NETWORK                                                          
+------------------+  +------------------+  +------------------+          
| VPC Isolation    |  | Security Groups  |  | Network ACLs     |          
| (Private Subnets)|  | (Least Privilege)|  | (Subnet Rules)   |          
+------------------+  +------------------+  +------------------+          

LAYER 3: IDENTITY                                                         
+------------------+  +------------------+  +------------------+          
| Authentication   |  | Authorization    |  | Session Mgmt     |          
| (JWT + bcrypt)   |  | (RBAC + RLS)     |  | (HttpOnly Cookie)|           
+------------------+  +------------------+  +------------------+          

LAYER 4: APPLICATION                                                      
+------------------+  +------------------+  +------------------+          
| Input Validation |  | Output Encoding  |  | CSRF Protection  |          
| (Pydantic + San) |  | (JSON + Escape)  |  | (Token + Origin) |          
+------------------+  +------------------+  +------------------+          

LAYER 5: DATA                                                             
+------------------+  +------------------+  +------------------+          
| Encryption Rest  |  | Encryption Transit|  | Access Controls  |          
| (AES-256 + KMS)  |  | (TLS 1.3 + mTLS) |  | (Row-Level Sec)  |          
+------------------+  +------------------+  +------------------+          

LAYER 6: MONITORING                                                       
+------------------+  +------------------+  +------------------+          
| Audit Logging    |  | SIEM             |  | Alerting         |          
| (CloudTrail)     |  | (CloudWatch)     |  | (PagerDuty)      |          
+------------------+  +------------------+  +------------------+          

LAYER 7: RECOVERY                                                         
+------------------+  +------------------+  +------------------+          
| Automated Backups|  | Disaster Recovery|  | Incident Response|          
| (RDS + S3)       |  | (Multi-AZ + RTO) |  | (Documented IRP) |          
+------------------+  +------------------+  +------------------+          
```

### 8.2 Control-to-Threat Mapping

| Threat Category | Primary Controls | Secondary Controls |
|----------------|-----------------|-------------------|
| Injection Attacks | WAF, Input Validation, Parameterized Queries | Output Encoding, RLS |
| Authentication Attacks | bcrypt, Rate Limiting, MFA | Account Lockout, Breach Detection |
| Authorization Attacks | RBAC, RLS, Scope-based Access | Audit Logging, Anomaly Detection |
| Data Breach | Encryption (at rest + transit), Least Privilege | DLP, Access Reviews |
| Session Hijacking | HttpOnly Cookies, Short Expiry, Token Binding | Device Fingerprinting, Rotation |
| CSRF | SameSite=Strict, CSRF Tokens, Origin Validation | CORS Policy |
| Information Disclosure | Generic Errors, Log Sanitization | Response Header Security |
| DoS | Rate Limiting, Auto-scaling, DDoS Protection | Circuit Breaker, Queue Depth Limits |
| Supply Chain | Dependency Scanning, SBOM, Vendor Assessment | Pinning, Minimal Base Images |

---

## 9. Appendices

### Appendix A: AWS Architecture Diagram (ASCII)

```
                                    +---------+
                                    |  User   |
                                    +----+----+
                                         |
                                         | HTTPS
                                         v
+--------------------------------------------------------------------------------+
|                                    CloudFront                                  |
|  + Signed URLs  +  + Geo-Restriction  +  + WAF Integration  +                  |
+-----------------------------------+--------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------------+
|                                      WAF                                       |
|  Managed Rules: SQLi, XSS, Bad Inputs, Rate Limiting, Geo-blocking             |
+-----------------------------------+--------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------------+
|                         ALB (TLS 1.3 Termination)                              |
+-----------------------------------+--------------------------------------------+
                                    |
                      +-------------+-------------+
                      |                           |
                      v                           v
+-----------------------------------+  +----------------------------------------+
|  ECS Fargate (API Tasks)          |  |  ECS Fargate (Worker Tasks)            |
|  + FastAPI Backend                |  |  + PDF Processing                       |
|  + React SPA (Served)             |  |  + LLM Integration                      |
|                                   |  |  + Data Validation                      |
+-----------------------------------+  +----------------------------------------+
         |        |                             |
         |        |                             |
         v        v                             v
+------------+  +------------------+  +------------------+
| Secrets    |  | AWS KMS          |  | Moonshot AI      |
| Manager    |  | (Key Management) |  | (via NAT Gateway)|
+------------+  +------------------+  +------------------+

         |
         v
+-----------------------------------+  +----------------------------------------+
|  Data Subnet (Private)            |  |  Monitoring                            |
|                                   |  |                                        |
|  +-----------------------------+  |  |  + CloudWatch (Logs + Metrics)        |
|  | PostgreSQL (RDS)            |  |  |  + S3 (Audit Logs - Object Lock)      |
|  | + TDE Encryption            |  |  |  + GuardDuty (Threat Detection)       |
|  | + Multi-AZ                  |  |  |  + Security Hub (Findings)            |
|  | + Automated Backups         |  |  |                                        |
|  +-----------------------------+  |  +----------------------------------------+
|                                   |
|  +-----------------------------+  |
|  | Redis (ElastiCache)         |  |
|  | + AUTH Required             |  |
|  | + Encryption                |  |
|  +-----------------------------+  |
|                                   |
|  +-----------------------------+  |
|  | S3 (Documents)              |  |
|  | + SSE-KMS                   |  |
|  | + Object Lock               |  |
|  | + Cross-Region Replication  |  |
|  +-----------------------------+  |
+-----------------------------------+
```

### Appendix B: Component Inventory

| Component | Technology | Version | Security Responsibility |
|-----------|-----------|---------|------------------------|
| Frontend Framework | React | 18.x | Statementwise |
| Build Tool | Vite | 5.x | Statementwise |
| Styling | Tailwind CSS | 3.x | Statementwise |
| Backend Framework | FastAPI | 0.104+ | Statementwise |
| ORM | SQLAlchemy | 2.x | Statementwise |
| Database | PostgreSQL | 15 | Statementwise + AWS |
| Cache | Redis | 7 | Statementwise + AWS |
| LLM Provider | Moonshot AI | API v1 | Moonshot AI |
| CDN | CloudFront | N/A | AWS |
| WAF | AWS WAF | v2 | Statementwise + AWS |
| Load Balancer | ALB | N/A | AWS |
| Container Platform | ECS Fargate | N/A | AWS |
| Object Storage | S3 | N/A | Statementwise + AWS |
| Secrets Management | Secrets Manager | N/A | AWS |
| Key Management | KMS | N/A | AWS |
| Payment Processing | Stripe | API v1 | Stripe |
| Email Delivery | SendGrid | API v3 | SendGrid |
| Analytics | Mixpanel | N/A | Mixpanel |

### Appendix C: Data Classification and Handling

| Data Type | Classification | Storage | Encryption | Access |
|-----------|---------------|---------|------------|--------|
| Bank Statement PDFs | Highly Confidential | S3 (SSE-KMS) | AES-256 | Owner + Firm only |
| Transaction Data | Highly Confidential | PostgreSQL (TDE) | AES-256 | Owner + Firm only |
| User Credentials | Confidential | PostgreSQL (bcrypt) | bcrypt+pepper | Self only |
| JWT Tokens | Confidential | Redis + Client | N/A (short-lived) | Session only |
| API Keys | Confidential | Secrets Manager | AES-256 | Service only |
| Audit Logs | Confidential | S3 (Object Lock) | AES-256 | Security team |
| Email Addresses | Confidential | PostgreSQL | AES-256 (TDE) | User + Admin |
| Analytics Events | Internal | Mixpanel | TLS in transit | Aggregated only |
| System Logs | Internal | CloudWatch | TLS in transit | Platform team |

### Appendix D: Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-01-15 | 1.0 | Security Team | Initial architecture documentation |

---

**END OF DOCUMENT**
