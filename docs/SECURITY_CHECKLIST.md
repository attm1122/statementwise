# Production Security Checklist

## Statementwise.ai — Pre-Deployment Security Verification

This checklist must be completed before each production deployment.

---

## 1. SSL/TLS Configuration

- [ ] HTTPS enforced on all endpoints (HSTS header)
- [ ] TLS 1.2 minimum (TLS 1.3 preferred)
- [ ] Valid SSL certificate from trusted CA
- [ ] Certificate expiry monitored (>30 days remaining)
- [ ] HTTP Strict Transport Security (HSTS) enabled:
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  ```

## 2. Security Headers Verification

Verify the following headers are present on all responses:

| Header | Expected Value | Status |
|---|---|---|
| Content-Security-Policy | `default-src 'self'; script-src 'self';` | [ ] |
| X-Content-Type-Options | `nosniff` | [ ] |
| X-Frame-Options | `DENY` | [ ] |
| Referrer-Policy | `strict-origin-when-cross-origin` | [ ] |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | [ ] |
| Cross-Origin-Opener-Policy | `same-origin` | [ ] |
| Cross-Origin-Resource-Policy | `same-origin` | [ ] |

Test: `curl -I https://app.statewise.ai` and verify all headers present.

## 3. Dependency Scanning

- [ ] Run `npm audit` — zero critical/high vulnerabilities
- [ ] Run `npm outdated` — review outdated packages
- [ ] Verify `package-lock.json` committed and in sync
- [ ] Snyk scan passing (no high/critical issues)
- [ ] Dependabot alerts reviewed and addressed

```bash
npm audit --audit-level=moderate
# Expected: found 0 vulnerabilities
```

## 4. Build Verification

- [ ] Production build succeeds without errors: `npm run build`
- [ ] No source maps exposed in production
- [ ] No `console.log` statements in production code
- [ ] React DevTools disabled (`__REACT_DEVTOOLS_GLOBAL_HOOK__` undefined)
- [ ] Environment variables validated (no dev values in production)

```bash
npm run build
# Verify: dist/ contains minified, no .map files
```

## 5. Authentication & Session

- [ ] Session timeout working (30 min inactivity)
- [ ] Session warning displayed at 25 minutes
- [ ] Auto-logout clears all storage
- [ ] CSRF tokens validated on POST/PUT/DELETE
- [ ] Brute force lockout activates after 5 attempts
- [ ] Password policy enforced (8+ chars, complexity)

## 6. Encryption Verification

- [ ] AES-256-GCM key derivation uses PBKDF2 with >= 100,000 iterations
- [ ] localStorage values are encrypted (not plaintext JSON)
- [ ] Session encryption key stored in memory only (never localStorage)
- [ ] IV is unique per encryption operation
- [ ] Authentication tag (GCM) verified on decryption

```javascript
// Verify in browser console:
Object.keys(localStorage).filter(k => k.startsWith('sw_enc_'))
// Values should be base64-encoded ciphertext, not plaintext
```

## 7. Input Validation

- [ ] File upload: PDF magic bytes verified (%PDF)
- [ ] File upload: Max 10MB enforced
- [ ] Filename: Path traversal characters removed
- [ ] Email: RFC 5322 validation + length limits
- [ ] Password: Complexity requirements enforced
- [ ] URL: SSRF protection (no private IPs/localhost)
- [ ] Search queries: XSS payloads escaped

## 8. Audit Logging

- [ ] All login attempts logged (success + failure)
- [ ] All file uploads logged with SHA-256 hash
- [ ] All exports logged with row count
- [ ] Access denials logged with reason
- [ ] Rate limit triggers logged
- [ ] No PII in logs (verify with sample events)
- [ ] Logs sent to backend endpoint (`/api/security/log`)

## 9. Rate Limiting

| Endpoint | Limit | Window | Status |
|---|---|---|---|
| File Upload | 5 | 60 seconds | [ ] |
| Export | 10 | 60 seconds | [ ] |
| API Calls | 60 | 60 seconds | [ ] |
| Login | 5 | 60 seconds | [ ] |

Verify: Send requests exceeding limits and confirm 429 responses.

## 10. RBAC Verification

| Route | Required Role | Test | Status |
|---|---|---|---|
| `/dashboard` | `individual`, `firm`, `admin` | Block `viewer` | [ ] |
| `/portal` | `firm`, `admin` | Block `client` | [ ] |
| `/convert` | Any authenticated | Block anonymous | [ ] |

## 11. Code Signing & Integrity

- [ ] Git commits signed with GPG (`git log --show-signature`)
- [ ] CI pipeline validates signatures
- [ ] `package-lock.json` hash verified in CI
- [ ] Build artifacts signed (if applicable)

## 12. Penetration Testing Requirements

Before production release:

- [ ] OWASP ZAP automated scan (no high/critical alerts)
- [ ] Manual XSS testing (reflected, stored, DOM-based)
- [ ] CSRF testing (validate token enforcement)
- [ ] Authentication bypass attempts
- [ ] Session fixation testing
- [ ] Rate limiting bypass attempts
- [ ] File upload bypass attempts (double extension, null byte)
- [ ] SSRF testing (internal resource access)

## 13. Monitoring & Alerting

- [ ] Security event dashboard configured
- [ ] Critical alerts routed to on-call (PagerDuty/OpsGenie)
- [ ] Failed login spike alerts (>10/minute)
- [ ] Upload anomaly alerts (>100/hour)
- [ ] Rate limit trigger alerts (>50/hour)
- [ ] Session hijacking detection active

## 14. Incident Response

- [ ] Security incident runbook documented
- [ ] Emergency contact list current
- [ ] Kill switch for authentication (force global logout)
- [ ] Database backup verified (point-in-time recovery)
- [ ] Rollback procedure tested (<15 minutes)

## 15. Environment-Specific Checks

### Production Only
- [ ] `NODE_ENV=production` set
- [ ] Debug logging disabled (`includeDebugInfo: false`)
- [ ] Source maps not served
- [ ] Error pages don't leak stack traces
- [ ] HTTPS-only (no HTTP fallback)

### Pre-Production (Staging)
- [ ] Same security headers as production
- [ ] Test credentials isolated from production
- [ ] No production data in staging

## 16. Post-Deployment Verification

After deployment to production:

- [ ] Verify all security headers with `curl`
- [ ] Test login/logout flow
- [ ] Test file upload with invalid file
- [ ] Test rate limiting (rapid requests)
- [ ] Verify encrypted storage in localStorage
- [ ] Check audit logs are received by backend
- [ ] Monitor error rates (should be baseline)
- [ ] Monitor for unexpected 403/401 spikes

---

## Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Security Engineer | | | |
| DevOps Lead | | | |
| Product Manager | | | |
| QA Lead | | | |

---

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP ASVS 4.0](https://github.com/OWASP/ASVS)
- [CWE Top 25 2025](https://cwe.mitre.org/top25/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
