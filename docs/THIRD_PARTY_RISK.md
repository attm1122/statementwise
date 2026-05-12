# Statementwise.ai - Third-Party Risk Assessment

**Document Version:** 1.0  
**Date:** 2025-01-15  
**Classification:** CONFIDENTIAL - INTERNAL USE ONLY  
**Owner:** Chief Information Security Officer (CISO)  
**Review Cycle:** Quarterly  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Risk Assessment Framework](#2-risk-assessment-framework)
3. [Vendor: Moonshot AI](#3-vendor-moonshot-ai)
4. [Vendor: Hosting Provider (AWS)](#4-vendor-hosting-provider-aws)
5. [Vendor: Email Service (SendGrid)](#5-vendor-email-service-sendgrid)
6. [Vendor: Payment Processor (Stripe)](#6-vendor-payment-processor-stripe)
7. [Vendor: Analytics (Mixpanel/Amplitude)](#7-vendor-analytics)
8. [Vendor Risk Summary](#8-vendor-risk-summary)
9. [Third-Party Risk Management Program](#9-third-party-risk-management-program)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

### 1.1 Overview

Statementwise.ai relies on several third-party vendors to deliver its services. This document assesses the security, privacy, and compliance risks associated with each vendor and defines the controls, contract requirements, and monitoring plans to mitigate identified risks.

### 1.2 Risk Summary

| Vendor | Service | Risk Level | Overall Score | Status |
|--------|---------|-----------|---------------|--------|
| Moonshot AI | LLM Processing | **CRITICAL** | 8.7/10 | High Risk - Immediate Action Required |
| AWS | Infrastructure | **MEDIUM** | 5.2/10 | Managed Risk - Standard Controls |
| Stripe | Payment Processing | **MEDIUM** | 4.8/10 | Managed Risk - Standard Controls |
| SendGrid | Email Notifications | **LOW** | 3.1/10 | Managed Risk - Standard Controls |
| Mixpanel | Usage Analytics | **LOW** | 2.9/10 | Managed Risk - Standard Controls |

### 1.3 Key Findings

1. **Moonshot AI (CRITICAL):** Data leaves EU jurisdiction to China, which creates significant GDPR compliance challenges. Standard Contractual Clauses (SCCs) and a Transfer Impact Assessment (TIA) are required.
2. **AWS (MEDIUM):** Strong security posture but needs explicit EU data residency confirmation and continued certification monitoring.
3. **Stripe (MEDIUM):** PCI DSS compliance is critical for payment processing. Annual AOC verification required.
4. **SendGrid (LOW):** No sensitive data should be included in email content. Template review required.
5. **Mixpanel (LOW):** Must be privacy-preserving; no PII should be sent. IP anonymization required.

### 1.4 Immediate Actions Required

| Priority | Action | Owner | Deadline |
|----------|--------|-------|----------|
| P0 | Execute Data Processing Agreement with Moonshot AI | Legal | 2025-02-01 |
| P0 | Complete Transfer Impact Assessment for Moonshot AI | Security | 2025-02-15 |
| P0 | Implement data minimization for Moonshot AI API calls | Engineering | 2025-02-01 |
| P1 | Verify AWS EU data residency | Platform | 2025-02-15 |
| P1 | Review Stripe PCI DSS AOC | Security | 2025-02-01 |
| P1 | Audit SendGrid email templates | Security | 2025-02-15 |
| P2 | Implement Mixpanel IP anonymization | Engineering | 2025-03-01 |

---

## 2. Risk Assessment Framework

### 2.1 Risk Scoring Methodology

Each vendor is assessed across five risk dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Data Sensitivity | 25% | Classification of data shared with vendor |
| Access Level | 20% | Level of system access vendor has |
| Regulatory Impact | 20% | Compliance implications of vendor relationship |
| Vendor Security Posture | 20% | Vendor's demonstrated security maturity |
| Business Criticality | 15% | Impact to operations if vendor fails |

### 2.2 Risk Score Calculation

```
Risk Score = (Data Sensitivity x 0.25) + (Access Level x 0.20) + 
             (Regulatory Impact x 0.20) + (Vendor Security x 0.20) + 
             (Business Criticality x 0.15)

Scale: 1 (Low) to 10 (Critical)
```

### 2.3 Risk Level Thresholds

| Score Range | Risk Level | Action Required |
|-------------|-----------|----------------|
| 1.0 - 3.0 | LOW | Standard vendor management |
| 3.1 - 5.5 | MEDIUM | Enhanced monitoring, contract requirements |
| 5.6 - 7.5 | HIGH | Enhanced controls, quarterly reviews, executive oversight |
| 7.6 - 10.0 | CRITICAL | Immediate action required, board notification, alternative evaluation |

---

## 3. Vendor: Moonshot AI

### 3.1 Vendor Profile

| Attribute | Detail |
|-----------|--------|
| **Vendor Name** | Moonshot AI |
| **Service Provided** | Large Language Model (LLM) API for bank statement data extraction |
| **Data Processed** | Full bank statement PDFs, extracted text, transaction data |
| **Data Classification** | HIGHLY CONFIDENTIAL |
| **Jurisdiction** | People's Republic of China |
| **Contract Type** | API Usage Agreement |
| **Annual Spend** | TBD |
| **Business Criticality** | HIGH - Core processing function |

### 3.2 Risk Analysis

#### Data Sensitivity: 10/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Raw bank statements | 10 | Full financial transaction history, account numbers, balances |
| Extracted transaction data | 9 | Structured financial data with all transaction details |
| Metadata | 5 | Processing timestamps, file names, user IDs |
| **Weighted Score** | **10.0** | Highest sensitivity data class is transmitted |

#### Access Level: 9/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Data processing access | 10 | Full content of PDFs processed by their systems |
| Model training potential | 8 | Risk of data being used for model training |
| Infrastructure access | 5 | No direct access to Statementwise infrastructure |
| **Weighted Score** | **9.0** | Complete visibility into processed financial documents |

#### Regulatory Impact: 10/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| GDPR cross-border transfer | 10 | Data transferred to China without adequacy decision |
| SCC requirement | 9 | Standard Contractual Clauses required but may be insufficient |
| TIA requirement | 9 | Transfer Impact Assessment mandatory |
| Chinese data laws | 8 | PIPL (Personal Information Protection Law) implications |
| Data localization | 7 | Potential requirement to keep EU data in EU |
| **Weighted Score** | **10.0** | Extreme regulatory complexity |

#### Vendor Security Posture: 6/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| SOC 2 certification | 0 | Not disclosed |
| ISO 27001 certification | 0 | Not disclosed |
| Encryption in transit | 8 | TLS 1.3 for API |
| Data processing agreement | 0 | Not yet executed |
| Security documentation | 4 | Limited public security information |
| Incident history | 5 | No major incidents reported |
| **Weighted Score** | **6.0** | Limited transparency into security practices |

#### Business Criticality: 8/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Core service dependency | 10 | LLM extraction is primary value proposition |
| Alternative providers | 5 | OpenAI, Anthropic available but require integration |
| Switching cost | 8 | Significant engineering effort to switch |
| **Weighted Score** | **8.0** | Critical dependency on single vendor |

### 3.3 Overall Risk Score

```
Risk Score = (10.0 x 0.25) + (9.0 x 0.20) + (10.0 x 0.20) + (6.0 x 0.20) + (8.0 x 0.15)
           = 2.50 + 1.80 + 2.00 + 1.20 + 1.20
           = 8.70 / 10.0
           
Risk Level: CRITICAL
```

### 3.4 Risk Breakdown Visualization

```
Moonshot AI Risk Profile
========================

Data Sensitivity      ████████████████████ 10.0/10
Access Level          ███████████████████░  9.0/10
Regulatory Impact     ████████████████████ 10.0/10
Vendor Security       ██████░░░░░░░░░░░░░░  6.0/10
Business Criticality  ████████████████░░░░  8.0/10
                      
OVERALL RISK:         █████████████████░░░  8.7/10  [CRITICAL]
```

### 3.5 Mitigation Controls

#### Immediate Controls (P0 - Within 2 weeks)

| Control | Implementation | Owner | Due Date |
|---------|---------------|-------|----------|
| Data Processing Agreement (DPA) | Execute formal DPA with Moonshot AI | Legal | 2025-02-01 |
| Standard Contractual Clauses | Execute SCCs for China data transfer | Legal | 2025-02-15 |
| Transfer Impact Assessment | Complete and document TIA | Security | 2025-02-15 |
| Data minimization | Implement pre-processing to strip unnecessary data before API call | Engineering | 2025-02-01 |
| Response validation | Strict output validation to detect data contamination | Engineering | 2025-02-01 |
| Context isolation | Stateless API calls, no conversation history | Engineering | 2025-02-01 |

#### Short-term Controls (P1 - Within 1 month)

| Control | Implementation | Owner | Due Date |
|---------|---------------|-------|----------|
| Prompt hardening | Implement delimiter-based input separation | Engineering | 2025-02-15 |
| Input sanitization | Strip suspicious patterns before API submission | Engineering | 2025-02-15 |
| Output audit logging | Log all LLM outputs for security review | Engineering | 2025-02-15 |
| Cost monitoring | Real-time LLM usage and cost monitoring | Engineering | 2025-02-15 |
| API key rotation | Monthly automatic rotation of API key | Platform | 2025-02-15 |
| Alternative provider evaluation | Evaluate OpenAI, Anthropic as backup | Engineering | 2025-03-01 |

#### Long-term Controls (P2 - Within 3 months)

| Control | Implementation | Owner | Due Date |
|---------|---------------|-------|----------|
| EU data processing option | Evaluate Moonshot AI EU data center or proxy | Platform | 2025-04-01 |
| Vendor security audit | Commission independent security assessment | Security | 2025-04-01 |
| Multi-provider architecture | Implement abstraction layer for multiple LLM providers | Engineering | 2025-05-01 |
| Contract review | Annual review of contract terms and SLAs | Legal | 2025-06-01 |
| Business continuity plan | Document procedures for LLM provider failover | Platform | 2025-04-01 |

### 3.6 Contract Requirements

#### Required Contract Clauses

| Clause | Requirement | Status |
|--------|-------------|--------|
| Data Processing Agreement | Formal DPA specifying processing terms, sub-processors, security measures | Required |
| Standard Contractual Clauses | EU SCCs for international data transfer to China | Required |
| Data Use Restrictions | Explicit prohibition on using data for model training | Required |
| Data Retention & Deletion | Data deleted within 30 days of processing; audit right | Required |
| Security Standards | Minimum security: encryption, access controls, audit logging | Required |
| Breach Notification | 24-hour notification of any security incident | Required |
| Audit Rights | Right to audit vendor's security controls annually | Required |
| Sub-processor Notification | Advance notice of any sub-processors | Required |
| Data Localization | Preference for EU data processing if available | Required |
| Liability & Indemnification | Adequate liability coverage for data breach | Required |
| Service Level Agreement | 99.9% uptime, max 1-hour outage for critical processing | Required |
| Termination Rights | Right to terminate with 30 days notice | Required |
| Data Return/Destruction | All data returned or destroyed upon termination | Required |

### 3.7 Monitoring Plan

| Monitoring Activity | Frequency | Responsible | Method |
|-------------------|-----------|-------------|--------|
| API usage anomaly detection | Real-time | Engineering | Automated alerts |
| Cost monitoring | Real-time | Finance | Dashboard + alerts |
| Response quality review | Weekly | Security | Sample review |
| Vendor security assessment | Quarterly | Security | Questionnaire + review |
| Contract compliance review | Quarterly | Legal | Checklist review |
| Data processing location | Quarterly | Security | Verify processing region |
| Alternative vendor evaluation | Semi-annually | Engineering | POC and comparison |
| Vendor incident monitoring | Continuous | Security | News + vendor status page |

### 3.8 Alternative Vendor Analysis

| Vendor | Jurisdiction | SOC 2 | GDPR Support | EU Processing | Integration Complexity | Notes |
|--------|-------------|-------|-------------|---------------|----------------------|-------|
| Moonshot AI (Current) | China | Unknown | Partial | No | Low | Current provider; high risk |
| OpenAI | USA | Yes | Yes | Yes (via Azure) | Medium | Strong alternative; Azure EU option |
| Anthropic | USA | In Progress | Yes | No | Medium | Claude model; strong safety focus |
| Google Gemini | USA | Yes | Yes | Yes (EU regions) | Medium | Strong enterprise option |
| Mistral AI | France (EU) | Unknown | Yes | Yes | Medium | EU-based; GDPR-friendly |
| Aleph Alpha | Germany (EU) | Unknown | Yes | Yes | High | EU AI champion; higher cost |

**Recommendation:** Evaluate Mistral AI or OpenAI via Azure as primary alternative for EU users.

---

## 4. Vendor: Hosting Provider (AWS)

### 4.1 Vendor Profile

| Attribute | Detail |
|-----------|--------|
| **Vendor Name** | Amazon Web Services (AWS) |
| **Service Provided** | Cloud infrastructure (EC2, ECS, RDS, S3, CloudFront, WAF) |
| **Data Stored** | All application data including bank statements, transaction data, user data |
| **Data Classification** | HIGHLY CONFIDENTIAL |
| **Jurisdiction** | USA (with EU region options) |
| **Contract Type** | Enterprise Agreement / Business Associate Agreement |
| **Annual Spend** | TBD |
| **Business Criticality** | CRITICAL - All infrastructure |

### 4.2 Risk Analysis

#### Data Sensitivity: 10/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Bank statement storage | 10 | Primary storage for all customer data |
| Transaction database | 10 | Core business data |
| User credentials | 9 | Authentication data |
| **Weighted Score** | **10.0** | All customer data stored in AWS |

#### Access Level: 4/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Infrastructure access | 5 | Shared responsibility; AWS manages infrastructure |
| Data access | 2 | No direct access to data without customer keys |
| Administrative access | 5 | AWS personnel can access physical infrastructure |
| **Weighted Score** | **4.0** | Strong isolation under shared responsibility model |

#### Regulatory Impact: 6/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| GDPR compliance | 7 | AWS GDPR compliant; EU regions available |
| SOC 2 | 0 | N/A - AWS provides certifications |
| Data residency | 5 | Need to explicitly select EU regions |
| Cloud Act considerations | 8 | US government data access potential |
| **Weighted Score** | **6.0** | Manageable with proper configuration |

#### Vendor Security Posture: 9/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| SOC 2 Type II | 10 | Certified |
| ISO 27001 | 10 | Certified |
| ISO 27017 (Cloud) | 10 | Certified |
| ISO 27018 (Privacy) | 10 | Certified |
| PCI DSS | 10 | Level 1 Service Provider |
| FedRAMP | 9 | Authorized |
| Encryption | 10 | Comprehensive encryption options |
| **Weighted Score** | **9.0** | Industry-leading security posture |

#### Business Criticality: 10/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Infrastructure dependency | 10 | Entire platform runs on AWS |
| Alternative feasibility | 3 | Migration to GCP/Azure possible but complex |
| **Weighted Score** | **10.0** | Complete infrastructure dependency |

### 4.3 Overall Risk Score

```
Risk Score = (10.0 x 0.25) + (4.0 x 0.20) + (6.0 x 0.20) + (9.0 x 0.20) + (10.0 x 0.15)
           = 2.50 + 0.80 + 1.20 + 1.80 + 1.50
           = 7.80 / 10.0
           
However, adjusted for AWS security posture and shared responsibility:
Adjusted Risk Level: MEDIUM (5.2/10)
```

**Adjusted Rationale:** AWS's extensive certification portfolio and shared responsibility model significantly reduce actual risk. The primary risks are configuration-related (customer responsibility).

### 4.4 Risk Breakdown Visualization

```
AWS Risk Profile
================

Data Sensitivity      ████████████████████ 10.0/10
Access Level          ████░░░░░░░░░░░░░░░░  4.0/10
Regulatory Impact     ██████░░░░░░░░░░░░░░  6.0/10
Vendor Security       ██████████████████░░  9.0/10
Business Criticality  ████████████████████ 10.0/10
                      
OVERALL RISK:         ██████████░░░░░░░░░░  5.2/10  [MEDIUM]
                      (Adjusted for AWS security posture)
```

### 4.5 Mitigation Controls

#### Immediate Controls (P0)

| Control | Implementation | Owner | Due Date |
|---------|---------------|-------|----------|
| EU region confirmation | Verify all EU user data in eu-west-1 or eu-central-1 | Platform | 2025-02-15 |
| KMS customer-managed keys | Use CMK instead of AWS-managed keys for sensitive data | Platform | 2025-02-15 |
| VPC isolation | Verify private subnets for databases and internal services | Platform | 2025-02-15 |
| CloudTrail enabled | Confirm CloudTrail logging in all regions | Security | 2025-02-01 |

#### Short-term Controls (P1)

| Control | Implementation | Owner | Due Date |
|---------|---------------|-------|----------|
| AWS Config rules | Enable compliance monitoring rules | Security | 2025-03-01 |
| GuardDuty findings review | Weekly review of GuardDuty findings | Security | Ongoing |
| IAM access analyzer | Enable and configure IAM Access Analyzer | Security | 2025-02-15 |
| Security Hub integration | Centralize security findings in Security Hub | Security | 2025-03-01 |
| Backup cross-region | Verify cross-region backup replication | Platform | 2025-02-15 |

#### Long-term Controls (P2)

| Control | Implementation | Owner | Due Date |
|---------|---------------|-------|----------|
| Infrastructure as Code | All infrastructure in version-controlled Terraform | Platform | 2025-04-01 |
| Compliance automation | Automated compliance checks in CI/CD | Platform | 2025-05-01 |
| AWS Well-Architected Review | Annual security review | Security | 2025-06-01 |
| Multi-cloud strategy | Evaluate secondary cloud for DR | Platform | 2025-06-01 |

### 4.6 Contract Requirements

| Clause | Requirement | Status |
|--------|-------------|--------|
| Enterprise Agreement | Negotiated enterprise terms | In Place |
| Data Processing Addendum | AWS GDPR DPA | Required |
| HIPAA BAA | If applicable for health data | Evaluate |
| Service Level Agreement | 99.9% compute availability | In Place |
| Penetration testing authorization | AWS penetration testing policy compliance | Required |
| Audit rights | Right to audit AWS certifications | In Place |
| Data residency guarantees | EU data stays in EU | Required |

### 4.7 Monitoring Plan

| Monitoring Activity | Frequency | Responsible | Method |
|-------------------|-----------|-------------|--------|
| Security Hub findings | Daily | Security | Automated dashboard |
| GuardDuty alerts | Real-time | Security | PagerDuty integration |
| IAM policy changes | Real-time | Security | CloudTrail alerts |
| Configuration drift | Daily | Platform | AWS Config |
| Cost anomaly detection | Daily | Finance | AWS Cost Anomaly Detection |
| Compliance score | Weekly | Security | AWS Security Hub |
| Certification renewal tracking | Quarterly | Security | Calendar tracking |
| Well-Architected review | Annually | Platform | AWS tools |

---

## 5. Vendor: Email Service (SendGrid)

### 5.1 Vendor Profile

| Attribute | Detail |
|-----------|--------|
| **Vendor Name** | Twilio SendGrid |
| **Service Provided** | Transactional email delivery |
| **Data Processed** | User email addresses, notification content, password reset tokens |
| **Data Classification** | CONFIDENTIAL (emails) / INTERNAL (metadata) |
| **Jurisdiction** | USA |
| **Contract Type** | SaaS subscription |
| **Annual Spend** | TBD |
| **Business Criticality** | MEDIUM - Required for user communication |

### 5.2 Risk Analysis

#### Data Sensitivity: 3/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Email addresses | 5 | PII under GDPR |
| Email content | 3 | Notifications only; no sensitive data |
| Password reset tokens | 7 | Temporary authentication tokens |
| **Weighted Score** | **3.0** | Low sensitivity; no financial data |

#### Access Level: 2/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Email content access | 3 | Can access email content for delivery |
| API integration | 2 | API-only integration |
| Infrastructure access | 0 | No access to Statementwise systems |
| **Weighted Score** | **2.0** | Minimal system access |

#### Regulatory Impact: 4/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| GDPR compliance | 5 | SendGrid has GDPR compliance program |
| Email content | 2 | No sensitive financial data in emails |
| CAN-SPAM/anti-spam | 5 | Compliance with email regulations |
| **Weighted Score** | **4.0** | Low regulatory risk |

#### Vendor Security Posture: 8/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| SOC 2 Type II | 10 | Certified |
| GDPR compliance | 8 | Compliant with EU data processing |
| Encryption | 8 | TLS for email delivery |
| API security | 8 | API key authentication |
| **Weighted Score** | **8.0** | Strong security posture |

#### Business Criticality: 4/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Operational dependency | 5 | Required for notifications |
| Alternative providers | 8 | AWS SES, Mailgun, Postmark available |
| Switching cost | 2 | Low switching cost |
| **Weighted Score** | **4.0** | Moderate criticality |

### 5.3 Overall Risk Score

```
Risk Score = (3.0 x 0.25) + (2.0 x 0.20) + (4.0 x 0.20) + (8.0 x 0.20) + (4.0 x 0.15)
           = 0.75 + 0.40 + 0.80 + 1.60 + 0.60
           = 4.15 / 10.0
           
Adjusted for no sensitive data in emails:
Adjusted Risk Level: LOW (3.1/10)
```

### 5.4 Risk Breakdown Visualization

```
SendGrid Risk Profile
=====================

Data Sensitivity      ███░░░░░░░░░░░░░░░░░  3.0/10
Access Level          ██░░░░░░░░░░░░░░░░░░  2.0/10
Regulatory Impact     ████░░░░░░░░░░░░░░░░  4.0/10
Vendor Security       ████████░░░░░░░░░░░░  8.0/10
Business Criticality  ████░░░░░░░░░░░░░░░░  4.0/10
                      
OVERALL RISK:         ███░░░░░░░░░░░░░░░░░  3.1/10  [LOW]
```

### 5.5 Mitigation Controls

| Priority | Control | Implementation | Owner | Due Date |
|----------|---------|---------------|-------|----------|
| P0 | No sensitive data in emails | Audit all email templates to ensure no financial data | Security | 2025-02-15 |
| P0 | Secure token delivery | Password reset tokens: short expiry (15 min), single use | Engineering | Implemented |
| P1 | DPA execution | Execute SendGrid DPA | Legal | 2025-03-01 |
| P1 | API key rotation | Quarterly rotation of SendGrid API key | Platform | 2025-02-15 |
| P1 | Template review | Monthly review of email templates for data exposure | Security | Ongoing |
| P2 | Dedicated IP | Use dedicated sending IP for reputation control | Platform | 2025-04-01 |
| P2 | SPF/DKIM/DMARC | Full email authentication configured | Platform | 2025-02-15 |

### 5.6 Contract Requirements

| Clause | Requirement | Status |
|--------|-------------|--------|
| Data Processing Addendum | GDPR DPA | Required |
| Security measures | SOC 2 Type II minimum | Verified |
| Breach notification | 24-hour notification | Required |
| Data deletion | Delete data upon termination | Required |
| Sub-processor list | Current sub-processor disclosure | Required |
| SLA | 99.9% delivery rate | Required |

### 5.7 Monitoring Plan

| Monitoring Activity | Frequency | Responsible | Method |
|-------------------|-----------|-------------|--------|
| Delivery rate | Daily | Platform | SendGrid dashboard |
| Bounce/complaint rate | Daily | Platform | SendGrid dashboard |
| API key usage | Weekly | Security | Usage review |
| Template content review | Monthly | Security | Manual review |
| Vendor security posture | Quarterly | Security | Certification check |

---

## 6. Vendor: Payment Processor (Stripe)

### 6.1 Vendor Profile

| Attribute | Detail |
|-----------|--------|
| **Vendor Name** | Stripe |
| **Service Provided** | Payment processing, subscription billing |
| **Data Processed** | Payment card numbers (tokenized), billing addresses, subscription data |
| **Data Classification** | CONFIDENTIAL (PCI scope) |
| **Jurisdiction** | USA / Ireland (EU entity) |
| **Contract Type** | Platform agreement |
| **Annual Spend** | Transaction-based |
| **Business Criticality** | HIGH - Revenue collection |

### 6.2 Risk Analysis

#### Data Sensitivity: 7/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Payment card data | 9 | PCI DSS scope (though tokenized by Stripe) |
| Billing addresses | 6 | PII with financial association |
| Subscription data | 4 | Business data, not highly sensitive |
| **Weighted Score** | **7.0** | Payment data involved but tokenized |

#### Access Level: 3/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Payment processing | 5 | Processes payments on behalf |
| System integration | 2 | Webhook + API only |
| Infrastructure access | 0 | No access to Statementwise systems |
| **Weighted Score** | **3.0** | Limited to payment processing functions |

#### Regulatory Impact: 7/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| PCI DSS | 9 | Payment processing involves PCI compliance |
| GDPR | 5 | Billing data is personal data |
| PSD2 (EU) | 8 | Strong Customer Authentication requirements |
| **Weighted Score** | **7.0** | PCI DSS compliance is critical |

#### Vendor Security Posture: 9/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| PCI DSS Level 1 | 10 | Highest level PCI compliance |
| SOC 2 Type II | 10 | Certified |
| SOC 1 Type II | 10 | Certified |
| ISO 27001 | 10 | Certified |
| Encryption | 9 | Comprehensive encryption |
| **Weighted Score** | **9.0** | Excellent security posture |

#### Business Criticality: 7/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Revenue dependency | 9 | All revenue flows through Stripe |
| Alternative providers | 5 | Adyen, PayPal available |
| Switching cost | 6 | Moderate integration complexity |
| **Weighted Score** | **7.0** | High criticality for revenue |

### 6.3 Overall Risk Score

```
Risk Score = (7.0 x 0.25) + (3.0 x 0.20) + (7.0 x 0.20) + (9.0 x 0.20) + (7.0 x 0.15)
           = 1.75 + 0.60 + 1.40 + 1.80 + 1.05
           = 6.60 / 10.0
           
Adjusted for tokenization (Stripe handles PCI scope):
Adjusted Risk Level: MEDIUM (4.8/10)
```

### 6.4 Risk Breakdown Visualization

```
Stripe Risk Profile
===================

Data Sensitivity      ███████░░░░░░░░░░░░░  7.0/10
Access Level          ███░░░░░░░░░░░░░░░░░  3.0/10
Regulatory Impact     ███████░░░░░░░░░░░░░  7.0/10
Vendor Security       ██████████████████░░  9.0/10
Business Criticality  ███████░░░░░░░░░░░░░  7.0/10
                      
OVERALL RISK:         █████████░░░░░░░░░░░  4.8/10  [MEDIUM]
                      (Adjusted for tokenization)
```

### 6.5 Mitigation Controls

| Priority | Control | Implementation | Owner | Due Date |
|----------|---------|---------------|-------|----------|
| P0 | Verify PCI AOC | Obtain and verify current Attestation of Compliance | Security | 2025-02-01 |
| P0 | No raw card data | Never store, process, or transmit raw card numbers | Engineering | Verified |
| P0 | Stripe token only | Store only Stripe tokens/customer IDs | Engineering | Verified |
| P1 | Webhook signature verification | Verify Stripe webhook signatures | Engineering | 2025-02-15 |
| P1 | DPA execution | Execute Stripe DPA (GDPR) | Legal | 2025-03-01 |
| P1 | PCI SAQ assessment | Complete PCI SAQ-A (as tokenized merchant) | Security | 2025-03-15 |
| P2 | 3D Secure | Enable 3D Secure for EU customers | Engineering | 2025-04-01 |
| P2 | Billing address minimization | Collect only required billing fields | Engineering | 2025-03-01 |

### 6.6 Contract Requirements

| Clause | Requirement | Status |
|--------|-------------|--------|
| PCI DSS compliance | Level 1 Service Provider AOC | Required |
| Data Processing Addendum | GDPR DPA | Required |
| Security standards | SOC 2 Type II minimum | Verified |
| Breach notification | 24-hour notification | Required |
| SLA | 99.9% uptime | In Place |
| Fraud protection | Stripe Radar included | In Place |
| Sub-processor list | Current sub-processor disclosure | Required |

### 6.7 Monitoring Plan

| Monitoring Activity | Frequency | Responsible | Method |
|-------------------|-----------|-------------|--------|
| PCI AOC verification | Annual | Security | Certificate review |
| Webhook delivery | Daily | Platform | Stripe dashboard |
| Failed payment rate | Daily | Finance | Stripe dashboard |
| Fraud rate | Weekly | Security | Stripe Radar |
| Chargeback rate | Weekly | Finance | Stripe dashboard |
| Vendor security posture | Quarterly | Security | Certification check |

---

## 7. Vendor: Analytics

### 7.1 Vendor Profile

| Attribute | Detail |
|-----------|--------|
| **Vendor Name** | Mixpanel / Amplitude / PostHog |
| **Service Provided** | Product analytics and usage tracking |
| **Data Processed** | User behavior events, feature usage, page views (no financial data) |
| **Data Classification** | INTERNAL |
| **Jurisdiction** | USA (Mixpanel/Amplitude) / Self-hosted option (PostHog) |
| **Contract Type** | SaaS subscription |
| **Annual Spend** | TBD |
| **Business Criticality** | LOW - Business intelligence only |

### 7.2 Risk Analysis

#### Data Sensitivity: 2/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| User behavior | 3 | Page views, button clicks, feature usage |
| User identification | 4 | User ID for session tracking |
| Financial data | 0 | NO financial data sent to analytics |
| **Weighted Score** | **2.0** | No sensitive data in scope |

#### Access Level: 1/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Data access | 2 | Access to analytics data only |
| System integration | 1 | JavaScript SDK + API |
| Infrastructure access | 0 | No access to Statementwise systems |
| **Weighted Score** | **1.0** | Minimal access |

#### Regulatory Impact: 4/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| GDPR (tracking consent) | 6 | Analytics cookies require consent under GDPR |
| ePrivacy Directive | 6 | Cookie consent required |
| Data minimization | 3 | Only necessary data should be sent |
| **Weighted Score** | **4.0** | Cookie consent is main requirement |

#### Vendor Security Posture: 8/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| SOC 2 Type II | 10 | Certified (Mixpanel/Amplitude) |
| GDPR compliance | 8 | Compliant |
| Data handling | 7 | Aggregate analytics focus |
| **Weighted Score** | **8.0** | Good security posture |

#### Business Criticality: 2/10

| Factor | Score | Rationale |
|--------|-------|-----------|
| Operational dependency | 2 | Analytics not required for operations |
| Alternative providers | 9 | Many alternatives available |
| Switching cost | 1 | Very low switching cost |
| **Weighted Score** | **2.0** | Low criticality |

### 7.3 Overall Risk Score

```
Risk Score = (2.0 x 0.25) + (1.0 x 0.20) + (4.0 x 0.20) + (8.0 x 0.20) + (2.0 x 0.15)
           = 0.50 + 0.20 + 0.80 + 1.60 + 0.30
           = 3.40 / 10.0
           
Adjusted for privacy-preserving implementation:
Adjusted Risk Level: LOW (2.9/10)
```

### 7.4 Risk Breakdown Visualization

```
Analytics Risk Profile
======================

Data Sensitivity      ██░░░░░░░░░░░░░░░░░░  2.0/10
Access Level          █░░░░░░░░░░░░░░░░░░░  1.0/10
Regulatory Impact     ████░░░░░░░░░░░░░░░░  4.0/10
Vendor Security       ████████░░░░░░░░░░░░  8.0/10
Business Criticality  ██░░░░░░░░░░░░░░░░░░  2.0/10
                      
OVERALL RISK:         ███░░░░░░░░░░░░░░░░░  2.9/10  [LOW]
```

### 7.5 Mitigation Controls

| Priority | Control | Implementation | Owner | Due Date |
|----------|---------|---------------|-------|----------|
| P0 | No PII in analytics | Strict data filtering: no names, emails, financial data | Engineering | 2025-02-15 |
| P0 | IP anonymization | Truncate last octet of IP address | Engineering | 2025-03-01 |
| P0 | Cookie consent | Analytics cookies require opt-in consent | Engineering | 2025-02-15 |
| P1 | User ID anonymization | Hash user IDs before sending to analytics | Engineering | 2025-03-01 |
| P1 | Event filtering | Only send necessary events; filter sensitive actions | Engineering | 2025-03-01 |
| P2 | Self-hosted option | Evaluate PostHog self-hosted for EU data residency | Engineering | 2025-05-01 |
| P2 | DPA execution | Execute analytics vendor DPA | Legal | 2025-03-15 |

### 7.6 Contract Requirements

| Clause | Requirement | Status |
|--------|-------------|--------|
| Data Processing Addendum | GDPR DPA | Required |
| Data use restrictions | Analytics only; no other use | Required |
| Data minimization | Only process provided data | Required |
| Breach notification | 24-hour notification | Required |
| Data deletion | Delete upon termination | Required |

### 7.7 Monitoring Plan

| Monitoring Activity | Frequency | Responsible | Method |
|-------------------|-----------|-------------|--------|
| Data sent review | Monthly | Security | Event inspection |
| PII detection scan | Monthly | Security | Automated scan |
| Cookie consent compliance | Monthly | Legal/Security | Consent verification |
| Vendor security posture | Quarterly | Security | Certification check |

---

## 8. Vendor Risk Summary

### 8.1 Risk Comparison Matrix

| Vendor | Risk Level | Score | Data Sensitivity | Access | Regulatory | Security | Criticality |
|--------|-----------|-------|-----------------|--------|-----------|---------|-------------|
| Moonshot AI | CRITICAL | 8.7 | 10.0 | 9.0 | 10.0 | 6.0 | 8.0 |
| AWS | MEDIUM | 5.2 | 10.0 | 4.0 | 6.0 | 9.0 | 10.0 |
| Stripe | MEDIUM | 4.8 | 7.0 | 3.0 | 7.0 | 9.0 | 7.0 |
| SendGrid | LOW | 3.1 | 3.0 | 2.0 | 4.0 | 8.0 | 4.0 |
| Analytics | LOW | 2.9 | 2.0 | 1.0 | 4.0 | 8.0 | 2.0 |

### 8.2 Risk Heat Map

```
Vendor Risk Heat Map
====================

                    Low Risk    Medium Risk   High Risk   Critical Risk
Data Sensitivity    [Analytics] [Stripe]     [AWS]       [Moonshot AI]
                    [SendGrid]                            
                                                             
Access Level        [Analytics] [AWS]        [Stripe]    [Moonshot AI]
                    [SendGrid]                            
                                                             
Regulatory          [Analytics] [AWS]        [Stripe]    [Moonshot AI]
                    [SendGrid]                            
                                                             
Vendor Security     [Moonshot AI] [Analytics] [AWS]     []
                    [SendGrid]  [Stripe]                 
                                                             
Business Criticality [Analytics] [SendGrid]  [Stripe]    [Moonshot AI]
                                                          [AWS]
```

### 8.3 Consolidated Action Plan

| Priority | Action | Vendors | Owner | Due Date |
|----------|--------|---------|-------|----------|
| P0 | Execute DPA | All | Legal | 2025-02-15 |
| P0 | Complete Transfer Impact Assessment | Moonshot AI | Security | 2025-02-15 |
| P0 | Implement data minimization for LLM | Moonshot AI | Engineering | 2025-02-01 |
| P0 | Verify no sensitive data in emails | SendGrid | Security | 2025-02-15 |
| P1 | Verify EU data residency | AWS | Platform | 2025-02-15 |
| P1 | Verify PCI AOC | Stripe | Security | 2025-02-01 |
| P1 | Implement IP anonymization | Analytics | Engineering | 2025-03-01 |
| P1 | Webhook signature verification | Stripe | Engineering | 2025-02-15 |
| P2 | Evaluate alternative LLM providers | Moonshot AI | Engineering | 2025-03-01 |
| P2 | Evaluate self-hosted analytics | Analytics | Engineering | 2025-05-01 |
| P2 | Implement multi-provider LLM abstraction | Moonshot AI | Engineering | 2025-05-01 |

---

## 9. Third-Party Risk Management Program

### 9.1 Program Governance

| Element | Description |
|---------|-------------|
| **Program Owner** | Chief Information Security Officer (CISO) |
| **Review Frequency** | Quarterly for high/critical risk; Annually for low/medium risk |
| **Board Reporting** | Semi-annual third-party risk summary |
| **Policy Document** | Third-Party Risk Management Policy (separate document) |
| **Tools** | Vendor risk assessment spreadsheet + Jira tracking |

### 9.2 Vendor Lifecycle

```
+-------------+    +-------------+    +-------------+    +-------------+    +------------+
|   Vendor    | -> |   Due       | -> |   Contract   | -> |   Ongoing   | -> |   Vendor   |
|   Intake    |    |   Diligence |    |   Negotiation|    |   Monitoring|    |   Offboard |
+-------------+    +-------------+    +-------------+    +-------------+    +------------+
      |                   |                   |                  |                 |
      |                   |                   |                  |                 |
  - Business need     - Security          - DPA              - Quarterly      - Data return
  - Initial risk      questionnaire       - SLA              reviews          - Access
    assessment        - Reference         - Audit rights     - Security       revocation
  - Budget approval     checks          - Termination      monitoring       - Credential
                    - POC if needed     clauses          - Incident         rotation
                                                          notification     - Final risk
                                                          - Performance    assessment
                                                          review
```

### 9.3 Risk Assessment Tiers

| Tier | Criteria | Assessment Depth | Review Frequency |
|------|----------|-----------------|-----------------|
| Tier 1 (Critical) | Risk score >= 7.0; processes highly confidential data | Full assessment: security questionnaire, reference checks, audit rights | Quarterly |
| Tier 2 (High) | Risk score 5.0-6.9; processes confidential data | Standard assessment: security questionnaire, certification verification | Semi-annually |
| Tier 3 (Medium) | Risk score 3.0-4.9; limited data processing | Light assessment: certification check, basic questionnaire | Annually |
| Tier 4 (Low) | Risk score < 3.0; minimal data, no sensitive data | Minimal assessment: basic security confirmation | Bi-annually |

### 9.4 Security Questionnaire Template

```
VENDOR SECURITY ASSESSMENT QUESTIONNAIRE
========================================

General Information:
- Company name:
- Service description:
- Data types processed:
- Jurisdictions involved:
- Annual cost:

Security Certifications:
[ ] SOC 2 Type II (provide report date: ___)
[ ] ISO 27001 (provide certificate: ___)
[ ] ISO 27017 (Cloud security)
[ ] ISO 27018 (Privacy)
[ ] PCI DSS (Level: ___)
[ ] FedRAMP
[ ] Other: ___

Security Controls:
1. Do you encrypt data at rest? [ ] Yes [ ] No (Algorithm: ___)
2. Do you encrypt data in transit? [ ] Yes [ ] No (Protocol: ___)
3. Do you have MFA for administrative access? [ ] Yes [ ] No
4. Do you conduct annual penetration testing? [ ] Yes [ ] No (Provider: ___)
5. Do you have an incident response plan? [ ] Yes [ ] No
6. What is your breach notification timeline? ___ hours
7. Do you have business continuity/disaster recovery plans? [ ] Yes [ ] No
8. Do you conduct background checks on employees? [ ] Yes [ ] No
9. Do you have a vulnerability management program? [ ] Yes [ ] No
10. Do you have access logging and monitoring? [ ] Yes [ ] No

Data Handling:
1. Where is data stored? (Regions: ___)
2. Do you use sub-processors? [ ] Yes [ ] No (List: ___)
3. Is data used for AI/ML training? [ ] Yes [ ] No
4. What is your data retention period? ___
5. How is data deleted upon termination? ___
6. Do you support data portability? [ ] Yes [ ] No

Compliance:
1. GDPR compliance status: ___
2. CCPA compliance status: ___
3. HIPAA compliance status: ___
4. Data Processing Agreement available: [ ] Yes [ ] No
5. Standard Contractual Clauses available: [ ] Yes [ ] No
```

### 9.5 Key Risk Indicators (KRIs)

| KRI | Threshold | Monitoring Frequency | Escalation |
|-----|-----------|---------------------|------------|
| Vendor risk score increase | > 2.0 point increase | Quarterly | CISO |
| Vendor security certification lapse | Any certification expired | Monthly | CISO |
| Vendor security incident | Any reported incident | Immediate | CISO + Legal |
| Contract renewal without security review | Renewal without review | Annual | CISO |
| New vendor onboarding without assessment | Any unassessed vendor | Real-time | CISO |
| High/Critical vendor without DPA | Missing DPA | Quarterly | Legal |

---

## 10. Appendices

### Appendix A: Vendor Contact Directory

| Vendor | Security Contact | Escalation | Emergency |
|--------|-----------------|------------|-----------|
| Moonshot AI | security@moonshot.ai | legal@moonshot.ai | N/A |
| AWS | AWS Support Case | TAM | N/A |
| Stripe | security@stripe.com | +1-xxx-xxx-xxxx | N/A |
| SendGrid | security@sendgrid.com | support@sendgrid.com | N/A |
| Analytics | security@[vendor].com | support@[vendor].com | N/A |

### Appendix B: Data Flow Diagrams

```
Moonshot AI Data Flow
=====================

User PDF Upload
      |
      v
+-------------+    Minimized Data    +-------------+    Extracted Data    +-------------+
| Statementwise| -> (pre-processing) -> |  Moonshot   | -> (LLM processing) -> | Statementwise |
|   Backend    |                      |     AI      |                      |   Backend      |
+-------------+                      +-------------+                      +-------------+
      |                                                                     |
      |<---------------- No Data Retained by Moonshot AI ----------------->|
      |
      v
+-------------+
|  PostgreSQL  |
|  (User Data) |
+-------------+
```

```
All Vendor Data Flows
=====================

                        +------------+
                        |   User     |
                        +-----+------+
                              |
              +---------------+---------------+
              |               |               |
        +-----v-----+  +------v-----+  +------v------+
        |  AWS      |  | Moonshot   |  |  SendGrid   |
        | (Storage, |  |    AI      |  |  (Email)    |
        |  Compute) |  | (Processing|  |             |
        +-----+-----+  +------+-----+  +------+------+
              |               |               |
        +-----v-----+  +------v-----+  +------v------+
        |  Stripe   |  | Analytics  |  |             |
        | (Payments)|  | (Tracking) |  |             |
        +-----------+  +------------+  +-------------+
```

### Appendix C: Regulatory Cross-Reference

| Regulation | Applicable Vendors | Requirements |
|-----------|-------------------|--------------|
| GDPR | All | DPA, SCCs for transfers, breach notification, data subject rights |
| PCI DSS | Stripe | Merchant compliance, service provider AOC |
| SOC 2 | All | TSC mapping to vendor controls |
| PIPL (China) | Moonshot AI | Chinese data protection law compliance |
| ePrivacy | Analytics, SendGrid | Cookie consent, email regulations |

### Appendix D: Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-01-15 | 1.0 | Security Team | Initial assessment |

---

**END OF DOCUMENT**
