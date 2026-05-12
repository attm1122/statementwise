# Cookie Policy

**Statementwise.ai** | **Effective Date:** July 2025 | **Version:** 1.0

---

> This Cookie Policy explains how Statementwise.ai ("**Statementwise**", "**we**", "**us**", or "**our**") uses cookies and similar tracking technologies on our website and platform. This policy should be read alongside our [Privacy Policy](/docs/PRIVACY_POLICY.md) and [GDPR Compliance Statement](/docs/GDPR_COMPLIANCE.md).

---

## Table of Contents

1. [What Are Cookies?](#1-what-are-cookies)
2. [Legal Basis for Using Cookies](#2-legal-basis-for-using-cookies)
3. [Types of Cookies We Use](#3-types-of-cookies-we-use)
4. [Detailed Cookie List](#4-detailed-cookie-list)
5. [Cookie Consent Mechanism](#5-cookie-consent-mechanism)
6. [How to Manage Your Cookie Preferences](#6-how-to-manage-your-cookie-preferences)
7. [Third-Party Cookies](#7-third-party-cookies)
8. [Cookie Retention Periods](#8-cookie-retention-periods)
9. [Do Not Track Signals](#9-do-not-track-signals)
10. [Cookie Policy Updates](#10-cookie-policy-updates)
11. [Contact Us](#11-contact-us)

---

## 1. What Are Cookies?

### 1.1 Definition

Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work efficiently, improve user experience, and provide information to website owners.

### 1.2 Similar Technologies

In addition to cookies, we use the following similar technologies:

| Technology | Description |
|-----------|-------------|
| **Local Storage** | Stores data in your browser with no expiration date; persists until manually deleted |
| **Session Storage** | Stores data for the duration of your browser session; deleted when the tab/window is closed |
| **Pixel Tags (Web Beacons)** | Small, invisible images that help us understand how users interact with our emails and pages |
| **Fingerprinting** | We **do not** use browser fingerprinting or device fingerprinting |

### 1.3 How Cookies Work

When you visit our website, your browser sends a request to our server. Our server may respond by setting a cookie on your device. On subsequent visits, your browser sends the cookie back to our server, allowing us to recognize your device and remember your preferences.

### 1.4 First-Party vs. Third-Party Cookies

| Type | Description | Used by Statementwise? |
|------|-------------|----------------------|
| **First-party cookies** | Set by our website (statementwise.ai) directly | Yes — all essential, functional, and analytics cookies |
| **Third-party cookies** | Set by domains other than statementwise.ai | No — we do not use third-party advertising or tracking cookies |

---

## 2. Legal Basis for Using Cookies

### 2.1 GDPR and ePrivacy Compliance

We comply with the **ePrivacy Directive 2002/58/EC** (as amended by Directive 2009/136/EC) and the **General Data Protection Regulation (GDPR)** in our use of cookies.

### 2.2 Consent Requirements

| Cookie Category | Legal Basis | Consent Required? |
|-----------------|-------------|-------------------|
| **Essential (Strictly Necessary)** | Art. 6(1)(f) — Legitimate interest (or Art. 5(3) ePrivacy exemption) | No — exempt from consent requirement |
| **Functional** | Art. 6(1)(f) — Legitimate interest | No — can be placed based on legitimate interest; opt-out available |
| **Analytics** | Art. 6(1)(a) — Consent | **Yes** — explicit opt-in required before placement |

### 2.3 Consent Standards

For cookies requiring consent, we adhere to the following standards:

| Requirement | Implementation |
|-------------|---------------|
| **Freely given** | Consent is optional; users can access the site without accepting non-essential cookies |
| **Specific** | Users can consent to each cookie category individually |
| **Informed** | Clear information about each cookie's purpose is provided before consent |
| **Unambiguous** | Consent is expressed by a clear affirmative action (clicking "Accept" or toggling on) |
| **Withdrawable** | Users can withdraw consent at any time with equal ease |
| **Documented** | Consent preferences are recorded and timestamped |

---

## 3. Types of Cookies We Use

We use three categories of cookies, as summarized below:

| Category | Purpose | Consent Required? | Can Be Blocked? |
|----------|---------|-------------------|-----------------|
| **Essential** | Necessary for the website and platform to function; enable core features like security, authentication, and session management | No | No — blocking will prevent use of the service |
| **Functional** | Enable enhanced functionality and personalization; remember your preferences and settings | No (opt-out available) | Yes, but may reduce functionality |
| **Analytics** | Help us understand how visitors use our website and platform; used for service improvement | Yes (opt-in required) | Yes, with no impact on service functionality |

### 3.1 Essential Cookies

Essential cookies are strictly necessary for the operation of our website and platform. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies because the service cannot function without them.

**Why we need them:**
- To authenticate your login and maintain your session
- To prevent cross-site request forgery (CSRF) attacks
- To remember your cookie consent preferences
- To route your requests to the correct server (load balancing)

### 3.2 Functional Cookies

Functional cookies enable enhanced features and personalization. They may be set by us to remember your preferences and provide a more tailored experience.

**Why we use them:**
- To remember your language preference
- To remember your display and UI preferences
- To recall your recently used export formats
- To maintain your accessibility settings

### 3.3 Analytics Cookies

Analytics cookies help us understand how visitors interact with our website and platform. We use this information to improve our service, identify issues, and develop new features.

**Why we use them:**
- To understand which features are most used
- To identify usability issues and navigation problems
- To measure the effectiveness of our content
- To improve the overall user experience

**Important:** We use **self-hosted, privacy-preserving analytics**. We do **not** use Google Analytics, Adobe Analytics, or any third-party analytics service that shares data with external parties. All analytics data is processed on our own infrastructure.

---

## 4. Detailed Cookie List

### 4.1 Essential Cookies

The following cookies are essential for the operation of our service and cannot be disabled:

| Cookie Name | Provider | Purpose | Duration | Type |
|------------|----------|---------|----------|------|
| `sw_session_id` | Statementwise | Maintains your authenticated session; associates your browser with your account | Session | HTTP-only, Secure |
| `sw_csrf_token` | Statementwise | Prevents cross-site request forgery attacks; validates form submissions | Session | HTTP-only, Secure, SameSite=Strict |
| `sw_auth_token` | Statementwise | Secure authentication token for API requests | 15 minutes | HTTP-only, Secure, SameSite=Strict |
| `sw_refresh_token` | Statementwise | Used to obtain a new authentication token when the current one expires | 7 days | HTTP-only, Secure, SameSite=Strict |
| `cookie_consent` | Statementwise | Records your cookie consent preferences to avoid showing the banner repeatedly | 1 year | Secure, SameSite=Strict |
| `cookie_consent_timestamp` | Statementwise | Records when you last set your cookie preferences | 1 year | Secure, SameSite=Strict |
| `sw_device_id` | Statementwise | Identifies your device for security purposes (fraud detection) | 1 year | HTTP-only, Secure |

**Total essential cookies:** 7

### 4.2 Functional Cookies

The following functional cookies enhance your experience. They are enabled by default but can be disabled:

| Cookie Name | Provider | Purpose | Duration | Type |
|------------|----------|---------|----------|------|
| `sw_language` | Statementwise | Remembers your preferred language (e.g., English, German, French) | 1 year | Secure, SameSite=Strict |
| `sw_display_mode` | Statementwise | Remembers your display preferences (light/dark mode, compact/expanded view) | 1 year | Secure, SameSite=Strict |
| `sw_recent_formats` | Statementwise | Stores your recently used export formats for quick access | 30 days | Secure, SameSite=Strict |
| `sw_dashboard_layout` | Statementwise | Remembers your client portal dashboard layout and widget preferences | 1 year | Secure, SameSite=Strict |
| `sw_announcement_dismissed` | Statementwise | Tracks which announcements you have dismissed to avoid repeated display | 30 days | Secure, SameSite=Strict |

**Total functional cookies:** 5

### 4.3 Analytics Cookies (Opt-in Required)

The following analytics cookies are **disabled by default** and will only be set if you explicitly opt in:

| Cookie Name | Provider | Purpose | Duration | Type |
|------------|----------|---------|----------|------|
| `sw_analytics_session` | Statementwise (self-hosted) | Anonymous session identifier for tracking page views and feature usage (pseudonymized) | 90 days | Secure, SameSite=Strict |
| `sw_feature_usage` | Statementwise (self-hosted) | Tracks which platform features are used (anonymized, aggregated) | 90 days | Secure, SameSite=Strict |
| `sw_performance_metrics` | Statementwise (self-hosted) | Collects anonymized performance data (page load times, error rates) | 90 days | Secure, SameSite=Strict |
| `sw_conversion_funnel` | Statementwise (self-hosted) | Tracks user journey through the conversion process (anonymized) | 90 days | Secure, SameSite=Strict |

**Total analytics cookies:** 4

### 4.4 Cookie Summary

| Category | Cookie Count | Default Status | Consent Required |
|----------|-------------|----------------|-------------------|
| Essential | 7 | Always active | No (cannot be disabled) |
| Functional | 5 | Active | No (can be opted out) |
| Analytics | 4 | Inactive | Yes (opt-in required) |
| **Total** | **16** | | |

---

## 5. Cookie Consent Mechanism

### 5.1 Consent Banner

When you first visit our website, you will see a cookie consent banner at the bottom of the page:

```
+------------------------------------------------------------------+
|                                                                    |
|  We use cookies to enhance your experience. Essential cookies     |
|  are always active. You can choose to enable analytics cookies    |
|  to help us improve our service.                                   |
|                                                                    |
|  [Accept All]  [Reject Non-Essential]  [Customize]  [Read More]  |
|                                                                    |
+------------------------------------------------------------------+
```

### 5.2 Consent Options

| Button | Effect |
|--------|--------|
| **"Accept All"** | Enables all cookie categories (essential, functional, and analytics) |
| **"Reject Non-Essential"** | Enables only essential cookies; functional and analytics cookies remain disabled |
| **"Customize"** | Opens a detailed preference panel allowing granular control over each category |
| **"Read More"** | Links to this Cookie Policy |

### 5.3 Customization Panel

The customization panel allows you to toggle individual cookie categories:

```
+------------------------------------------------------+
| Cookie Preferences                                    |
+------------------------------------------------------+
| [Always On] Essential Cookies                       |
| These cookies are required for the website to work.  |
| Cannot be disabled.                                  |
+------------------------------------------------------+
| [Toggle ON/OFF] Functional Cookies                  |
| Remember your preferences and settings.              |
+------------------------------------------------------+
| [Toggle ON/OFF] Analytics Cookies                   |
| Help us improve our service (anonymous data only).   |
+------------------------------------------------------+
|                                                      |
| [Save Preferences]  [Cancel]                        |
+------------------------------------------------------+
```

### 5.4 Consent Recording

When you make a cookie consent choice, we record:

| Element | Purpose |
|---------|---------|
| Your cookie preferences (which categories are enabled/disabled) | To apply your preferences across visits |
| Timestamp of your consent decision | To demonstrate compliance and know when to re-request consent |
| Your IP address (anonymized — last octet removed) | For fraud prevention and compliance verification |
| Browser and device type (general category only) | To ensure the consent mechanism works correctly |

### 5.5 Consent Refresh

We will re-request your consent:
- **Every 12 months** — even if you previously accepted all cookies
- **When we add a new cookie category** — we will show the banner again to inform you
- **When you clear your browser cookies** — your preferences will be lost
- **When our cookie policy changes materially** — to ensure you are informed

### 5.6 Granular Consent

Our consent mechanism supports **granular consent** in accordance with GDPR requirements:

- You can accept or reject each cookie category independently
- You are not required to accept non-essential cookies to use our service
- Pre-ticked boxes are **not** used for any non-essential cookies
- Accepting one category does not automatically accept others

---

## 6. How to Manage Your Cookie Preferences

### 6.1 Via Our Website

You can change your cookie preferences at any time:

1. Click "**Cookie Settings**" in the footer of any page on our website
2. Adjust the toggles for each cookie category
3. Click "**Save Preferences**"

### 6.2 Via Your Browser

You can also manage cookies through your browser settings:

| Browser | How to Manage Cookies |
|---------|----------------------|
| **Google Chrome** | Settings > Privacy and security > Cookies and other site data |
| **Mozilla Firefox** | Settings > Privacy & Security > Cookies and Site Data |
| **Apple Safari** | Preferences > Privacy > Manage Website Data |
| **Microsoft Edge** | Settings > Cookies and site permissions > Manage and delete cookies |
| **Brave** | Settings > Shields > Cookie blocking |
| **Opera** | Settings > Privacy & security > Cookies |

### 6.3 Browser Controls

Most browsers allow you to:
- **Block all cookies** — prevent any website from setting cookies
- **Delete existing cookies** — remove cookies that have already been set
- **Block third-party cookies** — only allow first-party cookies
- **Send Do Not Track signals** — inform websites that you do not want to be tracked

> **Warning:** If you block all cookies, you will not be able to log in or use the Statementwise platform. At minimum, you must allow essential cookies for the service to function.

### 6.4 Industry Opt-Out Tools

You can also use industry opt-out tools:

| Tool | URL | Description |
|------|-----|-------------|
| Your Online Choices (EU) | http://www.youronlinechoices.eu | Manage preferences for online behavioral advertising |
| Network Advertising Initiative | http://www.networkadvertising.org/choices | Opt out of targeted advertising |
| Digital Advertising Alliance | http://www.aboutads.info/choices | Opt out of interest-based advertising |

> **Note:** Statementwise does not engage in behavioral advertising, so these tools will have limited effect on our site. They are provided for general information.

---

## 7. Third-Party Cookies

### 7.1 Our Policy on Third-Party Cookies

**Statementwise does not use third-party cookies** for advertising, tracking, or analytics purposes. All cookies we set are first-party cookies served from our own domain (statementwise.ai).

### 7.2 Payment Processing (Stripe)

Our payment processor, Stripe, may set cookies on the payment pages:

| Cookie Source | Purpose | Control |
|--------------|---------|---------|
| Stripe (stripe.com) | Fraud prevention, payment processing, PCI DSS compliance | Stripe's cookies are governed by Stripe's own cookie policy and are necessary for payment security |

Stripe's cookies are only set on payment pages and are not used for tracking or advertising.

### 7.3 Authentication Providers

If your organization uses Single Sign-On (SSO):

| Cookie Source | Purpose | Control |
|--------------|---------|---------|
| Your Identity Provider (e.g., Okta, Azure AD) | Authentication session management | Governed by your organization's policies |

---

## 8. Cookie Retention Periods

| Cookie Category | Maximum Retention | Renewal |
|----------------|-------------------|---------|
| Essential (session) | Duration of browser session | Renewed with each visit |
| Essential (persistent) | Up to 1 year | Renewed with each visit if still required |
| Functional | 30 days to 1 year | Renewed with each visit |
| Analytics | 90 days | Not renewed after 90 days unless consent reaffirmed |
| Consent records | 1 year | Updated when consent is reaffirmed |

---

## 9. Do Not Track Signals

### 9.1 Our Response to DNT

Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Statementwise respects DNT signals as follows:

| DNT Setting | Effect |
|-------------|--------|
| **DNT enabled** | Analytics cookies will not be set (treated as if you rejected analytics) |
| **DNT disabled or not set** | Normal cookie consent banner behavior applies |

### 9.2 Global Privacy Control

We also respect the **Global Privacy Control (GPC)** signal:

| GPC Signal | Effect |
|------------|--------|
| **GPC enabled** | Non-essential cookies (functional and analytics) are disabled by default |
| **GPC disabled or not set** | Normal cookie consent banner behavior applies |

---

## 10. Cookie Policy Updates

### 10.1 Changes to This Policy

We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices.

### 10.2 Notification of Changes

| Change Type | Notification |
|-------------|-------------|
| **Material changes** (new cookie categories, new third-party cookies) | Email notification and updated cookie consent banner |
| **Minor changes** (clarifications, formatting) | Website notice with updated effective date |
| **New cookies added** | Cookie consent banner will be re-displayed to obtain fresh consent |

### 10.3 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | July 2025 | Initial release |

---

## 11. Contact Us

If you have any questions about our use of cookies, please contact us:

| Department | Contact |
|------------|---------|
| **Data Protection Officer** | dpo@statementwise.ai |
| **Privacy Inquiries** | privacy@statementwise.ai |
| **General Support** | support@statementwise.ai |
| **Postal Address** | Statementwise.ai, [Address TBD] |

We will respond to your inquiry within **2 business days**.

---

## Appendix A: Quick Reference

### At a Glance

| Question | Answer |
|----------|--------|
| How many cookies do we use? | 16 total (7 essential, 5 functional, 4 analytics) |
| Do we use third-party tracking cookies? | No |
| Do we use advertising cookies? | No |
| Do we sell cookie data? | No |
| Is consent required for analytics? | Yes — explicit opt-in |
| Can you use our service without accepting non-essential cookies? | Yes |
| How often do we refresh consent? | Every 12 months, or when categories change |
| Do we respect Do Not Track? | Yes |
| Do we respect Global Privacy Control? | Yes |
| Who can you contact about cookies? | dpo@statementwise.ai |

### How to Clear Cookies

| Browser | Steps |
|---------|-------|
| Chrome | Settings > Privacy and security > Clear browsing data > Cookies and other site data |
| Firefox | Settings > Privacy & Security > Clear Data > Cookies and Site Data |
| Safari | Preferences > Privacy > Manage Website Data > Remove All |
| Edge | Settings > Privacy, search, and services > Clear browsing data > Cookies |

---

*This Cookie Policy was prepared in accordance with Regulation (EU) 2016/679 (GDPR), Directive 2002/58/EC (ePrivacy Directive), and the EDPB Guidelines on consent. It should be reviewed by qualified legal counsel before final publication.*

*Version 1.0 — July 2025*
