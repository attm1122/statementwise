# Statementwise.ai - SOC 2 Type II Readiness Assessment

**Document Version:** 1.0  
**Date:** 2025-01-15  
**Classification:** CONFIDENTIAL - INTERNAL USE ONLY  
**Owner:** Chief Information Security Officer (CISO)  
**Assessment Framework:** AICPA Trust Service Criteria (TSC) 2017  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Security (CC6.1 - CC6.8)](#2-security-cc61---cc68)
3. [Availability (A1.1 - A1.3)](#3-availability-a11---a13)
4. [Processing Integrity (PI1.1 - PI1.5)](#4-processing-integrity-pi11---pi15)
5. [Confidentiality (CC7.1 - CC7.5)](#5-confidentiality-cc71---cc75)
6. [Privacy (P1.1 - P1.7)](#6-privacy-p11---p17)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Appendices](#8-appendices)

---

## 1. Executive Summary

### 1.1 Assessment Overview

This document presents a comprehensive readiness assessment of Statementwise.ai against the AICPA Trust Services Criteria (TSC) for SOC 2 Type II reporting. The assessment evaluates controls across five Trust Service Categories: Security, Availability, Processing Integrity, Confidentiality, and Privacy.

### 1.2 Assessment Summary

| Trust Service Category | Controls Assessed | Implemented | Partial | Not Started | Readiness % |
|----------------------|------------------|-------------|---------|-------------|-------------|
| Security (CC6.1-CC6.8) | 24 | 12 | 8 | 4 | 58% |
| Availability (A1.1-A1.3) | 15 | 8 | 4 | 3 | 67% |
| Processing Integrity (PI1.1-PI1.5) | 15 | 7 | 5 | 3 | 63% |
| Confidentiality (CC7.1-CC7.5) | 15 | 8 | 5 | 2 | 70% |
| Privacy (P1.1-P1.7) | 21 | 9 | 7 | 5 | 60% |
| **TOTAL** | **90** | **44** | **29** | **17** | **63%** |

### 1.3 Readiness Status

```
Overall Readiness: ████████████████████░░░░░░ 63%

Security:           ███████████████░░░░░░░░░░░ 58%  [12/24 Implemented]
Availability:       ████████████████░░░░░░░░░░ 67%  [8/15 Implemented]
Processing Integrity:███████████████░░░░░░░░░░░ 63%  [7/15 Implemented]
Confidentiality:    █████████████████░░░░░░░░░ 70%  [8/15 Implemented]
Privacy:            ██████████████░░░░░░░░░░░░ 60%  [9/21 Implemented]
```

### 1.4 Key Gaps

1. **Multi-Factor Authentication (MFA)** - Not yet implemented for all users (CC6.1, CC6.2)
2. **Penetration Testing** - No third-party penetration test completed (CC6.6)
3. **Formal Vendor Risk Management** - Process not documented for all vendors (CC9.2)
4. **Disaster Recovery Testing** - No formal DR test completed (A1.2)
5. **Privacy Notice** - Legal review of privacy policy pending (P1.1)
6. **Data Retention Policy** - Automated enforcement not implemented (P1.4)
7. **Output Reconciliation** - Automated balance reconciliation not yet built (PI1.3)

### 1.5 Recommended Path to SOC 2 Type II

| Phase | Duration | Focus | Target Readiness |
|-------|----------|-------|------------------|
| Phase 1: Foundation | Months 1-2 | Security, Access Controls, Monitoring | 75% |
| Phase 2: Process Maturity | Months 3-4 | Privacy, Processing Integrity, Documentation | 85% |
| Phase 3: Validation | Months 5-6 | Testing, Audit Prep, Gap Remediation | 95% |
| Observation Period | Months 7-12 | Control operation evidence collection | 100% |

---

## 2. Security (CC6.1 - CC6.8)

### 2.1 CC6.1 - Logical and Physical Access Controls

> **Criterion:** The entity implements logical access security measures to protect against threats from sources outside or inside the system, including logical access control measures that restrict access to authorized users, and identify and authenticate users before granting access.

#### CC6.1.1 - Access Control Implementation

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Unique user accounts for all system access | **Implemented** | PostgreSQL user table with unique identifiers, AWS IAM users | No gap |
| Role-based access control (RBAC) | **Implemented** | roles table with firm_admin, firm_user, admin, user roles | No gap |
| Principle of least privilege | **Partial** | IAM policies follow least privilege; application-level needs review | Application-level permissions need audit |
| Segregation of duties | **Partial** | Separate roles for admin vs regular users; need formal SoD matrix | Create formal SoD matrix |
| Automated access provisioning/de-provisioning | **Partial** | Manual de-provisioning via admin panel; no automated offboarding | Implement automated offboarding workflow |

#### CC6.1.2 - Authentication Mechanisms

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Password complexity requirements | **Implemented** | Min 12 chars, mixed case, numbers, special chars, common password check | No gap |
| Password history enforcement | **Implemented** | Last 12 passwords cannot be reused | No gap |
| Account lockout after failed attempts | **Implemented** | Lock after 5 failed attempts, 15-min cooldown | No gap |
| Session timeout | **Implemented** | 15-min access token, 7-day refresh token | No gap |
| Multi-factor authentication | **Not Started** | Planned for Q1 2025 | **CRITICAL GAP** - Implement MFA for all admin accounts |
| Single Sign-On (SSO) | **Not Started** | Planned for Q2 2025 | Support SAML 2.0 / OIDC for firm clients |
| Password manager integration | **Not Started** | Not planned | Consider for enhanced security |

#### CC6.1.3 - Authorization Framework

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Scope-based access control | **Implemented** | JWT claims include firm_id, user_id, role | No gap |
| Resource-level authorization | **Implemented** | Ownership verification on every data access | No gap |
| API endpoint authorization | **Implemented** | FastAPI dependency injection for auth checks | No gap |
| Firm isolation | **Implemented** | Database RLS policies enforce firm boundaries | No gap |
| Admin action approval | **Partial** | Admin panel exists; no dual approval for sensitive actions | Implement dual approval for admin actions |

**Overall CC6.1 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 7/12 |
| Priority | HIGH |
| Target Date | 2025-03-15 |

---

### 2.2 CC6.2 - Prior to Accessing System

> **Criterion:** Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.

#### CC6.2.1 - User Registration

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Identity verification for new users | **Implemented** | Email verification required | No gap |
| Identity verification for firms | **Partial** | Email verification; no business verification | Implement business entity verification for firms |
| Background checks for employees | **Implemented** | Conducted for all hires | No gap |
| Access request approval workflow | **Partial** | Self-registration for users; admin approval for firms | Formal access request workflow for firm accounts |
| Guest/external access management | **Not Started** | No external user access currently | Define and implement guest access policy |
| Re-verification of identity | **Not Started** | Not implemented | Implement periodic identity re-verification |

**Overall CC6.2 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 3/6 |
| Priority | MEDIUM |
| Target Date | 2025-04-01 |

---

### 2.3 CC6.3 - Access Removal

> **Criterion:** The entity modifies access credentials and removes access when internal and external users are terminated or change roles.

#### CC6.3.1 - Access De-provisioning

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Immediate access revocation on termination | **Implemented** | Admin can disable accounts immediately | No gap |
| Automated access removal | **Not Started** | Manual process only | Implement automated offboarding via HR system integration |
| Access review process | **Partial** | Quarterly manual review planned | Implement quarterly automated access review |
| Removal of shared accounts | **Implemented** | No shared accounts exist | No gap |
| Disabled account retention | **Implemented** | Accounts disabled (not deleted) for audit trail | No gap |

**Overall CC6.3 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 3/5 |
| Priority | MEDIUM |
| Target Date | 2025-04-15 |

---

### 2.4 CC6.4 - Access Reviews

> **Criterion:** The entity reviews access to system components on a periodic basis for compliance with standards.

#### CC6.4.1 - Periodic Access Reviews

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Quarterly access reviews | **Not Started** | Not yet implemented | **CRITICAL GAP** - Implement quarterly reviews |
| Manager attestation of access | **Not Started** | Process not defined | Define manager review and attestation process |
| Excessive access identification | **Partial** | RBAC roles defined; no automated detection | Implement excessive access detection |
| Access review documentation | **Not Started** | No templates or tools | Create access review documentation templates |
| Privileged access reviews | **Not Started** | No formal admin access review | Implement monthly admin access reviews |
| Service account reviews | **Partial** | AWS IAM access analyzer enabled; no formal review | Quarterly service account review |

**Overall CC6.4 Status: NOT STARTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 1/6 |
| Priority | HIGH |
| Target Date | 2025-03-01 |

---

### 2.5 CC6.5 - Physical Access

> **Criterion:** The entity restricts physical access to system components to authorized individuals.

#### CC6.5.1 - Physical Security

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Cloud-based infrastructure | **N/A** | AWS managed; no on-premise data centers | AWS shared responsibility model applies |
| AWS data center physical security | **Implemented** | AWS SOC 2 Type II certified | Rely on AWS certifications |
| Employee device security | **Partial** | MDM not implemented | Implement MDM for all company devices |
| Remote work security | **Partial** | VPN required for admin; optional for others | VPN required for all admin access |

**Overall CC6.5 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 2/4 (1 N/A) |
| Priority | LOW |
| Target Date | 2025-06-01 |

---

### 2.6 CC6.6 - Security Infrastructure

> **Criterion:** The entity implements security infrastructure and software to protect against threats and vulnerabilities.

#### CC6.6.1 - Security Infrastructure

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Web Application Firewall (WAF) | **Implemented** | AWS WAF with managed rule sets | No gap |
| DDoS protection | **Implemented** | AWS Shield Standard | Consider Shield Advanced for enhanced protection |
| Intrusion detection/prevention | **Partial** | AWS GuardDuty enabled; no custom rules | Develop custom GuardDuty rules |
| Vulnerability scanning | **Partial** | Dependabot for dependencies; no infrastructure scanning | Implement infrastructure vulnerability scanning |
| Penetration testing | **Not Started** | No third-party pentest completed | **CRITICAL GAP** - Schedule annual pentest |
| Endpoint protection | **Not Started** | Not applicable for cloud-only | EDR for any company laptops |
| Security patch management | **Partial** | Automated OS patching; app patching manual | Implement automated container image updates |
| SIEM implementation | **Partial** | CloudWatch Logs; no formal SIEM | Evaluate Splunk/Datadog Security for SIEM |

#### CC6.6.2 - Vulnerability Management

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Vulnerability management policy | **Implemented** | Vulnerability management policy documented | No gap |
| Scanning frequency | **Partial** | Weekly dependency scans; monthly infrastructure scans | Increase infrastructure scanning to weekly |
| Remediation SLA | **Implemented** | Critical: 24h, High: 7d, Medium: 30d, Low: 90d | No gap |
| Vulnerability tracking | **Implemented** | Jira tickets for all findings | No gap |
| Zero-day response procedure | **Implemented** | Documented emergency patching procedure | No gap |

**Overall CC6.6 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 6/10 |
| Priority | HIGH |
| Target Date | 2025-04-01 |

---

### 2.7 CC6.7 - Security Incident Detection

> **Criterion:** The entity implements detection activities to identify security events that could threaten the entity's achievement of its security objectives.

#### CC6.7.1 - Security Monitoring

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Log aggregation | **Implemented** | CloudWatch Logs centralized | No gap |
| Real-time alerting | **Implemented** | PagerDuty integration for critical alerts | No gap |
| Security event correlation | **Partial** | Basic CloudWatch alarms; no correlation rules | Implement correlation rules |
| Anomaly detection | **Partial** | Basic thresholds; no ML-based detection | Implement UBA (User Behavior Analytics) |
| Intrusion detection | **Implemented** | AWS GuardDuty with findings | No gap |
| File integrity monitoring | **Not Started** | Not implemented | Implement FIM for critical files |
| Log tampering protection | **Implemented** | S3 Object Lock for audit logs | No gap |

**Overall CC6.7 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 5/7 |
| Priority | HIGH |
| Target Date | 2025-04-01 |

---

### 2.8 CC6.8 - Security Incident Response

> **Criterion:** The entity implements activities to respond to security incidents and to mitigate the impact of security incidents.

#### CC6.8.1 - Incident Response Capability

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Incident response plan | **Implemented** | INCIDENT_RESPONSE.md documented | No gap |
| IR team defined | **Implemented** | Roles and responsibilities documented | No gap |
| IR communication channels | **Implemented** | Multiple channels defined (Slack, PagerDuty, Signal) | No gap |
| Escalation procedures | **Implemented** | Defined in incident response plan | No gap |
| Forensics capability | **Partial** | Tool inventory defined; no certified forensics expert | Engage external forensics retainer |
| Tabletop exercises | **Not Started** | Not yet conducted | **CRITICAL GAP** - Conduct quarterly tabletop exercises |
| Incident documentation | **Implemented** | Post-mortem template and tracking system | No gap |
| Breach notification procedures | **Implemented** | GDPR 72-hour procedures documented | No gap |
| Cyber insurance | **Partial** | Policy being evaluated | Finalize cyber insurance policy |

**Overall CC6.8 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 7/9 |
| Priority | HIGH |
| Target Date | 2025-03-01 |

---

## 3. Availability (A1.1 - A1.3)

### 3.1 A1.1 - System Availability

> **Criterion:** The entity maintains, monitors, and evaluates system processing integrity and availability.

#### A1.1.1 - Availability Monitoring

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Uptime monitoring | **Implemented** | UptimeRobot + CloudWatch | No gap |
| Availability SLA tracking | **Implemented** | 99.9% uptime target tracked | No gap |
| Performance monitoring | **Implemented** | Datadog/CloudWatch metrics | No gap |
| Synthetic transaction monitoring | **Partial** | Basic health checks; no full transaction simulation | Implement end-to-end synthetic transactions |
| Capacity monitoring | **Implemented** | CloudWatch auto-scaling metrics | No gap |
| Alerting thresholds | **Implemented** | Defined for CPU, memory, disk, errors | No gap |

#### A1.1.2 - System Performance

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Auto-scaling configured | **Implemented** | ECS auto-scaling on CPU/memory | No gap |
| Load balancing | **Implemented** | ALB with health checks | No gap |
| CDN for static assets | **Implemented** | CloudFront distribution | No gap |
| Database performance optimization | **Implemented** | RDS performance insights, query optimization | No gap |
| Caching layer | **Implemented** | Redis for session and data caching | No gap |
| Queue-based processing | **Implemented** | SQS for async job processing | No gap |

**Overall A1.1 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 10/11 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

### 3.2 A1.2 - Disaster Recovery

> **Criterion:** The entity has established and documented recovery point objectives and recovery time objectives.

#### A1.2.1 - Disaster Recovery Planning

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Disaster recovery plan documented | **Implemented** | DR plan documented and accessible | No gap |
| Recovery Time Objective (RTO) | **Implemented** | RTO: 4 hours for critical services | No gap |
| Recovery Point Objective (RPO) | **Implemented** | RPO: 1 hour for database, 0 for S3 | No gap |
| DR site established | **Implemented** | Multi-AZ deployment + cross-region S3 replication | No gap |
| DR test conducted | **Not Started** | No DR test performed | **CRITICAL GAP** - Conduct DR test |
| DR runbook | **Implemented** | Step-by-step recovery procedures documented | No gap |
| Failover procedures tested | **Partial** | Auto-failover for RDS Multi-AZ; manual for application | Test application-level failover |
| Backup restoration tested | **Implemented** | Monthly backup restoration testing | No gap |

**Overall A1.2 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 6/8 |
| Priority | HIGH |
| Target Date | 2025-03-15 |

---

### 3.3 A1.3 - Backup Procedures

> **Criterion:** The entity performs backup and recovery procedures to maintain system availability.

#### A1.3.1 - Backup Implementation

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Automated database backups | **Implemented** | RDS automated daily backups + PITR | No gap |
| Cross-region backup replication | **Implemented** | S3 cross-region replication for critical data | No gap |
| Backup encryption | **Implemented** | AES-256 encryption for all backups | No gap |
| Backup retention policy | **Implemented** | 35 days for RDS, 7 years for audit data | No gap |
| Backup integrity verification | **Implemented** | Monthly checksum verification | No gap |
| Backup restoration testing | **Implemented** | Monthly restoration drills | No gap |
| S3 versioning enabled | **Implemented** | Object versioning for all buckets | No gap |
| Configuration backup | **Implemented** | Terraform state in Terraform Cloud | No gap |
| Off-site/air-gapped backups | **Not Started** | Consider for critical data | Evaluate air-gapped backup solution |

**Overall A1.3 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 8/9 |
| Priority | LOW |
| Target Date | 2025-06-01 |

---

## 4. Processing Integrity (PI1.1 - PI1.5)

### 4.1 PI1.1 - Entity Uses Authorized Products

> **Criterion:** The entity uses only authorized software that is consistent with the entity's defined system requirements.

#### PI1.1.1 - Software Governance

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Approved software list | **Implemented** | Documented list of approved packages and versions | No gap |
| Dependency management | **Implemented** | poetry.lock + package pinning | No gap |
| Vulnerability scanning for dependencies | **Implemented** | Dependabot + Snyk scanning | No gap |
| License compliance | **Implemented** | FOSSA license scanning | No gap |
| Third-party code review | **Partial** | Security review for major dependencies | Formal review process for new dependencies |

**Overall PI1.1 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 4/5 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

### 4.2 PI1.2 - Data Validation

> **Criterion:** The entity implements procedures to validate the completeness and accuracy of data inputs.

#### PI1.2.1 - Input Validation

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Input validation on all API endpoints | **Implemented** | Pydantic models for request validation | No gap |
| File type validation | **Implemented** | PDF magic number + MIME type validation | No gap |
| File size validation | **Implemented** | 25MB maximum enforced | No gap |
| Content validation | **Implemented** | PDF structure validation before processing | No gap |
| Schema validation on LLM output | **Partial** | JSON schema validation; need stricter validation | Implement stricter output validation |
| Cross-field validation | **Partial** | Basic validation; need transaction-level validation | Implement cross-field validation rules |
| Input sanitization | **Implemented** | DOMPurify for frontend, backend sanitization | No gap |

**Overall PI1.2 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 6/7 |
| Priority | MEDIUM |
| Target Date | 2025-03-15 |

---

### 4.3 PI1.3 - Processing Completeness and Accuracy

> **Criterion:** The entity implements procedures to ensure processing is complete, accurate, timely, and authorized.

#### PI1.3.1 - Processing Controls

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Balance reconciliation | **Not Started** | Not implemented | **CRITICAL GAP** - Implement automated balance reconciliation |
| Transaction count verification | **Partial** | Manual verification; no automated check | Automated transaction count validation |
| Duplicate detection | **Implemented** | File hash deduplication | No gap |
| Processing audit trail | **Implemented** | Every processing step logged | No gap |
| Error handling | **Implemented** | Structured error handling with retry logic | No gap |
| Dead letter queue | **Implemented** | Failed jobs captured for review | No gap |
| Processing timeout enforcement | **Implemented** | 60-second timeout on LLM calls | No gap |

#### PI1.3.2 - Output Accuracy

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Output format validation | **Implemented** | JSON schema validation on extracted data | No gap |
| Amount validation | **Partial** | Type validation; no business rule validation | Implement amount range validation |
| Date validation | **Implemented** | Date format and range validation | No gap |
| Opening/closing balance check | **Not Started** | Not implemented | **CRITICAL GAP** - Implement balance validation |
| Manual review process | **Partial** | User can review; no formal QC process | Implement optional QC workflow |
| Accuracy metrics tracking | **Not Started** | No accuracy KPIs defined | Define and track extraction accuracy |

**Overall PI1.3 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 5/11 |
| Priority | HIGH |
| Target Date | 2025-03-01 |

---

### 4.4 PI1.4 - Error Handling

> **Criterion:** The entity implements procedures to handle processing errors.

#### PI1.4.1 - Error Management

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Error logging | **Implemented** | Structured error logging with context | No gap |
| Error alerting | **Implemented** | PagerDuty alerts for processing errors | No gap |
| Automatic retry logic | **Implemented** | Exponential backoff for transient failures | No gap |
| Dead letter queue | **Implemented** | Failed jobs queued for manual review | No gap |
| User notification of errors | **Implemented** | In-app and email notifications | No gap |
| Error classification | **Implemented** | Categorized: validation, processing, LLM, system | No gap |
| Error trend analysis | **Partial** | Basic dashboards; no automated trend detection | Implement automated error trend alerting |

**Overall PI1.4 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 6/7 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

### 4.5 PI1.5 - Output Delivery

> **Criterion:** The entity implements procedures to ensure outputs are complete, accurate, and distributed only to authorized parties.

#### PI1.5.1 - Output Controls

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Export format validation | **Implemented** | Export templates validated before generation | No gap |
| Data completeness check | **Partial** | User-visible row count; no automated completeness check | Implement automated completeness verification |
| Authorized delivery only | **Implemented** | Authentication required for all exports | No gap |
| Export audit logging | **Implemented** | Every export logged with user, timestamp, format | No gap |
| Export encryption | **Implemented** | Password-protected Excel exports available | No gap |
| Delivery confirmation | **Partial** | Download initiated tracking; no read receipt | Consider delivery confirmation for email exports |

**Overall PI1.5 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 5/6 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

## 5. Confidentiality (CC7.1 - CC7.5)

### 5.1 CC7.1 - Data Classification

> **Criterion:** The entity identifies and maintains confidential information to meet the entity's objectives related to confidentiality.

#### CC7.1.1 - Classification Scheme

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Data classification policy | **Implemented** | 4-tier classification: Public, Internal, Confidential, Highly Confidential | No gap |
| Classification of bank statements | **Implemented** | Classified as "Highly Confidential" | No gap |
| Classification of transaction data | **Implemented** | Classified as "Highly Confidential" | No gap |
| Classification of user credentials | **Implemented** | Classified as "Confidential" | No gap |
| Classification of API keys | **Implemented** | Classified as "Confidential" | No gap |
| Classification of logs | **Implemented** | Classified as "Confidential" | No gap |
| Classification labels in code | **Partial** | Documented; not enforced in code | Implement classification tags in data models |
| User data classification | **Implemented** | PII classified per GDPR requirements | No gap |

**Overall CC7.1 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 7/8 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

### 5.2 CC7.2 - Access Restrictions

> **Criterion:** The entity restricts access to confidential information based on the entity's data classification policies.

#### CC7.2.1 - Access Control Implementation

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Access based on need-to-know | **Implemented** | RBAC with firm and user isolation | No gap |
| Row-level security | **Implemented** | PostgreSQL RLS policies | No gap |
| Encryption key access control | **Implemented** | KMS key policies with least privilege | No gap |
| Log access restrictions | **Implemented** | IAM policies restrict log access | No gap |
| API access restrictions | **Implemented** | Scope-based API authorization | No gap |
| Database access network restrictions | **Implemented** | RDS in private subnet, no public access | No gap |
| S3 bucket policies | **Implemented** | Least privilege bucket policies | No gap |
| Third-party access restrictions | **Partial** | Moonshot AI API key scoped; need formal review | Formalize third-party access review |

**Overall CC7.2 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 7/8 |
| Priority | LOW |
| Target Date | 2025-04-01 |

---

### 5.3 CC7.3 - Encryption Standards

> **Criterion:** The entity encrypts confidential information during transmission and when stored.

#### CC7.3.1 - Encryption in Transit

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| TLS 1.3 for all communications | **Implemented** | ALB configured for TLS 1.3 only | No gap |
| HSTS enabled | **Implemented** | max-age=31536000, includeSubDomains, preload | No gap |
| Certificate management | **Implemented** | ACM with automatic renewal | No gap |
| Internal service mTLS | **Partial** | HTTPS between services; mTLS not yet implemented | Implement mTLS for internal communications |
| API key security | **Implemented** | API keys transmitted via headers, never in URL | No gap |

#### CC7.3.2 - Encryption at Rest

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Database encryption (TDE) | **Implemented** | RDS storage encryption with KMS | No gap |
| S3 object encryption | **Implemented** | SSE-S3 with AES-256 | No gap |
| Backup encryption | **Implemented** | Encrypted RDS snapshots | No gap |
| Key management | **Implemented** | AWS KMS with automatic key rotation | No gap |
| Application-level encryption | **Partial** | JWT signing; no field-level encryption | Evaluate field-level encryption for most sensitive data |
| Secrets encryption | **Implemented** | AWS Secrets Manager with encryption | No gap |

**Overall CC7.3 Status: IMPLEMENTED**

| Metric | Value |
|--------|-------|
| Controls Implemented | 8/10 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

### 5.4 CC7.4 - Data Disposal

> **Criterion:** The entity disposes of confidential information in accordance with documented policies and procedures.

#### CC7.4.1 - Data Disposal Procedures

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Data retention policy | **Implemented** | Retention schedule documented | No gap |
| Secure deletion procedures | **Implemented** | S3 delete + overwrite, DB secure wipe | No gap |
| Media sanitization | **Implemented** | AWS managed; EBS volumes zeroed on release | No gap |
| Disposal audit trail | **Implemented** | All deletions logged | No gap |
| Account deletion (GDPR right to erasure) | **Implemented** | Automated account deletion workflow | No gap |
| Automated retention enforcement | **Not Started** | Manual process | **CRITICAL GAP** - Implement automated retention policy enforcement |
| Certificate/key disposal | **Implemented** | KMS key deletion with waiting period | No gap |

**Overall CC7.4 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 6/7 |
| Priority | HIGH |
| Target Date | 2025-03-15 |

---

### 5.5 CC7.5 - Confidentiality Agreements

> **Criterion:** The entity enters into confidentiality agreements with personnel and third parties who have access to confidential information.

#### CC7.5.1 - Agreements

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Employee NDAs | **Implemented** | All employees sign NDA | No gap |
| Contractor agreements | **Implemented** | Contractor agreements with confidentiality clauses | No gap |
| Vendor confidentiality agreements | **Partial** | Standard terms; need explicit DPAs | Execute Data Processing Agreements with all vendors |
| Third-party confidentiality verification | **Not Started** | No formal verification process | Implement vendor confidentiality verification |
| Agreement tracking | **Partial** | HR tracks employee agreements; vendor tracking needs improvement | Centralize all confidentiality agreements |

**Overall CC7.5 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 3/5 |
| Priority | MEDIUM |
| Target Date | 2025-04-01 |

---

## 6. Privacy (P1.1 - P1.7)

### 6.1 P1.1 - Notice and Consent

> **Criterion:** The entity provides notice about data collection, use, retention, and disclosure practices, and obtains consent when required.

#### P1.1.1 - Privacy Notice

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Privacy policy published | **Implemented** | Privacy policy on website | No gap |
| Privacy policy covers all processing | **Partial** | Basic coverage; need LLM processing specifics | Update to cover AI/LLM data processing |
| Privacy policy covers third-party sharing | **Partial** | Mentions third parties; need Moonshot AI specifics | Update to cover Moonshot AI data sharing |
| Consent collection for data processing | **Implemented** | Consent checkbox on registration | No gap |
| Consent for marketing communications | **Implemented** | Separate opt-in for marketing | No gap |
| Cookie consent | **Implemented** | Cookie consent banner implemented | No gap |
| Legal review of privacy policy | **Not Started** | Not reviewed by legal counsel | **CRITICAL GAP** - Legal review required |
| Privacy policy update notification | **Implemented** | Email notification for material changes | No gap |
| Granular consent options | **Not Started** | All-or-nothing consent | Implement granular consent for different processing purposes |

**Overall P1.1 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 5/9 |
| Priority | HIGH |
| Target Date | 2025-02-15 |

---

### 6.2 P1.2 - Data Minimization

> **Criterion:** The entity limits the collection of personal information to that which is relevant and necessary.

#### P1.2.1 - Data Collection Limits

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Minimum data collection | **Implemented** | Only collect necessary data for service | No gap |
| Optional data clearly marked | **Implemented** | Profile fields marked as optional | No gap |
| Purpose specification | **Implemented** | Data use purposes documented | No gap |
| Data sent to LLM is minimized | **Partial** | Full PDF sent to Moonshot AI; explore local preprocessing | Implement pre-processing to minimize data sent to LLM |
| Third-party data sharing minimized | **Partial** | Moonshot AI receives full content; evaluate alternatives | Evaluate data minimization for LLM API calls |
| Regular data collection review | **Not Started** | No periodic review | Implement annual data collection review |

**Overall P1.2 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 4/6 |
| Priority | MEDIUM |
| Target Date | 2025-04-01 |

---

### 6.3 P1.3 - Data Retention

> **Criterion:** The entity retains personal information for only as long as necessary.

#### P1.3.1 - Retention Management

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Retention policy documented | **Implemented** | Retention schedule in privacy policy | No gap |
| Retention periods defined | **Implemented** | Raw PDFs: 30 days post-processing, Extracted data: 7 years, Audit logs: 7 years | No gap |
| User-configurable retention | **Partial** | Default retention; no user customization | Allow users to configure shorter retention |
| Automated deletion | **Not Started** | No automated enforcement | **CRITICAL GAP** - Implement automated retention enforcement |
| Retention for legal holds | **Implemented** | Legal hold capability documented | No gap |
| Post-account-deletion retention | **Implemented** | 30-day grace period, then full deletion | No gap |
| Retention audit trail | **Implemented** | All deletions logged | No gap |

**Overall P1.3 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 5/7 |
| Priority | HIGH |
| Target Date | 2025-03-15 |

---

### 6.4 P1.4 - Data Access

> **Criterion:** The entity provides data subjects with access to their personal information.

#### P1.4.1 - Data Subject Rights

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Right to access (GDPR Article 15) | **Implemented** | User can view all their data in app | No gap |
| Data export capability | **Implemented** | Export all user data (CSV/JSON) | No gap |
| Right to rectification | **Partial** | User can edit profile; transaction data requires support | Implement transaction data correction workflow |
| Right to erasure (GDPR Article 17) | **Implemented** | Self-service account deletion | No gap |
| Right to restriction of processing | **Partial** | No processing pause option | Implement processing restriction capability |
| Right to data portability | **Implemented** | Export in machine-readable formats | No gap |
| DSR response SLA | **Implemented** | 30-day response for all DSRs | No gap |
| DSR tracking system | **Implemented** | Jira tickets for all DSRs | No gap |

**Overall P1.4 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 6/8 |
| Priority | MEDIUM |
| Target Date | 2025-04-15 |

---

### 6.5 P1.5 - Disclosure to Third Parties

> **Criterion:** The entity limits the disclosure of personal information to third parties.

#### P1.5.1 - Third-Party Data Sharing

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Third-party disclosure inventory | **Implemented** | Documented list of all third-party recipients | No gap |
| Data Processing Agreements (DPAs) | **Partial** | Moonshot AI DPA in progress; others need review | Execute DPAs with all processors |
| SCCs for international transfers | **Partial** | Need for Moonshot AI (China) | Execute Standard Contractual Clauses |
| Third-party access logging | **Implemented** | All API calls to third parties logged | No gap |
| Sub-processor notification | **Implemented** | Sub-processors listed in privacy policy | No gap |
| Third-party security assessment | **Partial** | Informal assessment; no formal program | Implement formal third-party risk assessment |
| Transfer Impact Assessment | **Not Started** | Not completed for Moonshot AI (China) | **CRITICAL GAP** - Complete TIA for China transfers |

**Overall P1.5 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 4/7 |
| Priority | HIGH |
| Target Date | 2025-03-01 |

---

### 6.6 P1.6 - Data Quality

> **Criterion:** The entity maintains accurate, complete, and relevant personal information.

#### P1.6.1 - Data Quality Controls

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Data validation at collection | **Implemented** | Email validation, format validation | No gap |
| User ability to update data | **Implemented** | Self-service profile editing | No gap |
| Data accuracy monitoring | **Not Started** | No formal monitoring | Implement data quality monitoring |
| Correction procedures | **Partial** | Profile corrections automated; transaction data requires support | Implement transaction correction workflow |
| Data source verification | **Partial** | PDF as source of truth; no external validation | Consider external validation for critical data |

**Overall P1.6 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 3/5 |
| Priority | LOW |
| Target Date | 2025-05-01 |

---

### 6.7 P1.7 - Monitoring and Enforcement

> **Criterion:** The entity monitors compliance with privacy policies and procedures and has procedures to address privacy-related inquiries, complaints, and disputes.

#### P1.7.1 - Privacy Program Governance

| Item | Status | Evidence | Gap Analysis |
|------|--------|----------|-------------|
| Privacy officer designated | **Implemented** | DPO designated (for GDPR compliance) | No gap |
| Privacy training for staff | **Not Started** | No formal privacy training | Implement annual privacy training |
| Privacy complaint handling | **Implemented** | privacy@statementwise.ai with response SLA | No gap |
| Privacy incident response | **Implemented** | Incident response plan covers privacy incidents | No gap |
| Regular privacy assessments | **Not Started** | No regular privacy impact assessments | Implement annual privacy assessments |
| Privacy by design | **Partial** | Considered in architecture; not formalized | Formalize privacy by design process |
| Cookie compliance monitoring | **Implemented** | Cookie consent management in place | No gap |
| Privacy policy compliance monitoring | **Not Started** | No automated compliance checking | Implement privacy compliance monitoring |
| Cross-border transfer monitoring | **Not Started** | Monitor Moonshot AI transfers | Implement transfer monitoring |

**Overall P1.7 Status: PARTIAL**

| Metric | Value |
|--------|-------|
| Controls Implemented | 4/9 |
| Priority | HIGH |
| Target Date | 2025-04-01 |

---

## 7. Implementation Roadmap

### 7.1 Phase 1: Foundation (Months 1-2)

| Week | Criterion | Action | Owner | Effort |
|------|-----------|--------|-------|--------|
| 1 | CC6.1 | Implement MFA for all admin accounts | Security | 5 days |
| 1 | CC6.4 | Design access review process and templates | Security | 3 days |
| 2 | CC6.4 | Implement quarterly access review workflow | Security | 5 days |
| 2 | P1.1 | Legal review of privacy policy | Legal | 5 days |
| 3 | P1.5 | Execute DPA with Moonshot AI | Legal | 3 days |
| 3 | P1.5 | Complete Transfer Impact Assessment for China | Security | 5 days |
| 4 | PI1.3 | Implement automated balance reconciliation | Engineering | 8 days |
| 4 | PI1.3 | Implement opening/closing balance validation | Engineering | 5 days |
| 5 | A1.2 | Conduct disaster recovery test | Platform | 5 days |
| 5 | CC6.8 | Conduct first tabletop exercise | Security | 3 days |
| 6 | CC7.4 | Implement automated retention policy enforcement | Engineering | 8 days |
| 6 | P1.3 | Configure automated data deletion jobs | Engineering | 5 days |
| 7 | CC6.6 | Schedule and scope annual penetration test | Security | 3 days |
| 7 | P1.5 | Execute Standard Contractual Clauses | Legal | 3 days |
| 8 | Multiple | Document all new controls and evidence | Security | 5 days |

**Phase 1 Target: 80% overall readiness**

### 7.2 Phase 2: Process Maturity (Months 3-4)

| Week | Criterion | Action | Owner | Effort |
|------|-----------|--------|-------|--------|
| 9 | CC6.1 | Implement SSO (SAML 2.0/OIDC) for firms | Engineering | 10 days |
| 10 | CC6.2 | Implement formal access request workflow | Security | 5 days |
| 10 | CC6.3 | Integrate HR system for automated offboarding | Engineering | 5 days |
| 11 | CC6.6 | Complete annual penetration test | External | 10 days |
| 11 | CC6.6 | Implement infrastructure vulnerability scanning | Security | 5 days |
| 12 | CC6.7 | Implement file integrity monitoring | Security | 5 days |
| 12 | P1.1 | Implement granular consent options | Engineering | 5 days |
| 13 | P1.2 | Implement LLM data pre-processing minimization | Engineering | 8 days |
| 14 | P1.4 | Implement transaction data correction workflow | Engineering | 5 days |
| 14 | P1.7 | Implement privacy training program | HR/Security | 5 days |
| 15 | CC6.5 | Implement MDM for company devices | Security | 5 days |
| 16 | Multiple | Conduct second tabletop exercise | Security | 3 days |

**Phase 2 Target: 90% overall readiness**

### 7.3 Phase 3: Validation (Months 5-6)

| Week | Criterion | Action | Owner | Effort |
|------|-----------|--------|-------|--------|
| 17 | Multiple | Conduct internal audit of all controls | Security | 10 days |
| 18 | Multiple | Remediate internal audit findings | Engineering | 10 days |
| 19 | Multiple | Conduct mock SOC 2 audit | External | 5 days |
| 20 | Multiple | Remediate mock audit findings | Engineering | 10 days |
| 21 | Multiple | Finalize all documentation and evidence | Security | 5 days |
| 22 | Multiple | Select and engage SOC 2 auditor | Security | 5 days |
| 23 | Multiple | Prepare for Type II observation period | Security | 5 days |
| 24 | Multiple | Begin Type II observation period | All | Ongoing |

**Phase 3 Target: 95% overall readiness**

### 7.4 Observation Period (Months 7-12)

During the 6-month observation period:
- Operate all controls consistently
- Collect evidence of control operation
- Conduct monthly control self-assessments
- Address any control deficiencies immediately
- Prepare for auditor site visit

---

## 8. Appendices

### Appendix A: Control Status Summary Matrix

| Criterion | Description | Status | Priority | Target Date |
|-----------|-------------|--------|----------|-------------|
| CC6.1 | Logical Access Controls | Partial | HIGH | 2025-03-15 |
| CC6.2 | Prior to Accessing | Partial | MEDIUM | 2025-04-01 |
| CC6.3 | Access Removal | Partial | MEDIUM | 2025-04-15 |
| CC6.4 | Access Reviews | Not Started | HIGH | 2025-03-01 |
| CC6.5 | Physical Access | Partial | LOW | 2025-06-01 |
| CC6.6 | Security Infrastructure | Partial | HIGH | 2025-04-01 |
| CC6.7 | Security Detection | Partial | HIGH | 2025-04-01 |
| CC6.8 | Incident Response | Partial | HIGH | 2025-03-01 |
| A1.1 | System Availability | Implemented | LOW | 2025-05-01 |
| A1.2 | Disaster Recovery | Partial | HIGH | 2025-03-15 |
| A1.3 | Backup Procedures | Implemented | LOW | 2025-06-01 |
| PI1.1 | Authorized Products | Implemented | LOW | 2025-05-01 |
| PI1.2 | Data Validation | Partial | MEDIUM | 2025-03-15 |
| PI1.3 | Processing Completeness | Partial | HIGH | 2025-03-01 |
| PI1.4 | Error Handling | Implemented | LOW | 2025-05-01 |
| PI1.5 | Output Delivery | Implemented | LOW | 2025-05-01 |
| CC7.1 | Data Classification | Implemented | LOW | 2025-05-01 |
| CC7.2 | Access Restrictions | Implemented | LOW | 2025-04-01 |
| CC7.3 | Encryption Standards | Implemented | LOW | 2025-05-01 |
| CC7.4 | Data Disposal | Partial | HIGH | 2025-03-15 |
| CC7.5 | Confidentiality Agreements | Partial | MEDIUM | 2025-04-01 |
| P1.1 | Notice and Consent | Partial | HIGH | 2025-02-15 |
| P1.2 | Data Minimization | Partial | MEDIUM | 2025-04-01 |
| P1.3 | Data Retention | Partial | HIGH | 2025-03-15 |
| P1.4 | Data Access | Partial | MEDIUM | 2025-04-15 |
| P1.5 | Third-Party Disclosure | Partial | HIGH | 2025-03-01 |
| P1.6 | Data Quality | Partial | LOW | 2025-05-01 |
| P1.7 | Monitoring/Enforcement | Partial | HIGH | 2025-04-01 |

### Appendix B: Evidence Collection Guide

| Control | Evidence Type | Collection Method | Storage Location |
|---------|--------------|-------------------|-----------------|
| Access Controls | IAM policy screenshots | Monthly export | S3 compliance/ |
| Authentication | MFA enrollment report | Weekly export | S3 compliance/ |
| Encryption | TLS configuration scan | Weekly scan | S3 compliance/ |
| Backups | Backup verification report | Monthly test | S3 compliance/ |
| Vulnerability | Scan results | Weekly scan | S3 compliance/ |
| Incident | Post-mortem reports | Post-incident | S3 compliance/ |
| Access Reviews | Review documentation | Quarterly | S3 compliance/ |
| Privacy DSRs | Request and response log | Per request | S3 compliance/ |
| Training | Completion certificates | Annual | S3 compliance/ |
| Penetration Test | Assessment report | Annual | S3 compliance/ |

### Appendix C: Gap Remediation Tracking

| Gap ID | Description | Risk | Criterion | Owner | Target Date | Status |
|--------|-------------|------|-----------|-------|-------------|--------|
| GAP-001 | MFA not implemented for all users | HIGH | CC6.1 | Security | 2025-03-15 | Open |
| GAP-002 | No quarterly access reviews | HIGH | CC6.4 | Security | 2025-03-01 | Open |
| GAP-003 | No disaster recovery test | HIGH | A1.2 | Platform | 2025-03-15 | Open |
| GAP-004 | No automated balance reconciliation | HIGH | PI1.3 | Engineering | 2025-03-01 | Open |
| GAP-005 | No automated retention enforcement | HIGH | CC7.4, P1.3 | Engineering | 2025-03-15 | Open |
| GAP-006 | Privacy policy not legally reviewed | HIGH | P1.1 | Legal | 2025-02-15 | Open |
| GAP-007 | No DPA with Moonshot AI | HIGH | P1.5 | Legal | 2025-03-01 | Open |
| GAP-008 | No Transfer Impact Assessment | HIGH | P1.5 | Security | 2025-03-01 | Open |
| GAP-009 | No tabletop exercises | HIGH | CC6.8 | Security | 2025-03-01 | Open |
| GAP-010 | No penetration test | HIGH | CC6.6 | Security | 2025-04-01 | Open |
| GAP-011 | Privacy training not implemented | MEDIUM | P1.7 | HR/Security | 2025-04-01 | Open |
| GAP-012 | Granular consent not implemented | MEDIUM | P1.1 | Engineering | 2025-04-01 | Open |
| GAP-013 | Data quality monitoring not implemented | LOW | P1.6 | Engineering | 2025-05-01 | Open |

---

**END OF DOCUMENT**
