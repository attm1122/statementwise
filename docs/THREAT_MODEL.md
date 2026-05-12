# Statementwise.ai - Threat Model Document

**Document Version:** 1.0  
**Date:** 2025-01-15  
**Classification:** CONFIDENTIAL  
**Author:** Security Architecture Team  
**Review Cycle:** Quarterly  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Data Flow Diagrams (DFD)](#3-data-flow-diagrams-dfd)
4. [Trust Boundaries](#4-trust-boundaries)
5. [STRIDE Threat Analysis](#5-stride-threat-analysis)
6. [Attack Trees](#6-attack-trees)
7. [Risk Scoring Matrix](#7-risk-scoring-matrix)
8. [Threat Register](#8-threat-register)
9. [Mitigation Implementation Roadmap](#9-mitigation-implementation-roadmap)
10. [Appendices](#10-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document presents a comprehensive threat model for Statementwise.ai, a bank statement conversion SaaS platform that processes sensitive financial documents using AI/LLM technology. The analysis follows Microsoft's STRIDE methodology to identify, categorize, and prioritize security threats.

### 1.2 Scope

| In Scope | Out of Scope |
|----------|-------------|
| React/TypeScript frontend application | End-user endpoint security |
| Python/FastAPI backend API | Physical security of user premises |
| PDF bank statement processing pipeline | Security of partner banks |
| Moonshot AI LLM integration | Internet backbone infrastructure |
| Client portal for accounting firms | Browser vulnerabilities (handled separately) |
| Data storage and transmission | |
| Authentication and authorization | |

### 1.3 Methodology

This threat model uses:
- **STRIDE** classification for threat categorization
- **DREAD** scoring for risk assessment (where applicable)
- **Attack trees** for complex attack scenarios
- **Data Flow Diagrams** for system boundary analysis

### 1.4 Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Security Team | Initial release |

---

## 2. System Overview

### 2.1 System Description

Statementwise.ai is a cloud-based SaaS platform that:
- Accepts PDF bank statement uploads from individual users and accounting firms
- Extracts transaction data using AI-powered OCR and LLM processing
- Converts extracted data into structured formats (CSV, Excel, JSON)
- Provides client portals for accounting firms to manage multiple clients
- Integrates with Moonshot AI LLM for intelligent data extraction

### 2.2 Key Assets

| Asset ID | Asset | Classification | Owner | Location |
|----------|-------|---------------|-------|----------|
| A-001 | Bank statement PDFs | HIGHLY CONFIDENTIAL | Data Owner | Encrypted S3/EBS |
| A-002 | Extracted transaction data | HIGHLY CONFIDENTIAL | Data Owner | PostgreSQL (encrypted) |
| A-003 | User credentials/hashes | CONFIDENTIAL | Security Team | PostgreSQL |
| A-004 | JWT session tokens | CONFIDENTIAL | Security Team | Client-side / Redis |
| A-005 | Moonshot AI API keys | CONFIDENTIAL | Security Team | AWS Secrets Manager |
| A-006 | Firm/client relationship data | CONFIDENTIAL | Data Owner | PostgreSQL |
| A-007 | Audit logs | CONFIDENTIAL | Security Team | S3 + CloudWatch |
| A-008 | Application source code | CONFIDENTIAL | Engineering | GitHub (private) |
| A-009 | Infrastructure configurations | CONFIDENTIAL | DevOps | Terraform Cloud |

### 2.3 Architecture Components

```
+------------------+      HTTPS/TLS 1.3      +------------------+
|                  | -----------------------> |                  |
|   React Frontend | <----------------------- |  FastAPI Backend |
|   (CloudFront)   |      JWT + API Key      |   (ECS/Fargate)  |
|                  |                         |                  |
+------------------+                         +--------+---------+
                                                      |
                                           +----------+----------+
                                           |                     |
                                    +------v------+    +---------v------+
                                    |  PostgreSQL |    |   Redis Cache  |
                                    |   (RDS)     |    |  (ElastiCache) |
                                    +------+------+    +---------+------+
                                           |                     |
                                    +------v------+    +---------v------+
                                    |S3 (PDF Store)|   |CloudWatch Logs |
                                    |(Encrypted)   |   |                |
                                    +------+------+   +----------------+
                                           |
                                    +------v--------+
                                    |  Moonshot AI   |
                                    |  API (China)   |
                                    +----------------+
```

---

## 3. Data Flow Diagrams (DFD)

### 3.1 Level 0 - Context Diagram

```
                                +-------------------+
                                |   External User   |
                                |  (Individual/Firm)|
                                +--------+----------+
                                         |
                                         | HTTPS/TLS 1.3
                                         | Upload PDF / View Results
                                         v
+-------------------+         +-------------------------+         +-------------------+
|                   |         |                         |         |                   |
|   Moonshot AI     | <-----> |    Statementwise.ai     | <-----> |   Email Service   |
|   (LLM Provider)  |  API    |    SaaS Platform        |  SMTP   |   (SendGrid)      |
|                   |         |                         |         |                   |
+-------------------+         +------------+------------+         +-------------------+
                                           |
                                           |
                              +------------v------------+
                              |    Accounting Firm      |
                              |    Client Portal        |
                              +-------------------------+
```

### 3.2 Level 1 - Decomposed DFD

```
+----------+     +------------------+     +-------------------+     +------------------+
|  User    |---->| 1.0 Authentication|---->| 2.0 Statement     |---->| 3.0 Processing   |
| (Browser)|     |    Service        |     |    Upload Service |     |    Engine        |
+----------+     +------------------+     +-------------------+     +--------+---------+
                                                                               |
                                    +------------------------------------------+
                                    |
+----------+     +------------------v---+     +-------------------+     +------------------+
|  Admin   |---->| 4.0 User/Firm      |<--->| 5.0 Audit &       |<--->| 6.0 Export       |
| (Portal) |     |    Management      |     |    Logging        |     |    Service       |
+----------+     +--------------------+     +-------------------+     +------------------+
```

**Data Flows:**

| Flow ID | Source | Destination | Data | Protocol | Protection |
|---------|--------|-------------|------|----------|------------|
| DF-001 | User | 1.0 Auth | Credentials (email/password) | HTTPS | TLS 1.3, rate limiting |
| DF-002 | 1.0 Auth | User | JWT Token + Refresh Token | HTTPS | HttpOnly cookies, Secure flag |
| DF-003 | User | 2.0 Upload | PDF bank statement + metadata | HTTPS | TLS 1.3, signed URLs |
| DF-004 | 2.0 Upload | 3.0 Processing | PDF file reference + extraction config | Internal | mTLS, internal network |
| DF-005 | 3.0 Processing | Moonshot AI | PDF content (base64) + prompt | HTTPS | TLS 1.3, API key auth |
| DF-006 | Moonshot AI | 3.0 Processing | Extracted JSON data | HTTPS | TLS 1.3 |
| DF-007 | 3.0 Processing | 6.0 Export | Structured transaction data | Internal | Internal encryption |
| DF-008 | 6.0 Export | User | CSV/Excel/JSON export | HTTPS | TLS 1.3 |
| DF-009 | All processes | 5.0 Audit | Log events | Internal | Encrypted transport |
| DF-010 | 4.0 Management | 5.0 Audit | Admin actions | Internal | Encrypted transport |

### 3.3 Level 2 - Upload and Processing Flow

```
+--------+     +-------------+     +--------------+     +--------------+     +-------------+
|  User  |---->| API Gateway |---->| Upload       |---->| PDF Store    |---->| Extractor   |
|        |     | (WAF/Rate   |     | Handler      |     | (S3 Encrypted)|    | Service     |
|        |     |  Limit)     |     | (Validate    |     |              |     | (Queue)     |
|        |     |             |     |  Scan)       |     |              |     |             |
+--------+     +-------------+     +--------------+     +--------------+     +------+------+
                                                                                    |
                                                                          +---------v---------+
                                                                          |  Moonshot AI API  |
                                                                          |  (via Proxy)      |
                                                                          +---------+---------+
                                                                                    |
                                                                          +---------v---------+
                                                                          |  Validation       |
                                                                          |  Engine           |
                                                                          +---------+---------+
                                                                                    |
                                                                          +---------v---------+
                                                                          |  PostgreSQL       |
                                                                          |  (RDS Encrypted)  |
                                                                          +-------------------+
```

---

## 4. Trust Boundaries

### 4.1 Trust Boundary Map

```
+--------------------------------------------------------------------------+
|                            UNTRUSTED ZONE                                 |
|  +-------------+  +-------------+  +-------------+  +-----------------+  |
|  | End User    |  | Attacker    |  | Moonshot AI |  | Email Service   |  |
|  | Browser     |  | (External)  |  | (External)  |  | (External)      |  |
|  +------+------+  +-------------+  +------+------+  +-----------------+  |
|         |                                 |                               |
+---------|---------------------------------|--------------------------------
          |                                 |
+---------v---------------------------------v--------------------------------+
|                         PERIMETER ZONE                                    |
|  +------------------+  +------------------+  +-------------------------+  |
|  | CloudFront CDN   |  | WAF (AWS/Cloud)  |  | API Gateway / ALB       |  |
|  +------------------+  +------------------+  +-------------------------+  |
|                                                                            |
+------------------------------------+---------------------------------------+
                                     |
+------------------------------------v---------------------------------------+
|                         APPLICATION ZONE (Trusted)                        |
|  +------------------+  +------------------+  +-------------------------+  |
|  | FastAPI Backend  |  | React Frontend   |  | Background Workers      |  |
|  | (ECS/Fargate)    |  | (S3/CloudFront)  |  | (Celery/RQ)             |  |
|  +------------------+  +------------------+  +-------------------------+  |
|                                                                            |
+------------------------------------+---------------------------------------+
                                     |
+------------------------------------v---------------------------------------+
|                         DATA ZONE (Highly Trusted)                        |
|  +------------------+  +------------------+  +-------------------------+  |
|  | PostgreSQL (RDS) |  | Redis (Cache)    |  | S3 (Document Storage)   |  |
|  | + TDE Encryption |  | + Auth Required  |  | + SSE-S3 + Bucket Policy|  |
|  +------------------+  +------------------+  +-------------------------+  |
|                                                                            |
+----------------------------------------------------------------------------+
```

### 4.2 Trust Boundary Definitions

| Boundary ID | Name | Trust Level | Controls |
|-------------|------|-------------|----------|
| TB-001 | Internet Perimeter | UNTRUSTED | WAF, DDoS protection, TLS termination |
| TB-002 | CDN/Edge | SEMI-TRUSTED | CloudFront signed URLs, origin access identity |
| TB-003 | Application Runtime | TRUSTED | Container isolation, IAM roles, security groups |
| TB-004 | Data Storage | HIGHLY TRUSTED | Encryption at rest, VPC isolation, no direct internet |
| TB-005 | Third-Party (Moonshot) | UNTRUSTED | API key rotation, request signing, data minimization |
| TB-006 | Management/Admin | TRUSTED | VPN required, MFA enforced, audit logging |

---

## 5. STRIDE Threat Analysis

### 5.1 SPOOFING (Identity)

> **Definition:** Pretending to be someone or something else

#### Threat: S-001 - Account Takeover via Credential Stuffing

| Attribute | Details |
|-----------|---------|
| **Description** | Attackers use leaked credentials from other breaches to gain unauthorized access to Statementwise accounts. High value target due to financial data. |
| **Affected Components** | Authentication service, User accounts, API endpoints |
| **Attack Vector** | Automated login attempts using credential lists from dark web |
| **Prerequisites** | User has reused password across services; no MFA enabled |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 4/5 | Credential stuffing is common; financial services are prime targets |
| Impact | 5/5 | Access to bank statements = severe financial privacy breach |
| **Risk Score** | **20/25 - CRITICAL** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Rate limiting on login | Max 5 attempts per 15 min per IP | Required |
| P0 | Multi-factor authentication | TOTP/SMS for all accounts | Required |
| P0 | Password breach detection | Integrate HaveIBeenPwned API | Required |
| P1 | Device fingerprinting | Track and alert on new devices | Recommended |
| P1 | CAPTCHA after failures | reCAPTCHA v3 after 3 failures | Recommended |
| P2 | Geo-location anomaly | Alert on logins from unusual locations | Optional |

---

#### Threat: S-002 - Session Hijacking

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker steals valid session token (JWT) and impersonates authenticated user |
| **Affected Components** | JWT handling, session management, client storage |
| **Attack Vector** | XSS, network sniffing (if not HTTPS), local malware, token theft from browser storage |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Requires additional vulnerability (XSS) or local compromise |
| Impact | 5/5 | Full account access as victim |
| **Risk Score** | **15/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | HttpOnly cookies | JWT in HttpOnly, Secure, SameSite=Strict cookies | Required |
| P0 | Short token expiry | Access token: 15 min; Refresh token: 7 days | Required |
| P0 | Token binding | Bind tokens to TLS session / device fingerprint | Required |
| P1 | Session invalidation | Secure logout endpoint, token blacklist in Redis | Required |
| P1 | Concurrent session limit | Max 3 active sessions per user | Recommended |
| P2 | Session anomaly detection | Alert on simultaneous logins from different IPs | Recommended |

---

#### Threat: S-003 - JWT Token Theft and Replay

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker intercepts or extracts JWT and replays it to access API |
| **Affected Components** | API Gateway, Authentication middleware |
| **Attack Vector** | Man-in-the-middle (if TLS downgraded), XSS, insecure logging |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | TLS 1.3 makes interception difficult; requires secondary vuln |
| Impact | 5/5 | Full API access as victim |
| **Risk Score** | **10/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | TLS 1.3 only | Enforce minimum TLS 1.3; HSTS with preload | Required |
| P0 | Signed JWTs | RS256 with strong key rotation (monthly) | Required |
| P0 | Token claims validation | Verify iss, aud, exp, nbf on every request | Required |
| P1 | Token rotation | New access token on each refresh; invalidate old | Recommended |
| P1 | Request signing | Include request signature in JWT claims | Optional |

---

#### Threat: S-004 - Admin Impersonation

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker gains administrative access to firm/client management portal |
| **Affected Components** | Admin endpoints, RBAC system, Firm management |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | Admin accounts are fewer but higher value targets |
| Impact | 5/5 | Access to all firms and client data |
| **Risk Score** | **10/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Separate admin auth | Dedicated admin portal with enhanced MFA | Required |
| P0 | IP allowlisting | Admin access only from corporate IPs/VPN | Required |
| P0 | Admin action approval | Sensitive actions require second admin approval | Required |
| P1 | Just-in-time access | Time-limited admin privileges | Recommended |
| P1 | Admin session recording | Record all admin sessions for audit | Recommended |

---

### 5.2 TAMPERING (Integrity)

> **Definition:** Modifying data or code

#### Threat: T-001 - Man-in-the-Middle (MitM) on API Traffic

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker intercepts and modifies API communications between client and server |
| **Affected Components** | All API endpoints, Data in transit |
| **Attack Vector** | ARP spoofing, rogue WiFi, BGP hijacking, SSL stripping |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | TLS 1.3 with certificate pinning makes this difficult |
| Impact | 5/5 | Modified transactions, data corruption, unauthorized actions |
| **Risk Score** | **10/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | TLS 1.3 mandatory | No fallback to older TLS versions | Required |
| P0 | HSTS header | max-age=31536000; includeSubDomains; preload | Required |
| P0 | Certificate transparency | Monitor for unauthorized certificates | Required |
| P1 | Certificate pinning | Pin expected certificates in mobile clients | Recommended |
| P1 | Request/response signing | HMAC signature on critical endpoints | Optional |

---

#### Threat: T-002 - Modification of Extracted Transaction Data

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker modifies transaction data after extraction, before storage or display |
| **Affected Components** | Database, API responses, Export functionality |
| **Attack Vector** | SQL injection, direct DB access, API response manipulation |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Requires application vulnerability or database compromise |
| Impact | 4/5 | Corrupted financial records, incorrect balances, compliance issues |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Input validation | Strict type validation on all API inputs | Required |
| P0 | Parameterized queries | ORM/SQL injection prevention (SQLAlchemy) | Required |
| P0 | Data integrity hashes | SHA-256 hash of extracted data, stored and verified | Required |
| P1 | Digital signatures | Sign extracted data packages with service key | Recommended |
| P1 | Reconciliation checks | Automated balance reconciliation against statement totals | Required |
| P2 | Immutable audit trail | Append-only audit log of all data modifications | Required |

---

#### Threat: T-003 - Tampering with Uploaded Files

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker modifies PDF files after upload but before processing, or replaces files |
| **Affected Components** | S3 storage, Upload handler, Processing queue |
| **Attack Vector** | Object-level access, signed URL manipulation, queue injection |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | S3 has strong access controls; requires credential compromise |
| Impact | 4/5 | Wrong data processed, potential malicious content injection |
| **Risk Score** | **8/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | File integrity hash | SHA-256 computed at upload, verified before processing | Required |
| P0 | S3 object lock | WORM (Write Once Read Many) on uploaded documents | Required |
| P0 | Signed URLs | Time-limited presigned URLs for all file operations | Required |
| P1 | Content verification | Verify PDF structure before processing | Recommended |
| P1 | Upload checksum | Client computes hash, server verifies on receipt | Recommended |

---

#### Threat: T-004 - Tampering with Audit Logs

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker modifies or deletes audit logs to cover tracks |
| **Affected Components** | CloudWatch Logs, S3 audit bucket, Log aggregation |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | Requires infrastructure-level access |
| Impact | 5/5 | Undetectable attacks, compliance violations, forensic inability |
| **Risk Score** | **10/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Immutable storage | S3 Object Lock with Compliance mode | Required |
| P0 | Cross-account logging | Logs replicated to separate AWS account | Required |
| P0 | Log integrity | Chain-hashed logs with previous hash embedded | Required |
| P1 | SIEM integration | Real-time log forwarding to external SIEM | Recommended |
| P1 | Log monitoring | Alert on abnormal log volume or deletions | Recommended |

---

### 5.3 REPUDIATION (Non-repudiation)

> **Definition:** Denying that an action was performed

#### Threat: R-001 - User Denies Uploading Specific Files

| Attribute | Details |
|-----------|---------|
| **Description** | User claims they did not upload a particular bank statement |
| **Affected Components** | Upload service, Audit logging, User session tracking |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Plausible scenario for dispute resolution |
| Impact | 3/5 | Legal disputes, compliance issues, reputational damage |
| **Risk Score** | **9/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Immutable audit logs | Every upload logged with user ID, timestamp, IP, file hash | Required |
| P0 | Digital signatures | User session cryptographically bound to upload event | Required |
| P0 | Timestamp authority | RFC 3161 compliant timestamps on upload events | Required |
| P1 | Upload confirmation | Email confirmation to user with upload details | Recommended |
| P1 | Retention of evidence | 7-year retention of audit evidence | Required (EU) |

---

#### Threat: R-002 - Firm Denies Accessing Client Data

| Attribute | Details |
|-----------|---------|
| **Description** | Accounting firm denies accessing or exporting a client's statements |
| **Affected Components** | Firm portal, Client data access, Export audit |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Potential for insider misuse at firm level |
| Impact | 4/5 | Client disputes, GDPR accountability issues |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Granular audit logs | Log every data access: who, what, when, from where | Required |
| P0 | Access acknowledgment | Firm acknowledges data access policies on login | Required |
| P0 | Client access transparency | Clients can view who accessed their data | Required |
| P1 | Non-repudiation tokens | Cryptographic proof of access attached to each session | Recommended |
| P1 | Regular access reports | Automated reports to clients showing data access | Recommended |

---

#### Threat: R-003 - Administrator Denies Configuration Changes

| Attribute | Details |
|-----------|---------|
| **Description** | Admin denies making security-relevant configuration changes |
| **Affected Components** | Infrastructure, Security settings, User permissions |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | Requires insider threat scenario |
| Impact | 4/5 | Undetectable configuration drift, security degradation |
| **Risk Score** | **8/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Immutable audit trail | All admin actions logged with MFA-verified identity | Required |
| P0 | Infrastructure as Code | All changes via version-controlled Terraform | Required |
| P0 | Change approval workflow | Dual authorization for security-critical changes | Required |
| P1 | Automated drift detection | Continuous compliance scanning for config changes | Recommended |

---

### 5.4 INFORMATION DISCLOSURE (Confidentiality)

> **Definition:** Exposing information to unauthorized parties

#### Threat: I-001 - Bank Statement Data Breach

| Attribute | Details |
|-----------|---------|
| **Description** | Unauthorized access to stored bank statements or extracted data |
| **Affected Components** | S3 storage, PostgreSQL database, API endpoints |
| **Attack Vector** | SQL injection, IDOR, compromised credentials, insider threat |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Financial data is high-value target; multiple attack paths |
| Impact | 5/5 | Complete financial profile exposure; regulatory fines; business-ending |
| **Risk Score** | **15/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Encryption at rest | AES-256 for S3 (SSE-S3/SSE-KMS), RDS TDE | Required |
| P0 | Encryption in transit | TLS 1.3 for all data movement | Required |
| P0 | Row-level security | PostgreSQL RLS: users can only access own data | Required |
| P0 | Firm isolation | Firm data in separate logical partitions | Required |
| P0 | API authorization | Scope-based access: user can only access own resources | Required |
| P1 | Data masking | Mask account numbers in UI (show last 4 digits only) | Required |
| P1 | Data minimization | Delete raw PDFs after successful extraction (configurable) | Recommended |
| P2 | DLP controls | Prevent data exfiltration via API responses | Recommended |

---

#### Threat: I-002 - API Key Exposure

| Attribute | Details |
|-----------|---------|
| **Description** | Moonshot AI API key or application API keys exposed |
| **Affected Components** | Secrets management, Source code, Environment variables |
| **Attack Vector** | Hardcoded keys in repos, leaked env files, log exposure |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Common developer mistake; high visibility if leaked |
| Impact | 4/5 | Unauthorized LLM usage, data exfiltration to AI provider, cost bombing |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Secrets manager | AWS Secrets Manager with automatic rotation | Required |
| P0 | No secrets in code | Pre-commit hooks (git-secrets, truffleHog) | Required |
| P0 | Least privilege API keys | Scope keys to specific operations only | Required |
| P1 | Key rotation | Automatic 90-day rotation; emergency rotation capability | Required |
| P1 | Anomaly detection | Alert on unusual API usage patterns | Recommended |
| P2 | Key splitting | Split key across multiple secrets; require combination | Optional |

---

#### Threat: I-003 - Log File Leakage

| Attribute | Details |
|-----------|---------|
| **Description** | Sensitive data exposed in application or system logs |
| **Affected Components** | Application logging, CloudWatch, Error tracking (Sentry) |
| **Attack Vector** | Verbose logging, error messages with sensitive data, log misconfiguration |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Common configuration issue; hard to prevent completely |
| Impact | 4/5 | PII exposure, compliance violation, credential exposure |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Log sanitization | Automatic PII redaction in all log outputs | Required |
| P0 | Structured logging | JSON logs with explicit classification of sensitive fields | Required |
| P0 | Log access controls | IAM policies restricting log access to security team | Required |
| P1 | Log classification | Mark logs with sensitivity level; apply handling rules | Recommended |
| P1 | Regular log audits | Monthly review of log content for sensitive data | Recommended |
| P2 | Log retention limits | Automatic purging per retention policy | Required |

---

#### Threat: I-004 - Side-Channel Attacks (Timing)

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker infers information from response timing differences |
| **Affected Components** | Authentication endpoints, User lookup, Data access APIs |
| **Attack Vector** | Measure response time to determine if user exists, if data exists |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | Requires sophisticated attacker; can be noisy |
| Impact | 3/5 | User enumeration, data existence inference |
| **Risk Score** | **6/25 - LOW** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Constant-time operations | Constant-time comparison for credentials | Required |
| P0 | Response timing normalization | Add random delay to sensitive endpoints | Required |
| P1 | Generic error messages | Same error for invalid user and invalid password | Required |
| P1 | Rate limiting | Prevents rapid timing measurements | Required |

---

#### Threat: I-005 - Information Disclosure via Error Messages

| Attribute | Details |
|-----------|---------|
| **Description** | Detailed error messages reveal system internals, database structure, or stack traces |
| **Affected Components** | API error handling, Frontend error display |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 4/5 | Common developer oversight; easy to trigger |
| Impact | 3/5 | Information useful for targeted attacks |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Generic error responses | Production shows generic messages only | Required |
| P0 | Error logging separation | Full details logged server-side only | Required |
| P0 | Safe error codes | Public error codes map to internal details securely | Required |
| P1 | Error monitoring | Sentry integration with data scrubbing | Recommended |

---

#### Threat: I-006 - LLM Prompt Injection Leading to Data Exfiltration

| Attribute | Details |
|-----------|---------|
| **Description** | Maliciously crafted PDF causes LLM to leak data from other users or system prompts |
| **Affected Components** | PDF processing, Moonshot AI integration, Prompt templates |
| **Attack Vector** | Indirect prompt injection via PDF content |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Prompt injection is active research area; financial incentive |
| Impact | 5/5 | Cross-user data leakage, system prompt exposure |
| **Risk Score** | **15/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Input sanitization | Strip suspicious patterns before LLM submission | Required |
| P0 | Context isolation | Each request in fresh context; no conversation history | Required |
| P0 | Output validation | Schema validation and content filtering on LLM output | Required |
| P1 | Prompt hardening | Delimiter-based input separation; system prompt isolation | Required |
| P1 | Sandboxed processing | Process each PDF in isolated, ephemeral environment | Recommended |
| P2 | LLM output inspection | Pattern detection for data exfiltration attempts | Recommended |

---

### 5.5 DENIAL OF SERVICE (Availability)

> **Definition:** Disrupting service availability

#### Threat: D-001 - Upload Flooding (Large PDFs)

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker uploads extremely large or numerous PDFs to exhaust storage/processing |
| **Affected Components** | Upload handler, S3 storage, Processing queue |
| **Attack Vector** | Automated upload of large files or many small files |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 4/5 | Easy to execute; no authentication required for some endpoints |
| Impact | 3/5 | Service degradation, storage costs, queue congestion |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | File size limits | Max 25MB per file, max 100 pages | Required |
| P0 | Upload rate limiting | Max 10 uploads per hour per user | Required |
| P0 | Storage quotas | Per-user and per-firm storage limits | Required |
| P1 | File type validation | Strict PDF validation; reject malformed files | Required |
| P1 | Queue depth limiting | Max queue size with graceful rejection | Recommended |
| P1 | Async processing | Return immediately; process in background | Required |
| P2 | Cost alerts | Billing alerts for unusual storage growth | Recommended |

---

#### Threat: D-002 - API Rate Limit Exhaustion

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker floods API with requests to deny service to legitimate users |
| **Affected Components** | API Gateway, Backend services, Database |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 4/5 | Common attack; easily automated |
| Impact | 3/5 | Service unavailability for legitimate users |
| **Risk Score** | **12/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Tiered rate limiting | Per-IP, per-user, per-API-key limits | Required |
| P0 | WAF protection | AWS WAF with rate-based rules | Required |
| P0 | DDoS protection | AWS Shield Standard + Advanced | Required |
| P1 | Circuit breaker | Fail-fast when backend is overloaded | Recommended |
| P1 | Priority queuing | Priority to authenticated vs anonymous requests | Recommended |
| P2 | Geographic blocking | Block high-risk countries if not in target market | Optional |

---

#### Threat: D-003 - LLM API Cost Bombing

| Attribute | Details |
|-----------|---------|
| **Description** | Attacker exploits LLM integration to generate excessive API costs |
| **Affected Components** | Moonshot AI integration, Billing, Processing pipeline |
| **Attack Vector** | Upload files designed to maximize token usage; exploit processing loops |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 4/5 | Direct financial incentive; easy to trigger |
| Impact | 4/5 | Excessive LLM API costs; potential service shutdown |
| **Risk Score** | **16/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Cost caps | Hard monthly limit on LLM API spend | Required |
| P0 | Token limits | Max tokens per request and per user per day | Required |
| P0 | Usage monitoring | Real-time LLM usage dashboard with alerts | Required |
| P1 | Request coalescing | Deduplicate similar processing requests | Recommended |
| P1 | Billing alerts | Multiple thresholds: 50%, 75%, 90%, 100% | Required |
| P2 | Pre-processing | Extract text locally before LLM to reduce tokens | Recommended |
| P2 | Alternative models | Fallback to cheaper models for simple extractions | Optional |

---

#### Threat: D-004 - Resource Exhaustion via Complex PDFs

| Attribute | Details |
|-----------|---------|
| **Description** | PDFs with complex structures (nested objects, loops) exhaust parser resources |
| **Affected Components** | PDF parser, Processing workers, Memory |
| **Attack Vector** | Crafted PDFs designed to trigger parser vulnerabilities |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Requires some PDF crafting knowledge |
| Impact | 3/5 | Worker crashes, queue backup, service degradation |
| **Risk Score** | **9/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Parser sandboxing | Run PDF parsing in resource-constrained containers | Required |
| P0 | Timeout enforcement | Max 60 seconds per PDF parsing attempt | Required |
| P0 | Memory limits | Container memory limits with OOM protection | Required |
| P1 | PDF validation | Pre-scan PDF structure before deep parsing | Recommended |
| P1 | Worker isolation | Separate worker pool for PDF parsing | Recommended |

---

### 5.6 ELEVATION OF PRIVILEGE (Authorization)

> **Definition:** Gaining unauthorized access levels

#### Threat: E-001 - Vertical Escalation (User to Admin)

| Attribute | Details |
|-----------|---------|
| **Description** | Regular user gains administrative privileges |
| **Affected Components** | RBAC system, Admin endpoints, Authentication middleware |
| **Attack Vector** | Parameter tampering, JWT claim manipulation, direct endpoint access |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 2/5 | Requires application vulnerability |
| Impact | 5/5 | Full system compromise |
| **Risk Score** | **10/25 - MEDIUM** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Server-side RBAC | Role verification on every request; never trust client | Required |
| P0 | Admin endpoint isolation | Separate domain/path for admin; additional auth layer | Required |
| P0 | JWT scope validation | Verify role claims against allowed operations | Required |
| P1 | Admin action logging | All admin actions logged and alerted | Required |
| P1 | Permission testing | Automated tests for authorization bypass | Required |

---

#### Threat: E-002 - Horizontal Escalation (Access Other Users' Data)

| Attribute | Details |
|-----------|---------|
| **Description** | User A accesses User B's bank statements and data |
| **Affected Components** | API authorization, Data access layer, ID validation |
| **Attack Vector** | IDOR (Insecure Direct Object Reference), parameter tampering |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | IDOR is common vulnerability; financial incentive |
| Impact | 5/5 | Complete data breach for affected users |
| **Risk Score** | **15/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Ownership verification | Verify resource belongs to requesting user on every access | Required |
| P0 | UUID for identifiers | Use non-sequential UUIDs for all resources | Required |
| P0 | Row-level security | PostgreSQL RLS enforces access at database level | Required |
| P0 | Scope-based access | JWT contains accessible resource list | Required |
| P1 | Automated testing | IDOR vulnerability scanning in CI/CD | Required |
| P1 | Access anomaly detection | Alert on unusual data access patterns | Recommended |

---

#### Threat: E-003 - Firm-Level Escalation (Access Other Firms' Clients)

| Attribute | Details |
|-----------|---------|
| **Description** | Firm A accesses Firm B's client data through the client portal |
| **Affected Components** | Firm portal, Multi-tenant data model, Client isolation |
| **Attack Vector** | IDOR with firm_id parameter, JWT scope manipulation |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Multi-tenant systems have inherent isolation risks |
| Impact | 5/5 | Cross-firm data breach; regulatory catastrophe |
| **Risk Score** | **15/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Firm isolation | Hard tenant separation at data layer | Required |
| P0 | Firm-scoped tokens | JWT includes firm_id; verified on every request | Required |
| P0 | Database-level isolation | Separate schemas or RLS policies per firm | Required |
| P1 | Cross-firm access audit | Log and alert on any cross-firm data access attempt | Required |
| P1 | Tenant validation middleware | Centralized tenant verification on all routes | Required |

---

#### Threat: E-004 - LLM Context Contamination (Cross-User Data Leakage)

| Attribute | Details |
|-----------|---------|
| **Description** | LLM retains context between requests, potentially leaking one user's data to another |
| **Affected Components** | Moonshot AI integration, Session management |

**Risk Assessment:**

| Factor | Score | Rationale |
|--------|-------|-----------|
| Likelihood | 3/5 | Depends on LLM provider implementation |
| Impact | 5/5 | Cross-user data exposure via AI responses |
| **Risk Score** | **15/25 - HIGH** | |

**Mitigations:**

| Priority | Control | Implementation | Status |
|----------|---------|---------------|--------|
| P0 | Stateless requests | Fresh API call for each PDF; no conversation history | Required |
| P0 | Response validation | Verify output contains only data from submitted PDF | Required |
| P0 | Data minimization | Send only necessary data to LLM; no metadata | Required |
| P1 | Output sanitization | Post-process LLM output to remove unexpected content | Required |
| P2 | Provider audit | Verify Moonshot AI's data isolation commitments | Required |

---

## 6. Attack Trees

### 6.1 Attack Tree: Unauthorized Bank Statement Access

```
[GOAL: Access Another User's Bank Statements]
                    |
    +---------------+---------------+------------------+
    |               |               |                  |
[Authentication  [Application    [Database        [Infrastructure]
 Bypass]          Vulnerability]   Compromise]      Compromise]
    |               |               |                  |
    |       +-------+-------+       |                  |
    |       |               |       |                  |
[Credential  [Session    [IDOR    [SQL        [Server    [Insider]
 Stuffing]   Hijacking]   Attack]  Injection]  Exploit]  Access]
    |           |           |       |          |          |
    |           |           |       |          |          |
[MFA          [XSS       [UUID    [ORM       [CVE      [Stolen
 Bypass]      Theft]      Guess]   Bypass]    Exploit]  Credentials]
    |           |           |       |          |          |
    |           |           |       |          |          |
[Social      [Malware    [Brute   [Union    [Priv      [Bribed
 Engineering] Injection]  Force]   Query]    Esc]      Employee]
```

**Critical Paths (highest probability):**
1. IDOR Attack (UUID guessing) -> MEDIUM difficulty, HIGH impact
2. Session Hijacking via XSS -> MEDIUM difficulty, HIGH impact
3. SQL Injection (if ORM bypassed) -> LOW difficulty, CRITICAL impact

### 6.2 Attack Tree: LLM Data Exfiltration

```
[GOAL: Extract Sensitive Data via LLM Integration]
                    |
    +---------------+---------------+
    |                               |
[Prompt Injection]           [API Abuse]
    |                               |
    |                   +-----------+-----------+
    |                   |                       |
[Direct           [Indirect           [Cost        [Data
 Injection]        Injection]          Bombing]     Harvesting]
    |                   |                       |           |
    |                   |                       |           |
[Manipulate      [Crafted PDF       [Maximize   [Batch
 System          Content Tricks    Tokens per   Upload +
 Prompt]         LLM]               Request]     Extract]
    |                   |                       |           |
    |                   |                       |           |
[Jailbreak       [Context           [Recursive  [Resell
 to Ignore       Confusion          PDFs]       Extracted
 Instructions]   Attack]                        Data]
```

**Critical Paths:**
1. Indirect Injection via Crafted PDF -> MEDIUM difficulty, HIGH impact
2. Data Harvesting (batch upload + extract) -> LOW difficulty, MEDIUM impact

### 6.3 Attack Tree: Service Takeover

```
[GOAL: Take Over Statementwise.ai Service]
                    |
    +---------------+---------------+---------------+
    |               |               |               |
[Cloud Account   [Application    [Supply Chain  [Insider]
 Takeover]       RCE]             Attack]        Threat]
    |               |               |               |
    |       +-------+-------+       |               |
    |       |               |       |               |
[Stolen     [Dependency  [File      [Compromised [Malicious
 AWS Keys]   Vuln RCE]   Upload     Dependency]   Employee]
            |            RCE]
            |               |       |               |
        [Deserial  [Image      [Typosquat   [Credential
        ization]   Tragician]   ing]         Abuse]
```

---

## 7. Risk Scoring Matrix

### 7.1 Risk Heat Map

```
Impact
  5  |  M   H   H   C   C
     |  S-004  S-001  I-001  E-002  E-003
  4  |  L   M   H   H   C
     |  T-003  I-003  T-002  D-003  I-002
  3  |  L   M   M   H   H
     |  D-004  R-001  I-004  S-002  D-001
  2  |  L   L   M   M   H
     |  ---  T-004  S-003  T-001  R-002
  1  |  L   L   L   M   M
     |  ---  ---  I-005  ---  ---
     +---------------------------
       1    2    3    4    5
                 Likelihood

Legend: L=Low, M=Medium, H=High, C=Critical
```

### 7.2 Consolidated Risk Register

| Rank | Threat ID | Category | Description | Likelihood | Impact | Score | Priority |
|------|-----------|----------|-------------|------------|--------|-------|----------|
| 1 | S-001 | Spoofing | Credential stuffing account takeover | 4 | 5 | 20 | CRITICAL |
| 2 | D-003 | DoS | LLM API cost bombing | 4 | 4 | 16 | HIGH |
| 3 | S-002 | Spoofing | Session hijacking | 3 | 5 | 15 | HIGH |
| 4 | I-001 | Info Disclosure | Bank statement data breach | 3 | 5 | 15 | HIGH |
| 5 | E-002 | Elevation | Horizontal escalation (IDOR) | 3 | 5 | 15 | HIGH |
| 6 | E-003 | Elevation | Firm-level escalation | 3 | 5 | 15 | HIGH |
| 7 | I-006 | Info Disclosure | LLM prompt injection data exfil | 3 | 5 | 15 | HIGH |
| 8 | E-004 | Elevation | LLM context contamination | 3 | 5 | 15 | HIGH |
| 9 | T-002 | Tampering | Transaction data modification | 3 | 4 | 12 | HIGH |
| 10 | I-002 | Info Disclosure | API key exposure | 3 | 4 | 12 | HIGH |
| 11 | I-003 | Info Disclosure | Log file leakage | 3 | 4 | 12 | HIGH |
| 12 | I-005 | Info Disclosure | Error message info leak | 4 | 3 | 12 | HIGH |
| 13 | D-001 | DoS | Upload flooding | 4 | 3 | 12 | HIGH |
| 14 | D-002 | DoS | API rate limit exhaustion | 4 | 3 | 12 | HIGH |
| 15 | R-002 | Repudiation | Firm denies data access | 3 | 4 | 12 | HIGH |
| 16 | T-001 | Tampering | MitM on API traffic | 2 | 5 | 10 | MEDIUM |
| 17 | T-004 | Tampering | Audit log tampering | 2 | 5 | 10 | MEDIUM |
| 18 | S-003 | Spoofing | JWT token theft/replay | 2 | 5 | 10 | MEDIUM |
| 19 | S-004 | Spoofing | Admin impersonation | 2 | 5 | 10 | MEDIUM |
| 20 | E-001 | Elevation | Vertical escalation | 2 | 5 | 10 | MEDIUM |
| 21 | T-003 | Tampering | Uploaded file tampering | 2 | 4 | 8 | MEDIUM |
| 22 | R-003 | Repudiation | Admin denies config changes | 2 | 4 | 8 | MEDIUM |
| 23 | R-001 | Repudiation | User denies upload | 3 | 3 | 9 | MEDIUM |
| 24 | D-004 | DoS | Resource exhaustion via PDF | 3 | 3 | 9 | MEDIUM |
| 25 | I-004 | Info Disclosure | Side-channel timing | 2 | 3 | 6 | LOW |

---

## 8. Threat Register

### 8.1 Active Threats Summary

| Threat ID | STRIDE Category | Status | Owner | Target Date |
|-----------|----------------|--------|-------|-------------|
| S-001 | Spoofing | In Progress | Security Team | 2025-02-15 |
| S-002 | Spoofing | In Progress | Security Team | 2025-02-15 |
| S-003 | Spoofing | Planned | Security Team | 2025-03-01 |
| S-004 | Spoofing | Planned | Security Team | 2025-03-15 |
| T-001 | Tampering | Implemented | Platform Team | 2025-01-15 |
| T-002 | Tampering | In Progress | Engineering | 2025-02-01 |
| T-003 | Tampering | Planned | Engineering | 2025-03-01 |
| T-004 | Tampering | Planned | Platform Team | 2025-02-15 |
| R-001 | Repudiation | In Progress | Engineering | 2025-02-01 |
| R-002 | Repudiation | Planned | Engineering | 2025-03-01 |
| R-003 | Repudiation | Planned | Platform Team | 2025-03-15 |
| I-001 | Information Disclosure | In Progress | Security Team | 2025-02-01 |
| I-002 | Information Disclosure | In Progress | Platform Team | 2025-02-01 |
| I-003 | Information Disclosure | In Progress | Engineering | 2025-02-01 |
| I-004 | Information Disclosure | Planned | Engineering | 2025-04-01 |
| I-005 | Information Disclosure | In Progress | Engineering | 2025-01-30 |
| I-006 | Information Disclosure | In Progress | Engineering | 2025-02-15 |
| D-001 | Denial of Service | Implemented | Platform Team | 2025-01-15 |
| D-002 | Denial of Service | Implemented | Platform Team | 2025-01-15 |
| D-003 | Denial of Service | In Progress | Engineering | 2025-02-01 |
| D-004 | Denial of Service | Planned | Engineering | 2025-03-01 |
| E-001 | Elevation of Privilege | In Progress | Security Team | 2025-02-15 |
| E-002 | Elevation of Privilege | In Progress | Engineering | 2025-02-01 |
| E-003 | Elevation of Privilege | In Progress | Engineering | 2025-02-01 |
| E-004 | Elevation of Privilege | Planned | Engineering | 2025-02-15 |

---

## 9. Mitigation Implementation Roadmap

### 9.1 Phase 1: Critical (Weeks 1-4)

| Week | Mitigation | Threats Addressed | Effort |
|------|-----------|-------------------|--------|
| 1 | TLS 1.3 enforcement + HSTS | T-001, I-001 | 2 days |
| 1 | Rate limiting (login + upload) | S-001, D-001, D-002 | 3 days |
| 2 | Row-level security in PostgreSQL | E-002, E-003, I-001 | 5 days |
| 2 | JWT HttpOnly cookies + short expiry | S-002, S-003 | 3 days |
| 3 | Input validation + parameterized queries | T-002, I-001 | 4 days |
| 3 | File size limits + storage quotas | D-001, D-003 | 2 days |
| 4 | Secrets Manager migration | I-002 | 3 days |
| 4 | Log sanitization (PII redaction) | I-003 | 4 days |

### 9.2 Phase 2: High Priority (Weeks 5-8)

| Week | Mitigation | Threats Addressed | Effort |
|------|-----------|-------------------|--------|
| 5 | MFA implementation | S-001, S-004 | 5 days |
| 5 | IDOR automated testing | E-002, E-003 | 3 days |
| 6 | Immutable audit logs | R-001, R-002, R-003, T-004 | 4 days |
| 6 | LLM prompt hardening | I-006, E-004 | 4 days |
| 7 | WAF rules + DDoS protection | D-002 | 3 days |
| 7 | Cost caps + LLM monitoring | D-003 | 3 days |
| 8 | Admin portal isolation | S-004, E-001 | 4 days |
| 8 | Data integrity hashes | T-002, R-001 | 3 days |

### 9.3 Phase 3: Medium Priority (Weeks 9-12)

| Week | Mitigation | Threats Addressed | Effort |
|------|-----------|-------------------|--------|
| 9-10 | Device fingerprinting + anomaly detection | S-001, S-002, E-002 | 5 days |
| 10 | Side-channel protections | I-004 | 3 days |
| 11 | Advanced error handling | I-005 | 2 days |
| 11 | PDF sandboxing | D-004 | 4 days |
| 12 | Comprehensive security testing | All | 5 days |

### 9.4 Phase 4: Continuous Improvement (Ongoing)

- Monthly vulnerability scans
- Quarterly penetration testing
- Quarterly threat model review
- Continuous security monitoring and alerting
- Annual third-party security audit
- Ongoing security awareness training

---

## 10. Appendices

### Appendix A: References

| Document | Reference |
|----------|-----------|
| STRIDE Reference | Microsoft Threat Modeling Tool documentation |
| OWASP Top 10 2021 | https://owasp.org/Top10/ |
| OWASP Testing Guide | OWASP Testing Guide v4.2 |
| NIST Cybersecurity Framework | NIST SP 800-53 Rev 5 |
| GDPR Security Requirements | GDPR Articles 25, 32, 33 |
| PCI DSS v4.0 | PCI DSS Requirements 1-12 |

### Appendix B: Glossary

| Term | Definition |
|------|------------|
| DFD | Data Flow Diagram |
| IDOR | Insecure Direct Object Reference |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| MFA | Multi-Factor Authentication |
| MitM | Man-in-the-Middle |
| RBAC | Role-Based Access Control |
| RLS | Row-Level Security |
| RCE | Remote Code Execution |
| SIEM | Security Information and Event Management |
| SSE | Server-Side Encryption |
| TLS | Transport Layer Security |
| TDE | Transparent Data Encryption |
| WAF | Web Application Firewall |

### Appendix C: Change Log

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2025-01-15 | 1.0 | Security Team | Initial threat model creation |

---

**END OF DOCUMENT**
