# Sub-Processor List

**Statementwise.ai** | **Effective Date:** July 2025 | **Version:** 1.0

---

> This Sub-Processor List identifies all third-party sub-processors engaged by Statementwise.ai to process personal data on behalf of our users and accounting firm clients. This document is provided in compliance with Art. 28(2) and 28(4) GDPR and forms part of our [Data Processing Agreement](/docs/DATA_PROCESSING_AGREEMENT.md).

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Current Sub-Processors](#2-current-sub-processors)
3. [Sub-Processor Details](#3-sub-processor-details)
4. [Data Transfers Outside the EEA](#4-data-transfers-outside-the-eea)
5. [Sub-Processor Authorization and Objection Process](#5-sub-processor-authorization-and-objection-process)
6. [Planned Sub-Processors](#6-planned-sub-processors)
7. [Sub-Processor Security Requirements](#7-sub-processor-security-requirements)
8. [Changes to This List](#8-changes-to-this-list)
9. [Contact Information](#9-contact-information)

---

## 1. Introduction

### 1.1 Purpose

This document provides transparency regarding the sub-processors engaged by Statementwise.ai ("Statementwise", "we", "us") in connection with the provision of our bank statement conversion service. It is provided in fulfillment of our obligations under:

- Art. 28(2) GDPR — the processor shall not engage another processor without prior specific or general written authorization of the controller
- Art. 28(4) GDPR — where the processor engages a sub-processor, the same data protection obligations as set out in the contract or other legal act between the controller and the processor shall be imposed on that sub-processor
- Our [Data Processing Agreement](/docs/DATA_PROCESSING_AGREEMENT.md) — Section 5 (Sub-processors)

### 1.2 Definitions

| Term | Definition |
|------|------------|
| **Sub-processor** | Any processor engaged by Statementwise to carry out specific processing activities on behalf of the Controller |
| **Processing Location** | The geographic location where the sub-processor processes personal data |
| **EEA** | European Economic Area (EU Member States plus Iceland, Liechtenstein, and Norway) |
| **SCCs** | Standard Contractual Clauses adopted by the European Commission under Implementing Decision (EU) 2021/914 |
| **TIA** | Transfer Impact Assessment — an assessment of the legal framework of the destination country for data transfers outside the EEA |
| **DPA** | Data Processing Agreement between Statementwise and the sub-processor |

### 1.3 How to Read This Document

Each sub-processor entry includes:
- Name and contact information
- Service provided
- Processing location
- Categories of data transferred
- Safeguards in place
- DPA status
- SCC application (for transfers outside the EEA)

---

## 2. Current Sub-Processors

As of the Effective Date, Statementwise engages the following sub-processors:

| # | Sub-Processor | Service | Location | Data Transferred | Transfer Mechanism |
|---|--------------|---------|----------|------------------|-------------------|
| 1 | **Moonshot AI** | AI-powered data extraction | People's Republic of China | PDF bank statement content, metadata | SCCs 2021/914 + TIA |
| 2 | **[Cloud Hosting Provider]** | Cloud infrastructure and hosting | EU (Frankfurt, Germany) | All platform data | Intra-EEA — no transfer mechanism required |
| 3 | **Stripe, Inc.** | Payment processing | United States | Payment data, billing information | DPF certification + SCCs |
| 4 | **[Email Service Provider]** | Transactional email delivery | EU (Ireland) | Email addresses, communication content | Intra-EEA — no transfer mechanism required |
| 5 | **[DNS/CDN Provider]** | DNS resolution and content delivery | Global (EU edge nodes) | DNS queries, cached content | EU edge nodes; DPA in place |
| 6 | **[Log Management Service]** | Security logging and monitoring | EU (Frankfurt, Germany) | Anonymized log data | Intra-EEA — no transfer mechanism required |

---

## 3. Sub-Processor Details

### 3.1 Moonshot AI

| Attribute | Details |
|-----------|---------|
| **Legal Entity** | Moonshot AI (Beijing Moonshot AI Technology Co., Ltd.) |
| **Registered Address** | Beijing, People's Republic of China |
| **Website** | https://www.moonshot.cn |
| **Service Provided** | Large Language Model (LLM) processing for data extraction from PDF bank statements |
| **Processing Activities** | Receiving PDF bank statement content, extracting structured financial data (transactions, amounts, dates, account numbers), and returning structured data to Statementwise |
| **Processing Location** | People's Republic of China |
| **Data Center Location** | China |

#### Data Transferred to Moonshot AI

| Data Category | Detail | Necessity |
|--------------|--------|-----------|
| **PDF bank statement content** | Full text and numerical content of uploaded PDF bank statements | Necessary for AI extraction |
| **File metadata** | File name, page count, file size, upload timestamp | Necessary for processing context |
| **Extraction parameters** | Target export format (QBO, OFX, CSV), language settings | Necessary to format output |

#### Data NOT Transferred to Moonshot AI

| Data Category | Reason |
|--------------|--------|
| User account information | Not necessary for extraction |
| User email addresses | Not shared with sub-processor |
| Payment information | Processed separately by Stripe |
| Usage analytics | Not shared with extraction service |

#### Safeguards

| Safeguard | Detail |
|-----------|--------|
| **Data Processing Addendum (DPA)** | Executed DPA incorporating GDPR obligations |
| **EU Standard Contractual Clauses (SCCs)** | EU Commission Implementing Decision 2021/914 — Module Two (Controller to Processor) and Module Three (Processor to Processor) |
| **Transfer Impact Assessment (TIA)** | Completed TIA assessing Chinese legal framework; supplementary measures identified |
| **Encryption in transit** | TLS 1.3 for all data transfers |
| **Encryption at rest** | AES-256 for temporary data storage during processing |
| **Data minimization** | Only statement content and essential metadata transferred |
| **Retention limitation** | Data is not retained by Moonshot AI beyond the processing session |
| **Contractual commitments** | Moonshot AI contractually committed to not using data for model training without explicit consent |
| **Audit rights** | Statementwise has the right to audit Moonshot AI's security measures annually |

#### Transfer Impact Assessment Summary

| Assessment Factor | Finding |
|-------------------|---------|
| **Destination country** | People's Republic of China |
| **Applicable law** | Cybersecurity Law, Data Security Law, Personal Information Protection Law (PIPL) |
| **Government access risk** | Chinese authorities may request access to data under national security and cybersecurity laws |
| **Judicial redress** | Limited ability for EU data subjects to obtain judicial redress in China |
| **Supplementary measures** | Encryption (TLS 1.3 in transit, AES-256 at rest); data minimization; 30-day retention; contractual restrictions; short-lived processing sessions |
| **Residual risk** | Medium — actively managed through supplementary measures and ongoing monitoring |

#### Moonshot AI Sub-processors

Moonshot AI may engage further sub-processors for cloud infrastructure. Statementwise has been notified of and approved these arrangements. Details are available upon request.

---

### 3.2 Cloud Hosting Provider

| Attribute | Details |
|-----------|---------|
| **Legal Entity** | [Provider Name TBD — EU-based] |
| **Registered Address** | [Address TBD] |
| **Website** | [URL TBD] |
| **Service Provided** | Cloud infrastructure hosting, compute resources, database storage, and backup services |
| **Processing Activities** | Hosting the Statementwise platform, storing all user data, providing compute resources for application processing, managing database operations, performing automated backups |
| **Processing Location** | European Union (Frankfurt, Germany) |
| **Data Center Certifications** | ISO 27001, ISO 27017, ISO 27018, SOC 2 Type II |

#### Data Stored

| Data Category | Storage Detail |
|--------------|---------------|
| **Uploaded bank statements (PDFs)** | Encrypted at rest (AES-256); 30-day retention |
| **Extracted transaction data** | Encrypted at rest (AES-256); 30-day retention |
| **User account data** | Encrypted at rest (AES-256); retained for duration of account + 90 days |
| **Usage data and logs** | Encrypted at rest (AES-256); 90-day retention |
| **Backup data** | Encrypted at rest (AES-256); 90-day backup rotation |

#### Safeguards

| Safeguard | Detail |
|-----------|--------|
| **Data Processing Agreement** | EU-compliant DPA with Art. 28 GDPR obligations |
| **Processing Location** | EU-based — intra-EEA transfer, no SCCs required |
| **Encryption** | AES-256 at rest; TLS 1.3 in transit |
| **Access Controls** | RBAC; SOC; MFA for provider staff |
| **Isolation** | Virtual private cloud (VPC); dedicated database instances |
| **Certifications** | ISO 27001, SOC 2 Type II |
| **BAA/Addendum** | Business Associate Agreement equivalent for data protection |

---

### 3.3 Stripe, Inc.

| Attribute | Details |
|-----------|---------|
| **Legal Entity** | Stripe, Inc. |
| **Registered Address** | 354 Oyster Point Blvd, South San Francisco, CA 94080, United States |
| **Website** | https://stripe.com |
| **Service Provided** | Payment processing, subscription billing, invoicing, tax calculation |
| **Processing Activities** | Processing subscription payments, managing billing cycles, generating invoices, calculating VAT, handling payment disputes |
| **Processing Location** | United States |
| **Data Privacy Framework** | Stripe is certified under the EU-U.S. Data Privacy Framework (DPF) |

#### Data Transferred to Stripe

| Data Category | Detail |
|--------------|--------|
| **Billing information** | Name, billing address, VAT number (for business accounts) |
| **Payment confirmation** | Transaction ID, payment status, amount, currency |
| **Subscription data** | Plan type, billing cycle, start/end dates |
| **Dispute information** | Chargeback details (if applicable) |

#### Safeguards

| Safeguard | Detail |
|-----------|--------|
| **Data Privacy Framework** | Stripe is certified under the EU-U.S. DPF |
| **Standard Contractual Clauses** | Stripe's DPA includes SCCs as a supplementary safeguard |
| **PCI DSS Level 1** | Stripe is PCI DSS Level 1 certified |
| **Encryption** | TLS 1.3 in transit; AES-256 at rest |
| **Tokenization** | Statementwise does not store card numbers; Stripe provides tokens |
| **Stripe's DPA** | https://stripe.com/legal/dpa |

**Important:** Statementwise does **not** store full credit card numbers. All payment data is handled directly by Stripe. Statementwise only receives payment confirmation tokens from Stripe.

---

### 3.4 Email Service Provider

| Attribute | Details |
|-----------|---------|
| **Legal Entity** | [Provider Name TBD — EU-based] |
| **Registered Address** | [Address TBD] |
| **Website** | [URL TBD] |
| **Service Provided** | Transactional email delivery (account notifications, support responses, security alerts) |
| **Processing Activities** | Sending transactional emails on behalf of Statementwise; email delivery tracking (opens, bounces); suppression list management |
| **Processing Location** | European Union (Ireland) |

#### Data Transferred

| Data Category | Detail |
|--------------|--------|
| **Email addresses** | Recipient email addresses |
| **Email content** | Transactional email content (account-related, support-related) |
| **Delivery metadata** | Open rates, bounce rates, delivery confirmations (anonymized where possible) |

#### Safeguards

| Safeguard | Detail |
|-----------|--------|
| **Data Processing Agreement** | EU-compliant DPA with Art. 28 GDPR obligations |
| **Processing Location** | EU-based — intra-EEA transfer |
| **Encryption** | TLS in transit; encrypted at rest |
| **No marketing** | Transactional emails only; no marketing email service |

---

### 3.5 DNS/CDN Provider

| Attribute | Details |
|-----------|---------|
| **Legal Entity** | [Provider Name TBD] |
| **Service Provided** | DNS resolution, DDoS protection, content delivery network |
| **Processing Location** | Global network with EU edge nodes |
| **Data Processed** | DNS query data (anonymized), cached static content |

#### Safeguards

| Safeguard | Detail |
|-----------|--------|
| **Data Processing Agreement** | DPA in place |
| **Data Minimization** | Only DNS and cache data; no personal content |
| **EU Edge Nodes** | EU traffic served from EU nodes where possible |
| **Anonymization** | DNS logs are anonymized |

---

### 3.6 Log Management Service

| Attribute | Details |
|-----------|---------|
| **Legal Entity** | [Provider Name TBD — EU-based] |
| **Service Provided** | Centralized security logging, log analysis, alerting |
| **Processing Location** | European Union (Frankfurt, Germany) |
| **Data Processed** | Anonymized log data, security event data, error logs |

#### Safeguards

| Safeguard | Detail |
|-----------|--------|
| **Data Processing Agreement** | EU-compliant DPA |
| **Processing Location** | EU-based — intra-EEA |
| **Anonymization** | Personal data is pseudonymized/anonymized before transfer |
| **Encryption** | TLS 1.3 in transit; AES-256 at rest |

---

## 4. Data Transfers Outside the EEA

### 4.1 Transfer Overview

The following sub-processors process personal data outside the EEA:

| Sub-Processor | Country | Adequacy Decision | Transfer Mechanism |
|--------------|---------|-------------------|-------------------|
| Moonshot AI | China | No | SCCs 2021/914 + TIA + supplementary measures |
| Stripe, Inc. | United States | Partial (DPF) | DPF certification + SCCs as supplementary |

### 4.2 Transfer Safeguards Summary

| Sub-Processor | SCC Module | TIA Completed | Supplementary Measures |
|--------------|-----------|---------------|----------------------|
| Moonshot AI | Module 2 + Module 3 | Yes | Encryption (TLS 1.3, AES-256); data minimization; 30-day retention; contractual restrictions |
| Stripe, Inc. | N/A (DPF applies) | No (DPF covers) | DPF certification; Stripe's DPA; encryption |

### 4.3 EU Data Residency Roadmap

Statementwise is committed to reducing international data transfers:

| Initiative | Target Date | Description |
|-----------|-------------|-------------|
| EU-only hosting option | Q4 2025 | Option for users to require all data processing within the EEA |
| EU AI alternative evaluation | Q1 2026 | Assessment of EU-based LLM providers as alternative to Moonshot AI |
| Full EU processing path | Q2 2026 | Ability to process statements entirely within the EEA (subject to EU AI provider availability) |

---

## 5. Sub-Processor Authorization and Objection Process

### 5.1 General Authorization

By using the Statementwise service, you authorize Statementwise to engage the sub-processors listed in this document. If you are an accounting firm using our client portal, this authorization is granted under Section 5 of our [Data Processing Agreement](/docs/DATA_PROCESSING_AGREEMENT.md).

### 5.2 Adding New Sub-Processors

Statementwise will provide **at least 30 days' prior notice** before engaging any new sub-processor. Notice will be provided via:

- Email notification to the account holder's registered email address
- Notice posted on our website (sub-processor list updates)
- Notification within the client portal (for accounting firms)

### 5.3 Objection Process

If you object to a new sub-processor on legitimate data protection grounds:

| Step | Timeline | Action |
|------|----------|--------|
| 1. Submit objection | Within 14 days of notice | Email legal@statementwise.ai with your objection and grounds |
| 2. Discussion period | 14 days | We will discuss the objection in good faith and consider alternative solutions |
| 3. Resolution | End of discussion period | We either: (a) do not engage the sub-processor, (b) implement additional safeguards, or (c) agree on an alternative |
| 4. Termination option | If no resolution | You may terminate the affected services without penalty |

### 5.4 Criteria for Objection

Legitimate grounds for objection may include:

- The sub-processor is located in a jurisdiction with inadequate data protection
- The sub-processor has a history of data breaches or security incidents
- The sub-processor's security measures are insufficient
- The sub-processor engages in data practices that violate GDPR principles
- The transfer mechanism is inadequate for the risk level

---

## 6. Planned Sub-Processors

Statementwise is evaluating the following sub-processors for future engagement:

| Sub-Processor (Planned) | Service | Location | Status | Expected Date |
|------------------------|---------|----------|--------|---------------|
| **EU-based LLM provider** | AI extraction alternative | EU | Under evaluation | Q1-Q2 2026 |
| **Identity verification provider** | KYC/AML verification | EU | Planned | Q4 2025 |
| **Backup storage provider** | Long-term encrypted backups | EU | Planned | Q4 2025 |
| **Monitoring/observability provider** | Application performance monitoring | EU | Under evaluation | Q4 2025 |

> **Note:** No sub-processor will be engaged without the notice and objection process described in Section 5.

---

## 7. Sub-Processor Security Requirements

### 7.1 Minimum Security Standards

All sub-processors must meet the following minimum security requirements:

| Requirement | Standard |
|-------------|----------|
| **Encryption at rest** | AES-256 or equivalent |
| **Encryption in transit** | TLS 1.2 minimum; TLS 1.3 preferred |
| **Access controls** | Role-based access control (RBAC); principle of least privilege |
| **Authentication** | Multi-factor authentication for privileged access |
| **Audit logging** | Comprehensive logging of data access and modifications |
| **Incident response** | Documented incident response plan; 24-hour breach notification to Statementwise |
| **Staff training** | Annual data protection and security training |
| **Background checks** | Background checks for staff with access to personal data |
| **Physical security** | Appropriate physical security measures for data centers |
| **Business continuity** | Disaster recovery plan with documented RTO and RPO |

### 7.2 Data Processing Agreement Requirements

All sub-processors must execute a DPA that includes:

1. Processing only on Statementwise's documented instructions
2. Confidentiality obligations for all personnel
3. Implementation of appropriate technical and organizational security measures
4. Notification of personal data breaches within 24 hours
5. Assistance with data subject rights requests
6. Deletion or return of data upon termination
7. Audit rights for Statementwise
8. For transfers outside the EEA, appropriate transfer safeguards (SCCs or adequacy)

### 7.3 Annual Reviews

Statementwise conducts annual security reviews of all sub-processors, including:

- Review of security certifications (ISO 27001, SOC 2, etc.)
- Assessment of breach history
- Evaluation of compliance with contractual obligations
- Verification of data handling practices

---

## 8. Changes to This List

### 8.1 Update Process

This Sub-Processor List will be updated:

- **When a new sub-processor is engaged** — 30 days' notice provided
- **When a sub-processor is removed** — Notice within 14 days
- **When sub-processor details change** — Notice within 14 days
- **Quarterly** — Regular review even if no changes

### 8.2 Notification

Updates will be communicated via:

1. Email to registered account holders
2. Update to this document on our website
3. Notification in the client portal (for accounting firms)

### 8.3 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | July 2025 | Initial release — 6 sub-processors listed |

---

## 9. Contact Information

For questions about this Sub-Processor List or to exercise your right to object:

| Department | Contact |
|------------|---------|
| **Data Protection Officer** | dpo@statementwise.ai |
| **Legal / Sub-processor Inquiries** | legal@statementwise.ai |
| **General Privacy Questions** | privacy@statementwise.ai |
| **Support** | support@statementwise.ai |

**Postal address:**

Statementwise.ai
Data Protection Officer
[Address TBD]

We aim to respond to all inquiries within **2 business days**.

---

## Appendix A: Sub-Processor Quick Reference

### At a Glance

| # | Sub-Processor | Location | Outside EEA? | Transfer Mechanism | Service |
|---|--------------|----------|-------------|-------------------|---------|
| 1 | Moonshot AI | China | Yes | SCCs + TIA | AI extraction |
| 2 | [Cloud Hosting] | EU (Germany) | No | N/A | Infrastructure |
| 3 | Stripe, Inc. | US | Yes | DPF + SCCs | Payments |
| 4 | [Email Provider] | EU (Ireland) | No | N/A | Email delivery |
| 5 | [DNS/CDN] | Global/EU | Partial | DPA | DNS/CDN |
| 6 | [Log Management] | EU (Germany) | No | N/A | Logging |

### Transfer Risk Summary

| Sub-Processor | Risk Level | Mitigation Priority |
|--------------|-----------|-------------------|
| Moonshot AI | Medium | High — actively seeking EU alternative |
| Stripe, Inc. | Low | Low — DPF + strong security program |
| All EU-based | Low | N/A — intra-EEA processing |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **AES-256** | Advanced Encryption Standard with 256-bit key length |
| **DPA** | Data Processing Agreement |
| **DPF** | Data Privacy Framework (EU-U.S. framework for transatlantic data flows) |
| **EEA** | European Economic Area |
| **GDPR** | General Data Protection Regulation |
| **HSM** | Hardware Security Module |
| **RBAC** | Role-Based Access Control |
| **SCCs** | Standard Contractual Clauses |
| **SOC 2** | Service Organization Control 2 (security audit standard) |
| **TIA** | Transfer Impact Assessment |
| **TLS 1.3** | Transport Layer Security version 1.3 |
| **VPC** | Virtual Private Cloud |

---

*This Sub-Processor List was prepared in accordance with Regulation (EU) 2016/679 (GDPR), the EU Commission Implementing Decision 2021/914 on Standard Contractual Clauses, and the EDPB Guidelines on Data Processors. It should be reviewed by qualified legal counsel before final publication.*

*Version 1.0 — July 2025*
