# Statementwise Go-Live Runbook

Use this as the release gate before enabling paid signups.

## Hard Blocks

- Vercel deploys the latest `main` commit successfully.
- Backend is deployed with `ENV=production` and passes startup config validation.
- `npm run build`, `npm run lint`, and `npm run go-live:check` pass.
- `GO_LIVE_ENV_CHECK=1 npm run go-live:check` passes in the production secret environment.
- A real upload, conversion, export, account login, and Stripe checkout flow have been tested end to end.
- A user cannot access another user's conversion, export, portal, or billing data by changing IDs.
- Uploaded PDFs and exports are private, encrypted at rest, served only through short-lived signed URLs, and deleted according to the retention policy.
- Privacy Policy, Terms, DPA, Subprocessor list, Cookie Policy, refund terms, and support contact are live and accurate.

## Production Secrets

Set these in the backend host secret manager, not in source control:

- `SECRET_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `MOONSHOT_API_KEY`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC_ID`
- `STRIPE_PRICE_PRO_ID`

Set these in Vercel:

- `VITE_APP_ENV=production`
- `VITE_API_BASE_URL=https://api.statementwiseai.com/v1`
- `VITE_API_URL=https://api.statementwiseai.com/v1`
- Optional `VITE_SENTRY_DSN`

## Smoke Test

1. Create a new account.
2. Buy or assign credits.
3. Upload a known-good PDF bank statement.
4. Confirm status moves to completed or returns a useful failure.
5. Export CSV/XLSX and verify the download URL expires.
6. Try the same conversion ID from another account and confirm it returns 404/403.
7. Cancel a paid plan and confirm entitlement is removed.
8. Delete account or conversion data and confirm the data is no longer retrievable.

## Monitoring

- Configure backend uptime checks for `/health`.
- Configure frontend and backend error tracking.
- Alert on elevated 4xx/5xx rates, failed Stripe webhooks, failed conversions, storage errors, and auth failures.
- Keep an incident-response contact and escalation path visible to the team.
