# Security Policy

## Statementwise.ai Security Documentation

This document outlines the security policies, vulnerability disclosure procedures, and security practices for the Statementwise.ai application.

---

## Supported Versions

The following versions are currently supported with security updates:

| Version | Supported          |
|---------|-------------------|
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Features

### Implemented Protections

The following security measures are implemented in this application:

1. **Content Security Policy (CSP)** - Strict CSP header to prevent XSS, clickjacking, and code injection
2. **X-Frame-Options** - Anti-clickjacking protection (DENY)
3. **X-Content-Type-Options** - MIME-type sniffing prevention (nosniff)
4. **Referrer-Policy** - Limited referrer information sharing
5. **Permissions-Policy** - Restricted browser feature access
6. **Cache-Control** - No-store directives for sensitive pages
7. **Source Map Disabling** - Production builds exclude source maps
8. **Dev Plugin Isolation** - Development plugins excluded from production builds
9. **Code Splitting** - Route-based code splitting for isolation
10. **Terser Minification** - Console/debugger statements removed in production

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do Not Open a Public Issue

Please **do not** create a public GitHub issue for security vulnerabilities. This could expose the vulnerability to malicious actors before it can be fixed.

### 2. Report Privately

Send your vulnerability report to our security team:

- **Email:** [security@statementwise.ai](mailto:security@statementwise.ai)
- **Response Time:** Within 48 hours (business days)
- **Resolution Target:** Within 14 days for critical vulnerabilities

### 3. Include the Following Information

Your report should include:

- **Description:** Clear description of the vulnerability
- **Severity:** Your assessment of impact (Critical/High/Medium/Low)
- **Steps to Reproduce:** Detailed steps to reproduce the issue
- **Affected Components:** Which files, routes, or features are affected
- **Proof of Concept:** If applicable, include a minimal demonstration
- **Suggested Fix:** If you have one, suggest how to remediate

### 4. Our Commitment

We commit to:

- Acknowledge receipt of your report within 48 hours
- Provide a timeline for the fix within 7 days
- Notify you when the vulnerability is fixed
- Credit you in our security advisory (unless you prefer anonymity)
- Not take legal action against researchers who act in good faith

### 5. Disclosure Timeline

We follow a responsible disclosure policy:

1. **Day 0:** Vulnerability reported
2. **Day 2:** Acknowledgment sent to reporter
3. **Day 7:** Fix timeline communicated
4. **Day 14:** Target fix date for critical/high severity
5. **Day 30:** Target fix date for medium severity
6. **Post-Fix:** Public disclosure after 90 days or with mutual agreement

---

## Security Best Practices for Users

### Account Security

- Use strong, unique passwords (minimum 12 characters)
- Enable multi-factor authentication (MFA) when available
- Do not share your API keys with anyone
- Rotate API keys every 90 days
- Report suspicious activity immediately

### Data Handling

- Bank statement PDFs contain sensitive financial data - handle with care
- Always use HTTPS when accessing the application
- Do not upload statements containing highly sensitive data to untrusted environments
- Clear browser cache after using shared/public computers
- Use the "zero data retention" option if available for sensitive documents

### API Usage

- Store API keys securely (use environment variables, never hardcode)
- Use API keys with the minimum required permissions
- Monitor API usage for unexpected activity
- Revoke compromised keys immediately from the dashboard

---

## Known Security Considerations

### Client-Side Application

This is a client-side rendered React application. As such:

- All code is visible in the browser - never include secrets in the bundle
- Client-side validation can be bypassed - always validate server-side
- The application currently uses mock data for demonstration purposes
- When the backend API is integrated, all sensitive operations will be server-side

### Financial Data

- Bank statement data is processed client-side only in the current implementation
- When API integration is added, all financial data will be transmitted over TLS 1.2+
- File uploads will be encrypted in transit
- Consider encrypting files before upload for additional security

### Third-Party Dependencies

We regularly audit dependencies for known vulnerabilities:
- Run `npm audit` before each release
- Use automated dependency scanning in CI/CD
- Monitor security advisories for critical dependencies

---

## Security.txt

For machine-readable security contact information, see:

```
https://statementwiseai.com/.well-known/security.txt
```

Or in the repository: `public/.well-known/security.txt`

---

## Acknowledgments

We thank the following security researchers who have responsibly disclosed vulnerabilities:

*(This list will be updated as reports are received)*

---

## License

This security policy is provided under the same license as the Statementwise.ai project.

---

*Last updated: 2026-05-11*
