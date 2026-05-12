# GDPR Compliance Statement

**Statementwise.ai** | **Effective Date:** July 2025 | **Version:** 1.0

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Legal Basis for Processing](#2-legal-basis-for-processing)
3. [Roles and Responsibilities](#3-roles-and-responsibilities)
4. [Data Subject Rights Implementation](#4-data-subject-rights-implementation)
5. [Data Processing Details](#5-data-processing-details)
6. [Technical and Organizational Measures](#6-technical-and-organizational-measures)
7. [Data Breach Notification](#7-data-breach-notification)
8. [Data Protection Officer](#8-data-protection-officer)
9. [Data Protection Impact Assessment](#9-data-protection-impact-assessment)
10. [International Data Transfers](#10-international-data-transfers)
11. [Record of Processing Activities](#11-record-of-processing-activities)
12. [Contact and Updates](#12-contact-and-updates)

---

## 1. Introduction

Statementwise.ai ("**Statementwise**", "**we**", "**us**", or "**our**") is committed to protecting the personal data of our users and ensuring compliance with the General Data Protection Regulation (Regulation (EU) 2016/679) ("**GDPR**"), the UK Data Protection Act 2018, and all applicable national data protection laws in the European Union and European Economic Area ("**EEA**").

This GDPR Compliance Statement sets out how Statementwise processes personal data in connection with its AI-native bank statement conversion service, which enables accounting firms and individual users to convert PDF bank statements into structured accounting formats including QuickBooks Online (QBO), Open Financial Exchange (OFX), and Comma-Separated Values (CSV).

### 1.1 Scope

This statement applies to all personal data processed by Statementwise in the course of:
- Operating the Statementwise.ai SaaS platform
- Processing uploaded bank statements and financial documents
- Providing AI-powered data extraction services
- Maintaining client portals for accounting firms
- Delivering customer support and service communications

### 1.2 Definitions

| Term | Definition |
|------|------------|
| **Personal Data** | Any information relating to an identified or identifiable natural person ("Data Subject") as defined in Art. 4(1) GDPR. |
| **Data Controller** | The natural or legal person which determines the purposes and means of the processing of personal data (Art. 4(7) GDPR). |
| **Data Processor** | A natural or legal person which processes personal data on behalf of the Data Controller (Art. 4(8) GDPR). |
| **Sub-processor** | Any processor engaged by the Data Processor to carry out specific processing activities on behalf of the Controller. |
| **Processing** | Any operation performed on personal data, whether or not by automated means (Art. 4(2) GDPR). |
| **Special Category Data** | Personal data revealing racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic or biometric data, health data, or data concerning sex life or sexual orientation (Art. 9 GDPR). |
| **EEA** | European Economic Area, comprising the EU Member States plus Iceland, Liechtenstein, and Norway. |

---

## 2. Legal Basis for Processing

Statementwise processes personal data only where a valid legal basis exists under Art. 6 GDPR. We have identified the following legal bases for our processing activities:

### 2.1 Legal Basis Overview

| Processing Activity | Legal Basis | GDPR Article | Rationale |
|---------------------|-------------|--------------|-----------|
| Providing bank statement conversion service | Contractual Necessity | Art. 6(1)(b) | Processing is necessary to perform our contract with the user — converting bank statements to the requested export format. |
| User account creation and management | Contractual Necessity | Art. 6(1)(b) | Processing is necessary to create and manage the user account required to access the service. |
| Customer support and communication | Contractual Necessity | Art. 6(1)(b) | Responding to queries and resolving issues is necessary for contract performance. |
| Fraud prevention and security | Legitimate Interests | Art. 6(1)(f) | Protecting our platform, users, and services against fraud, abuse, and security threats. |
| Service improvement and analytics | Legitimate Interests | Art. 6(1)(f) | Improving the accuracy of AI extraction and overall user experience. |
| Legal compliance (tax, financial regulations) | Legal Obligation | Art. 6(1)(c) | Compliance with applicable financial services regulations, tax laws, and court orders. |
| Marketing communications (to existing customers) | Legitimate Interests | Art. 6(1)(f) | Promoting related services to existing users (with opt-out available). |

### 2.2 Detailed Legal Basis Analysis

#### 2.2.1 Art. 6(1)(b) — Contractual Necessity

The primary legal basis for processing personal data in connection with the Statementwise service is **Art. 6(1)(b) GDPR** — processing is necessary for the performance of a contract to which the data subject is a party.

When a user uploads a bank statement for conversion, we process:
- **Account holder information** (name, account number) contained within the statement
- **Transaction data** (descriptions, amounts, dates, counterparty details)
- **Uploaded document metadata** (file name, upload timestamp, page count)

This processing is strictly necessary to perform the core conversion service. Without processing this data, we cannot extract and export transaction data to the requested accounting format.

#### 2.2.2 Art. 6(1)(f) — Legitimate Interests

We rely on **legitimate interests** (Art. 6(1)(f) GDPR) for the following processing activities, having conducted and documented a Legitimate Interests Assessment (LIA):

| Legitimate Interest | Description | Balancing Test Result |
|--------------------|-------------|----------------------|
| **Fraud Prevention** | Monitoring for suspicious upload patterns, unauthorized access attempts, and payment fraud. | User rights are not overridden; processing is proportionate and limited to security purposes. |
| **Service Improvement** | Analyzing extraction accuracy, error rates, and usage patterns to improve AI model performance. | Data is pseudonymized where possible; users may object via dpo@statementwise.ai. |
| **Platform Security** | Maintaining audit logs, IP address recording for security incidents, and access monitoring. | Necessary to protect both Statementwise and user data; proportionate to the security risk. |

Our **Legitimate Interests Assessment** is available upon request from our DPO.

#### 2.2.3 Art. 9 — Special Category Data Considerations

Art. 9 GDPR prohibits the processing of special category data unless an exemption applies. Statementwise **does not intentionally process** special category data as defined in Art. 9(1) GDPR.

However, we acknowledge that:

- **Financial data** (account numbers, transaction histories, balances) is **not** classified as special category data under Art. 9 GDPR.
- Bank statements may **inadvertently** contain special category data (e.g., payments to religious organizations, political parties, medical service providers, or legal representatives that may reveal sensitive information).

**Safeguards for potential special category data:**

| Risk | Mitigation |
|------|------------|
| Unintentional processing of special category data in transaction descriptions | Our AI extraction model targets structured financial data only (amounts, dates, account numbers). Narrative transaction descriptions are retained only for export purposes. |
| Inference of sensitive information from transaction patterns | We do not analyze transaction patterns for purposes beyond format conversion. Data is not used for profiling. |
| Data retention | All uploaded statement data is deleted within **30 days** of upload (see Section 5.3), minimizing exposure risk. |

Where special category data is identified, we rely on **Art. 9(2)(f) GDPR** — processing is necessary for the establishment, exercise, or defence of legal claims, and **Art. 9(2)(e) GDPR** — processing relates to data manifestly made public by the data subject, given that bank statements are provided voluntarily by users for the specific purpose of conversion.

---

## 3. Roles and Responsibilities

The GDPR assigns distinct obligations to Data Controllers and Data Processors. Statementwise operates under a **dual-role framework**, acting as both Controller and Processor depending on the context.

### 3.1 Role Classification

| Role | Context | Obligations |
|------|---------|-------------|
| **Data Controller** | For direct users (individuals and sole practitioners) who upload their own bank statements. | Full GDPR controller obligations including transparency, purpose limitation, data minimization, and accountability. |
| **Data Processor** | For accounting firms using the client portal to upload and manage their clients' bank statements. | Processor obligations under Art. 28-29 GDPR, including processing only on documented instructions from the Controller. |
| **Data Controller** | For our own business operations (marketing, billing, employee data). | Full controller obligations for data related to our business activities. |

### 3.2 Statementwise as Data Controller (Direct Users)

When individual users or sole practitioners create an account and upload their own bank statements, Statementwise acts as the **sole Data Controller**.

**Controller responsibilities include:**
- Determining the purposes and means of processing uploaded bank statements
- Providing privacy information under Art. 13-14 GDPR
- Responding to data subject rights requests (Art. 15-22 GDPR)
- Ensuring lawful basis for processing
- Maintaining records of processing activities (Art. 30 GDPR)
- Implementing appropriate technical and organizational measures (Art. 32 GDPR)
- Notifying data breaches (Art. 33-34 GDPR)

### 3.3 Statementwise as Data Processor (Client Portal Firms)

When an accounting firm uses the Statementwise client portal to upload bank statements belonging to their clients, the following roles apply:

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA CONTROLLERSHIP                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Accounting Firm (Controller)                               │
│   └── Determines purpose: Converting client bank statements  │
│       for accounting/bookkeeping purposes                    │
│       └── Has direct relationship with the data subject      │
│           (the accounting firm's client)                     │
│                                                             │
│   Statementwise (Processor)                                  │
│   └── Processes data ONLY on the accounting firm's           │
│       documented instructions                                │
│       └── Provides conversion service as instructed          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Processing instructions from the Controller (accounting firm) include:**
1. Converting uploaded PDF bank statements to the specified export format (QBO, OFX, CSV)
2. Storing converted data for the duration of the firm's subscription
3. Making converted data available to authorized users within the firm's client portal
4. Deleting data upon termination of the firm's account or upon explicit instruction

Statementwise **will not**:
- Use client data for any purpose beyond conversion
- Share client data with third parties (except authorized sub-processors)
- Retain client data beyond the agreed retention period
- Transfer data outside the EEA without appropriate safeguards

### 3.4 Accounting Firms as Data Controllers

Accounting firms using the Statementwise client portal **must**:

1. **Inform their clients** that they use Statementwise for bank statement conversion and provide appropriate privacy information (Art. 13-14 GDPR)
2. **Have a lawful basis** for sharing their clients' bank statement data with Statementwise
3. **Enter into a Data Processing Agreement** with Statementwise (see `/docs/DATA_PROCESSING_AGREEMENT.md`)
4. **Respond to data subject rights requests** from their clients, with Statementwise's assistance
5. **Ensure data accuracy** by only uploading correct and up-to-date bank statements

### 3.5 Moonshot AI as Sub-processor

Moonshot AI provides the large language model (LLM) infrastructure used for extracting structured data from uploaded bank statements.

| Attribute | Details |
|-----------|---------|
| **Entity** | Moonshot AI |
| **Role** | Sub-processor (engaged by Statementwise as Processor) |
| **Function** | AI-powered text extraction and structured data generation from bank statement PDFs |
| **Data Transferred** | PDF bank statement content (text and numerical data), file metadata |
| **Processing Location** | People's Republic of China |
| **Safeguards** | EU Standard Contractual Clauses (SCCs) 2021/914 with Transfer Impact Assessment |

Statementwise has entered into a Data Processing Addendum with Moonshot AI incorporating the EU Standard Contractual Clauses (Module Two: Controller to Processor) to ensure GDPR-compliant data transfers. See Section 10 for details on international transfers.

### 3.6 Responsibility Matrix

| Obligation | Statementwise (as Controller) | Statementwise (as Processor) | Accounting Firm |
|------------|------------------------------|------------------------------|-----------------|
| Privacy notice to data subject | Yes (Art. 13-14) | No | Yes (must inform their client) |
| Lawful basis assessment | Yes (Art. 6) | Processes only on instructions | Yes (must have lawful basis) |
| Data subject rights response | Yes (Art. 15-22) | Assists the Controller | Primary responsibility |
| DPIA | Yes (Art. 35) | Contributes as required | Required for their processing |
| Breach notification to SA | Yes (Art. 33) | Notifies Controller immediately | Notifies their SA |
| Breach notification to data subjects | Yes (Art. 34) | Assists the Controller | Primary responsibility |
| Records of processing (Art. 30) | Yes | Yes | Yes |
| DPO appointment | Yes | N/A | If required by Art. 37 |

---

## 4. Data Subject Rights Implementation

Statementwise respects and facilitates the exercise of all rights conferred on data subjects by Chapter III GDPR (Art. 15-22). We have implemented processes to ensure timely and effective response to rights requests.

### 4.1 Rights Overview

| Right | GDPR Article | Response Time | How to Exercise |
|-------|-------------|---------------|-----------------|
| Right to Access | Art. 15 | 30 calendar days | Email dpo@statementwise.ai |
| Right to Rectification | Art. 16 | 30 calendar days | Via account settings or email |
| Right to Erasure | Art. 17 | 30 calendar days | Email dpo@statementwise.ai |
| Right to Restrict Processing | Art. 18 | Without undue delay | Email dpo@statementwise.ai |
| Right to Data Portability | Art. 20 | 30 calendar days | Email dpo@statementwise.ai |
| Right to Object | Art. 21 | 30 calendar days | Email dpo@statementwise.ai |
| Rights re: Automated Decision-Making | Art. 22 | 30 calendar days | Email dpo@statementwise.ai |

### 4.2 Right to Access (Art. 15)

Data subjects have the right to obtain confirmation as to whether Statementwise processes their personal data, and where that is the case, access to that data and the information specified in Art. 15(1).

**Information provided upon access request:**
- The purposes of processing
- The categories of personal data concerned
- The recipients or categories of recipients to whom personal data have been or will be disclosed
- The envisaged period for which personal data will be stored
- The existence of the right to request rectification, erasure, or restriction
- The right to lodge a complaint with a supervisory authority
- The source of the personal data (if not collected from the data subject)
- The existence of automated decision-making, including profiling (Art. 15(1)(h))

**Process:**
1. Data subject submits request to dpo@statementwise.ai with proof of identity
2. DPO verifies identity within 5 business days
3. DPO compiles response within 25 calendar days
4. Response delivered electronically (PDF) or in another agreed format
5. For complex requests, an extension of up to two months may be applied (Art. 12(3))

### 4.3 Right to Rectification (Art. 16)

Data subjects have the right to obtain the rectification of inaccurate personal data concerning them.

**Implementation:**
- Account information (name, email, organization) can be updated directly via the account settings page
- Extracted transaction data can be corrected within the conversion interface before export
- For corrections to historical data or account records, contact dpo@statementwise.ai
- We will notify any recipients of the rectified data unless this proves impossible or involves disproportionate effort (Art. 19)

### 4.4 Right to Erasure — "Right to be Forgotten" (Art. 17)

Data subjects have the right to obtain erasure of personal data where one of the grounds in Art. 17(1) applies.

**Erasure grounds and implementation:**

| Ground (Art. 17(1)) | Implementation |
|---------------------|----------------|
| (a) Data no longer necessary | Uploaded statements are automatically deleted after **30 days**. Account data deleted upon account closure. |
| (b) Withdrawal of consent | Where processing is based on consent, erasure is completed within **72 hours** of withdrawal. |
| (c) Objection under Art. 21 | Where objection is upheld, processing ceases and data is erased within **72 hours**. |
| (d) Unlawful processing | Upon identification of unlawful processing, immediate remediation and erasure within **24 hours**. |
| (e) Legal obligation | Where required by EU or Member State law, erasure is completed within **72 hours**. |

**Exceptions to erasure (Art. 17(3)):**
We may refuse erasure where processing is necessary for:
- Exercising the right of freedom of expression and information
- Compliance with a legal obligation
- The establishment, exercise, or defence of legal claims
- Archiving purposes in the public interest, scientific or historical research

**Note:** Erasure of uploaded bank statements may not extend to backups for **up to 90 days** due to technical backup cycles. Backups are encrypted and are overwritten in the normal course of backup rotation.

### 4.5 Right to Restriction of Processing (Art. 18)

Data subjects have the right to obtain restriction of processing where:

1. The accuracy of the personal data is contested
2. The processing is unlawful and the data subject opposes erasure
3. Statementwise no longer needs the data but it is required by the data subject for legal claims
4. The data subject has objected to processing pending verification of overriding grounds

**Implementation:**
- Upon receipt of a valid restriction request, we immediately mark the relevant data as restricted
- Restricted data is excluded from all processing except storage and legal claim purposes
- We notify the data subject before lifting any restriction

### 4.6 Right to Data Portability (Art. 20)

Data subjects have the right to receive personal data concerning them in a structured, commonly used, and machine-readable format, and to transmit that data to another controller.

**Implementation:**
- Extracted transaction data can be exported in **CSV, OFX, or QBO** format at any time via the platform
- Account data (profile information, usage history) can be exported in **JSON** format upon request
- Data is provided within **30 calendar days** of request
- Where technically feasible, we support direct transmission to another controller

### 4.7 Right to Object (Art. 21)

Data subjects have the right to object to processing based on legitimate interests (Art. 6(1)(f)) or for direct marketing purposes.

**Implementation:**

| Objection Type | Process | Outcome |
|---------------|---------|---------|
| Objection to processing based on legitimate interests | Submit objection to dpo@statementwise.ai with grounds | We cease processing unless we demonstrate compelling legitimate grounds that override the data subject's interests, rights, and freedoms |
| Objection to direct marketing | Click "unsubscribe" in marketing emails or contact DPO | Marketing communications cease immediately |
| Objection to research/statistics | Contact dpo@statementwise.ai | Where data is used for statistical purposes, we assess the feasibility of exclusion |

### 4.8 Rights Related to Automated Decision-Making (Art. 22)

Art. 22 GDPR grants data subjects the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning them or similarly significantly affects them.

**Statementwise's position:**

| Aspect | Detail |
|--------|--------|
| **Automated decision-making?** | No. Our AI extraction does not make decisions about individuals. It performs **technical data transformation** — extracting structured data from PDF documents. |
| **Profiling?** | No. We do not analyze personal data to evaluate personal aspects, predict behavior, or build profiles. |
| **Legal or similarly significant effects?** | No. Our processing does not affect legal rights, financial standing, or access to services. |
| **Art. 22 applicability** | Statementwise's processing falls outside the scope of Art. 22 GDPR. The AI performs **data extraction and formatting**, not decision-making. |

**Transparency regarding AI processing:**
- We inform users that AI is used for data extraction (Art. 13(2)(f))
- Users can review and correct extracted data before export
- We do not use extracted data for training purposes without explicit consent
- The Moonshot AI sub-processor processes data solely for extraction purposes

### 4.9 Exercising Your Rights

To exercise any of the rights above, please contact:

| Channel | Detail |
|---------|--------|
| **Email** | dpo@statementwise.ai |
| **Postal Address** | Data Protection Officer, Statementwise.ai, [Address TBD] |
| **Online** | Via the "Privacy Settings" section of your account |

**Verification:** We may need to verify your identity before processing your request. We will ask for:
- Government-issued photo ID
- Proof of account ownership (e.g., access to registered email)

**Response timeline:** We respond to all requests within **30 calendar days**. For complex requests, we may extend this period by two months, notifying you within the initial 30-day period.

**Complaints:** If you are not satisfied with our response, you have the right to lodge a complaint with your local supervisory authority:
- **Ireland:** Data Protection Commission — www.dataprotection.ie
- **Germany:** Federal Commissioner for Data Protection — www.bfdi.bund.de
- **France:** Commission Nationale de l'Informatique et des Libertes (CNIL) — www.cnil.fr
- **Netherlands:** Autoriteit Persoonsgegevens — www.autoriteitpersoonsgegevens.nl
- **Full list:** European Data Protection Board — www.edpb.europa.eu

---

## 5. Data Processing Details

### 5.1 Categories of Personal Data Processed

Statementwise processes the following categories of personal data:

| Category | Data Elements | Source |
|----------|--------------|--------|
| **Identity Data** | Full name, email address, phone number (optional), company name (optional) | Directly from user (account registration) |
| **Financial Data** | Bank account numbers, sort codes/IBAN, transaction amounts, transaction descriptions, dates, balances, counterparty names, counterparty account details | Uploaded PDF bank statements |
| **Document Data** | PDF files, file metadata (size, pages, upload timestamp, file hash) | Uploaded by user |
| **Technical Data** | IP address, browser type and version, operating system, device identifiers, session tokens | Automatically collected |
| **Usage Data** | Conversion history, export formats used, feature usage, error logs | Automatically collected (platform analytics) |
| **Communication Data** | Support tickets, email correspondence, feedback submissions | Directly from user |
| **Payment Data** | Billing address, VAT number (for businesses), transaction history | Payment processor (Stripe) — Statementwise does not store full card numbers |

### 5.2 Purpose of Processing

| Purpose | Description | Legal Basis | Data Categories |
|---------|-------------|-------------|-----------------|
| **Core Service Delivery** | Converting PDF bank statements to structured accounting formats (QBO, OFX, CSV) | Art. 6(1)(b) — Contractual necessity | Financial Data, Document Data |
| **Account Management** | Creating and managing user accounts, authentication, subscription management | Art. 6(1)(b) — Contractual necessity | Identity Data, Technical Data |
| **Customer Support** | Responding to inquiries, troubleshooting, account assistance | Art. 6(1)(b) — Contractual necessity | All categories as necessary |
| **Platform Security** | Fraud detection, abuse prevention, unauthorized access monitoring | Art. 6(1)(f) — Legitimate interests | Technical Data, Usage Data |
| **Service Improvement** | Improving AI extraction accuracy, platform reliability, and user experience | Art. 6(1)(f) — Legitimate interests | Usage Data, anonymized Financial Data |
| **Billing and Payments** | Processing subscription payments, invoicing, tax compliance | Art. 6(1)(b) — Contractual necessity | Identity Data, Payment Data |
| **Legal Compliance** | Fulfilling legal obligations, responding to legal requests, dispute resolution | Art. 6(1)(c) — Legal obligation | All categories as necessary |
| **Marketing** | Sending product updates, feature announcements, and promotional offers | Art. 6(1)(f) — Legitimate interests (with opt-out) | Identity Data |

### 5.3 Data Retention Periods

Statementwise applies data minimization principles and retains personal data only for as long as necessary for the specified purposes:

| Data Category | Retention Period | Rationale |
|--------------|------------------|-----------|
| **Uploaded bank statements (PDFs)** | **30 days** from upload | Sufficient time for user to review, correct, and export converted data. Automatic deletion after 30 days. |
| **Extracted transaction data** | **30 days** from upload, or until export (whichever is earlier) | Available for user review and export during the 30-day window. |
| **Account data (profile, settings)** | **Duration of account** + **90 days** after closure | Retained for 90 days post-closure to handle disputes, support requests, and legal obligations. |
| **Usage data and logs** | **90 days** | Required for security monitoring, fraud prevention, and service improvement. Anonymized after 90 days. |
| **Payment and billing records** | **7 years** | Legal obligation for tax and accounting records (varies by jurisdiction; minimum EU standard applied). |
| **Support tickets and communications** | **3 years** from resolution | For quality assurance and potential legal claims. |
| **Audit logs (security)** | **1 year** | Required for security incident investigation and regulatory compliance. |
| **Marketing preferences** | **Until consent withdrawn** or account closed | Users can update preferences or unsubscribe at any time. |

**Early deletion:** Users may request early deletion of any data category at any time by contacting dpo@statementwise.ai.

### 5.4 Data Recipients and Sub-processors

Statementwise shares personal data only where necessary and with appropriate safeguards:

| Recipient Category | Examples | Purpose | Legal Basis |
|-------------------|----------|---------|-------------|
| **Sub-processors** | Moonshot AI (AI extraction) | Data extraction and processing | Art. 28 GDPR — Data Processing Agreement |
| **Infrastructure providers** | Cloud hosting provider (EU-based) | Platform hosting and storage | Art. 28 GDPR — Data Processing Agreement |
| **Payment processors** | Stripe, Inc. | Subscription billing | Art. 28 GDPR — Data Processing Agreement |
| **Communication services** | Email service provider | Transactional and support emails | Art. 28 GDPR — Data Processing Agreement |
| **Legal and professional advisors** | External counsel, auditors | Legal compliance, audits | Art. 6(1)(f) — Legitimate interests (under confidentiality) |
| **Regulatory authorities** | Tax authorities, financial regulators | Legal compliance | Art. 6(1)(c) — Legal obligation |
| **Law enforcement** | Police, courts | Legal requests, investigations | Art. 6(1)(c) — Legal obligation |

**Note:** We do not sell personal data to third parties. We do not share data for advertising purposes.

### 5.5 Third-Party Disclosures

We may disclose personal data:

1. **To comply with legal obligations** — where required by law, court order, or regulatory authority
2. **To enforce our terms** — where necessary to protect our rights, property, or safety, or that of our users
3. **In connection with a business transfer** — in the event of a merger, acquisition, or sale of assets, subject to the transferee assuming our GDPR obligations
4. **With user consent** — in any other circumstance, with explicit user consent

---

## 6. Technical and Organizational Measures

Statementwise implements a comprehensive security program aligned with Art. 32 GDPR, ISO/IEC 27001 principles, and SOC 2 Type II requirements. Our measures ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems and services.

### 6.1 Security Measures Overview

| Domain | Measure | Implementation |
|--------|---------|---------------|
| **Encryption at Rest** | AES-256 encryption | All stored data — bank statements, transaction data, user profiles, and backups |
| **Encryption in Transit** | TLS 1.3 | All data transmitted between users and our platform; all internal service communication |
| **Key Management** | Cloud KMS (Key Management Service) | Encryption keys stored separately from data; key rotation every 90 days; HSM-backed key storage |
| **Access Controls** | Role-Based Access Control (RBAC) | Granular permissions; principle of least privilege; quarterly access reviews |
| **Authentication** | Multi-Factor Authentication (MFA) | Enforced for all staff; available for all users; SSO support for enterprise plans |
| **Session Management** | Secure, short-lived tokens | JWT tokens with 15-minute expiry; secure httpOnly cookies; automatic session termination |
| **Audit Logging** | Comprehensive activity logs | All access and modification events logged; logs retained for 1 year; tamper-resistant storage |
| **Data Minimization** | Purpose-limited collection | Only data necessary for conversion is collected; no unnecessary financial data is retained |
| **Pseudonymization** | Tokenization of identifiers | Internal user IDs are pseudonymized; database IDs are not traceable to real-world identity |
| **Network Security** | WAF, DDoS protection, VPC isolation | Web Application Firewall; DDoS mitigation; private subnets for databases and internal services |
| **Vulnerability Management** | Regular scanning and patching | Weekly automated vulnerability scans; monthly penetration testing; 24-hour critical patch SLA |
| **Incident Response** | 24/7 incident response capability | Documented incident response plan; trained response team; annual tabletop exercises |

### 6.2 Detailed Technical Measures

#### 6.2.1 Encryption

**At Rest (AES-256):**
- All user-uploaded PDF bank statements are encrypted at rest using AES-256-GCM
- Extracted transaction data is encrypted in the database at the row level
- User account data (passwords, tokens) uses bcrypt hashing with salt
- Database backups are encrypted with separate encryption keys
- Encryption keys are managed through a dedicated Key Management Service (KMS) with Hardware Security Module (HSM) backing

**In Transit (TLS 1.3):**
- All browser-to-platform communication uses TLS 1.3 with Perfect Forward Secrecy
- API communications enforce TLS 1.3 minimum
- Certificate pinning where applicable
- Regular TLS configuration audits using industry-standard tools

#### 6.2.2 Access Controls

| Control | Implementation |
|---------|---------------|
| **Authentication** | Passwordless authentication via magic links; optional MFA via TOTP or WebAuthn; SSO (SAML 2.0, OIDC) for enterprise |
| **Authorization** | Role-based access control with predefined roles (Admin, Accountant, Viewer); row-level security in database |
| **Client Portal Isolation** | Firm-specific data isolation; each firm's client data is logically separated; no cross-firm data access |
| **Staff Access** | Need-to-know principle; all staff access logged; privileged access requires managerial approval |
| **API Access** | API keys with scoped permissions; rate limiting; IP allowlisting available for enterprise |

#### 6.2.3 Audit Logging

Statementwise maintains comprehensive audit logs covering:

| Log Category | Events Captured | Retention |
|-------------|-----------------|-----------|
| **Authentication logs** | Login attempts (success/failure), MFA events, session creation/termination, password resets | 1 year |
| **Data access logs** | Who accessed what data, when, and from where; file downloads, data exports | 1 year |
| **Modification logs** | Data creation, updates, deletion events; account changes; permission changes | 1 year |
| **Administrative logs** | Staff actions on user accounts; system configuration changes | 1 year |
| **Security logs** | Firewall events, intrusion detection alerts, anomaly detection triggers | 1 year |

Logs are stored in tamper-resistant infrastructure with append-only access. Log integrity is verified through cryptographic checksums.

#### 6.2.4 Data Minimization

| Principle | Implementation |
|-----------|---------------|
| **Collection minimization** | We only request data necessary to provide the conversion service. Optional fields are clearly marked. |
| **Processing minimization** | AI extraction targets specific financial data fields only (amounts, dates, account numbers, descriptions). |
| **Retention minimization** | Data is automatically deleted at the end of the retention period (see Section 5.3). |
| **Purpose limitation** | Data is not used for purposes beyond those disclosed in this statement (Art. 5(1)(b) GDPR). |

#### 6.2.5 Pseudonymization

Where technically feasible, we apply pseudonymization measures (Art. 4(5) GDPR):

- **Internal identifiers:** All database references use pseudonymous IDs, not real-world identifiers
- **Logging:** Production logs use hashed identifiers where possible
- **Analytics:** Usage analytics are collected against pseudonymous IDs
- **AI processing:** Direct personal identifiers are not included in AI model training data

### 6.3 Organizational Measures

| Measure | Implementation |
|---------|---------------|
| **Data Protection by Design** | Privacy considerations are integrated into all product development through Privacy Impact Assessments at the design stage (Art. 25) |
| **Data Protection by Default** | New accounts have the most privacy-preserving settings enabled by default; data retention periods are set at the minimum |
| **Staff Training** | All staff complete annual GDPR and data protection training; developers receive specialized secure coding training |
| **Confidentiality Agreements** | All staff and contractors sign confidentiality and data processing agreements |
| **Access Reviews** | Quarterly review of all staff access rights; immediate revocation upon role change or termination |
| **Vendor Management** | All sub-processors are subject to due diligence assessments; annual security reviews; DPA requirements |
| **Business Continuity** | Disaster recovery plan with RPO of 1 hour and RTO of 4 hours; regular DR testing |
| **Data Retention Policy** | Automated deletion workflows enforce retention periods; quarterly audits of retention compliance |

### 6.4 Security Certifications and Assessments

| Standard | Status | Scope |
|----------|--------|-------|
| **ISO/IEC 27001** | Target: Q4 2025 | Information security management |
| **SOC 2 Type II** | Target: Q1 2026 | Security, availability, and confidentiality controls |
| **Penetration Testing** | Annual (external) + Quarterly (automated) | Full platform and infrastructure |
| **Vulnerability Scanning** | Weekly automated scans | All production systems and dependencies |

---

## 7. Data Breach Notification

Statementwise has established procedures to detect, assess, and report personal data breaches in compliance with Art. 33-34 GDPR.

### 7.1 Breach Detection

We employ the following mechanisms for breach detection:

| Mechanism | Implementation |
|-----------|---------------|
| **Automated monitoring** | 24/7 security event monitoring with anomaly detection |
| **Intrusion Detection System (IDS)** | Network and host-based IDS with real-time alerting |
| **Access anomaly detection** | Machine learning-based detection of unusual access patterns |
| **Employee reporting** | All staff trained to report suspected breaches immediately |
| **Third-party notifications** | Sub-processors contractually required to notify us of any breach within 24 hours |

### 7.2 Breach Assessment

Upon detection of a potential breach, our incident response team conducts an assessment using the following criteria:

| Factor | Assessment Question |
|--------|---------------------|
| **Nature of breach** | What type of breach occurred? (Confidentiality, Integrity, Availability) |
| **Data categories** | What categories of personal data are involved? |
| **Data subjects** | How many data subjects are potentially affected? |
| **Sensitivity** | What is the sensitivity level of the data? (Financial data has elevated sensitivity) |
| **Severity** | What is the potential impact on data subjects? (Discrimination, identity theft, financial loss, reputational damage) |
| **Likelihood of misuse** | How likely is it that the breach will result in harm to data subjects? |

### 7.3 Breach Classification

| Severity | Criteria | Response |
|----------|----------|----------|
| **Critical** | Large-scale breach of sensitive financial data; high risk to data subjects | Immediate escalation; DPO and management notified within 1 hour |
| **High** | Significant data exposure; moderate risk to data subjects | DPO notified within 4 hours; assessment within 12 hours |
| **Medium** | Limited data exposure; low risk to data subjects | DPO notified within 24 hours; assessment within 48 hours |
| **Low** | No personal data exposure; or exposure poses negligible risk | Logged and reviewed; no notification required |

### 7.4 Notification to Supervisory Authority (Art. 33)

Where a breach is likely to result in a risk to the rights and freedoms of natural persons:

| Timeline | Action |
|----------|--------|
| **Within 24 hours** | Breach detected and internal incident response activated |
| **Within 72 hours** | Notification submitted to the relevant supervisory authority |
| **Notification content** | Nature of breach; categories and approximate number of data subjects and records affected; likely consequences; measures taken or proposed |

The notification is submitted through the supervisory authority's prescribed channel. Where the 72-hour timeline cannot be met, the notification includes the reasons for the delay.

### 7.5 Notification to Data Subjects (Art. 34)

Where a breach is likely to result in a **high risk** to the rights and freedoms of natural persons:

| Timeline | Action |
|----------|--------|
| **Without undue delay** | Data subjects are directly notified of the breach |
| **Notification method** | Email to registered email address; or conspicuous notice on the platform if email is unavailable |
| **Notification content** | Clear and plain language description of the breach; DPO contact details; likely consequences; measures taken; steps data subjects should take |

**Exceptions to data subject notification (Art. 34(3)):**
- Where we have implemented appropriate technical protection measures (e.g., encryption) making the data unintelligible to unauthorized parties
- Where subsequent measures ensure the high risk is no longer likely to materialize
- Where individual notification would involve disproportionate effort (public communication may be used instead)

### 7.6 Breach Response Playbook

```
DETECTION → CONTAINMENT → ASSESSMENT → NOTIFICATION → REMEDIATION → REVIEW
     ↑                                                              |
     └──────────────────────────────────────────────────────────────┘
                          (Continuous Improvement)
```

| Phase | Actions | Responsible |
|-------|---------|-------------|
| **Detection** | Alert triggered; incident logged; initial triage | Security Operations |
| **Containment** | Isolate affected systems; revoke compromised credentials; preserve evidence | Incident Response Team |
| **Assessment** | Determine breach scope; classify severity; assess risk to data subjects | DPO + Incident Response Team |
| **Notification** | Notify supervisory authority (if required); notify data subjects (if required); document all decisions | DPO |
| **Remediation** | Fix root cause; restore systems; verify integrity; implement additional controls | Engineering + Security |
| **Review** | Post-incident review; update procedures; lessons learned | DPO + Management |

---

## 8. Data Protection Officer

### 8.1 DPO Appointment

Statementwise has appointed a **Data Protection Officer (DPO)** in accordance with Art. 37 GDPR. The DPO is responsible for overseeing our data protection strategy and ensuring compliance with GDPR.

Under Art. 37(1)(b), the appointment of a DPO is mandatory because our core activities consist of **large-scale processing of special categories of data** — while financial data is not formally a "special category," our processing of detailed financial information at scale, combined with the sensitive nature of banking data, warrants the appointment of a DPO as a matter of best practice and regulatory prudence.

### 8.2 DPO Details

| Attribute | Details |
|-----------|---------|
| **Name** | [Name to be appointed — contact via email below] |
| **Email** | dpo@statementwise.ai |
| **Postal Address** | Data Protection Officer, Statementwise.ai, [Address TBD] |
| **Reporting Line** | Reports directly to senior management; operates independently |

### 8.3 DPO Responsibilities

The DPO's responsibilities include (Art. 39 GDPR):

1. **Information and advice** — Informing and advising Statementwise and its employees of their obligations under GDPR
2. **Monitoring compliance** — Monitoring compliance with GDPR and our internal data protection policies
3. **Advice on DPIAs** — Providing advice regarding Data Protection Impact Assessments
4. **Cooperation with supervisory authorities** — Cooperating with supervisory authorities and acting as the contact point
5. **Data subject communication** — Serving as the primary contact for data subjects regarding their rights and privacy concerns
6. **Breach management** — Participating in breach assessment and notification procedures
7. **Policy development** — Contributing to the development and review of data protection policies

### 8.4 DPO Independence

The DPO operates with the independence required by Art. 38 GDPR:
- The DPO does not receive instructions regarding the exercise of their tasks
- The DPO reports directly to the highest management level
- The DPO is not dismissed or penalized for performing their duties
- The DPO may fulfill other tasks, provided there is no conflict of interest

---

## 9. Data Protection Impact Assessment (DPIA)

### 9.1 DPIA Requirement

Under Art. 35 GDPR, a Data Protection Impact Assessment is required where processing is likely to result in a high risk to the rights and freedoms of natural persons. Statementwise has conducted a DPIA for its core processing activities.

**DPIA triggers applicable to Statementwise (Art. 35(3) and WP248 guidelines):**

| Trigger | Applicability |
|---------|--------------|
| **Systematic and extensive evaluation** | Partially applicable — our AI extraction evaluates transaction data, though not for decision-making purposes |
| **Large-scale processing of special categories** | Applicable as a precaution — while financial data is not a special category, the sensitive nature of banking data warrants a DPIA |
| **Systematic monitoring** | Not applicable — we do not conduct systematic monitoring of data subjects |

### 9.2 DPIA Summary

| Field | Details |
|-------|---------|
| **DPIA Reference** | DPIA-2025-001 |
| **Date Completed** | July 2025 |
| **Review Date** | July 2026 (annual review) or upon material change |
| **Scope** | All processing activities related to the Statementwise bank statement conversion platform |
| **Assessment Team** | DPO, Head of Engineering, Legal Counsel |

### 9.3 Identified Risks and Mitigation Measures

| Risk ID | Risk Description | Likelihood | Severity | Residual Risk | Mitigation Measures |
|---------|-----------------|------------|----------|---------------|---------------------|
| **R1** | Unauthorized access to uploaded bank statements | Low | Critical | Low | AES-256 encryption at rest; TLS 1.3 in transit; RBAC; MFA; session management |
| **R2** | Data breach exposing financial data | Low | Critical | Low | Comprehensive security program; WAF; IDS; incident response; breach notification procedures |
| **R3** | Sub-processor (Moonshot AI) mishandles data | Low | High | Low | SCCs with Moonshot AI; DPA; transfer impact assessment; encryption in transit |
| **R4** | AI model hallucination or extraction errors leading to inaccurate data | Medium | Medium | Low | Data validation checks; user review step; no automated reliance on extracted data |
| **R5** | Retention period exceeded; data not deleted | Low | Medium | Low | Automated deletion workflows; quarterly retention audits |
| **R6** | International transfer risk (Moonshot AI in China) | Medium | High | Medium | SCCs 2021/914; transfer impact assessment; encryption; data minimization |
| **R7** | Data subject rights request not fulfilled within timeframe | Low | Medium | Low | Automated request tracking; DPO oversight; documented procedures |
| **R8** | Insider threat (staff misuse) | Low | High | Low | Background checks; least privilege; access logging; quarterly reviews |

### 9.4 DPIA Conclusion

The DPIA concludes that, with the mitigation measures in place, the residual risks to data subjects are **low to medium**. The processing can proceed subject to ongoing monitoring and annual review of the DPIA.

**Key residual risk:** International data transfer to Moonshot AI in China (Risk R6). This risk is actively managed through SCCs, encryption, and a detailed Transfer Impact Assessment (see Section 10). Statementwise is actively evaluating EU-based AI processing alternatives to eliminate this risk entirely.

### 9.5 DPIA Review

The DPIA is reviewed:
- **Annually** (as a minimum)
- Upon introduction of new processing activities or technologies
- Following any data breach or security incident
- When there is a change in legal or regulatory requirements

---

## 10. International Data Transfers

### 10.1 Transfer Overview

Statementwise primarily processes personal data within the **European Economic Area (EEA)**. However, certain sub-processors are located outside the EEA, requiring appropriate safeguards under Chapter V GDPR (Art. 44-49).

| Transfer | From | To | Mechanism |
|----------|------|-----|-----------|
| AI processing | EEA | China (Moonshot AI) | SCCs 2021/914 + Transfer Impact Assessment |
| Cloud hosting | EEA | EEA (EU-based provider) | Not applicable — intra-EEA |
| Payment processing | EEA | US (Stripe, Inc.) | Stripe's SCCs + Adequacy (DPDI Executive Order) |
| Email delivery | EEA | EU-based provider | Not applicable — intra-EEA |

### 10.2 Standard Contractual Clauses (SCCs)

For transfers to Moonshot AI in China, Statementwise has implemented the **EU Commission Implementing Decision 2021/914** — Standard Contractual Clauses for the transfer of personal data to third countries.

| SCC Parameter | Details |
|--------------|---------|
| **Module** | Module Two: Controller to Processor (Statementwise as Processor to Moonshot AI as Sub-processor) |
| **Module** | Module One: Controller to Controller (for direct user transfers, where applicable) |
| **Annex I** | Description of transfers: PDF bank statement content and metadata for AI extraction |
| **Annex II** | Technical and organizational measures as described in Section 6 of this statement |
| **Annex III** | List of sub-processors authorized by Moonshot AI |

### 10.3 Transfer Impact Assessment (TIA)

In accordance with the **Schrems II** judgment (C-311/18) and EDPB Recommendations 01/2020, Statementwise has conducted a Transfer Impact Assessment for data transfers to China.

| Assessment Factor | Findings |
|-------------------|----------|
| **Legal framework of destination country** | China has comprehensive data protection legislation (PIPL) but also extensive government surveillance powers under the Cybersecurity Law, National Security Law, and related regulations |
| **Access requests by public authorities** | Chinese authorities may request access to data under national security and cybersecurity laws |
| **Redress mechanisms** | Limited judicial redress for data subjects against government access in China |
| **Supplementary measures applied** | Encryption in transit (TLS 1.3); data minimization (only statement content, no user profiles); contractual commitments from Moonshot AI; 30-day retention limit |

**TIA Conclusion:** With the supplementary measures in place, the transfer is conducted with an essentially equivalent level of protection to that guaranteed within the EEA. However, this is a **dynamic assessment** — Statementwise monitors legal developments in China and will suspend transfers if the risk level changes materially.

### 10.4 Adequacy Decisions

Where sub-processors are located in countries with an **EU adequacy decision** under Art. 45 GDPR, no additional safeguards are required:

| Country | Adequacy Status | Applicability |
|---------|----------------|---------------|
| United Kingdom | Adequacy decision (2021/1771, extended) | Applicable if UK-based sub-processors are engaged |
| United States | Partial — DPF (Data Privacy Framework) + Executive Order 14086 | Stripe, Inc. is DPF certified |
| Switzerland | Adequacy decision | Applicable if Swiss sub-processors are engaged |
| Canada (commercial) | Partial adequacy (PIPEDA) | Limited applicability |

### 10.5 Future Transfers and EU Data Residency

Statementwise is committed to **data residency options** for EU users:

| Initiative | Timeline | Description |
|-----------|----------|-------------|
| **EU-only hosting** | Q4 2025 | Option for EU users to require all data processing within the EEA |
| **EU AI processing** | Q1 2026 (target) | Evaluation of EU-based AI extraction providers as alternative to Moonshot AI |
| **Data residency controls** | Q4 2025 | User-configurable data residency settings in account preferences |

---

## 11. Record of Processing Activities

In compliance with Art. 30 GDPR, Statementwise maintains a comprehensive Record of Processing Activities (ROPA). A summary is provided below.

### 11.1 Processing Activity Records

| Activity ID | Activity | Controller/Processor | Data Subjects | Data Categories | Recipients | Retention | Legal Basis |
|------------|----------|---------------------|---------------|-----------------|------------|-----------|-------------|
| PA-001 | Bank statement conversion | Controller (direct users) / Processor (client portal) | Platform users; accounting firm clients | Financial data; document data | Moonshot AI | 30 days | Art. 6(1)(b) |
| PA-002 | Account management | Controller | Platform users | Identity data; technical data | Hosting provider | Account duration + 90 days | Art. 6(1)(b) |
| PA-003 | Customer support | Controller | Platform users | All categories as necessary | Support team | 3 years | Art. 6(1)(b) |
| PA-004 | Platform security | Controller | Platform users | Technical data; usage data | Security team | 1 year | Art. 6(1)(f) |
| PA-005 | Service improvement | Controller | Platform users | Anonymized usage data | Product team | 90 days (anonymized) | Art. 6(1)(f) |
| PA-006 | Billing and payments | Controller | Platform users | Identity data; payment data | Stripe | 7 years | Art. 6(1)(b) |
| PA-007 | Marketing communications | Controller | Platform users | Identity data | Email provider | Until opt-out | Art. 6(1)(f) |

### 11.2 International Transfer Records

| Transfer ID | Data Exporter | Data Importer | Country | Mechanism | SCC Reference | TIA Reference |
|------------|--------------|--------------|---------|-----------|---------------|---------------|
| TR-001 | Statementwise | Moonshot AI | China | SCCs 2021/914 | SCC-2025-001 | TIA-2025-001 |
| TR-002 | Statementwise | Stripe, Inc. | United States | DPF certification | N/A | N/A |

---

## 12. Contact and Updates

### 12.1 Contact Information

| Role | Contact |
|------|---------|
| **Data Protection Officer** | dpo@statementwise.ai |
| **General Inquiries** | privacy@statementwise.ai |
| **Support** | support@statementwise.ai |
| **Postal Address** | Statementwise.ai, [Address TBD] |

### 12.2 Changes to This Statement

We may update this GDPR Compliance Statement from time to time to reflect changes in our processing activities, legal requirements, or business operations.

| Change Type | Notification |
|-------------|-------------|
| **Material changes** (new processing purposes, new sub-processors, extended retention) | Email notification at least 30 days in advance; updated version published on our website |
| **Minor changes** (clarifications, formatting, non-material corrections) | Updated version published on our website; effective date updated |
| **Legal requirement changes** | Immediate update as required by law |

### 12.3 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | July 2025 | Initial release |

---

## Appendices

### Appendix A: Glossary of Terms

See definitions in Section 1.2.

### Appendix B: Sub-Processor Details

For detailed sub-processor information, see `/docs/SUB_PROCESSORS.md`.

### Appendix C: Data Processing Agreement

For the standard Data Processing Agreement, see `/docs/DATA_PROCESSING_AGREEMENT.md`.

### Appendix D: Privacy Policy

For the full Privacy Policy, see `/docs/PRIVACY_POLICY.md`.

---

*This document was prepared in accordance with Regulation (EU) 2016/679 (GDPR), the UK Data Protection Act 2018, and the EDPB Guidelines on Data Protection Officers, Data Protection Impact Assessment, and International Data Transfers. It should be reviewed by qualified legal counsel before final publication.*
