# Stripe and Google Ads Production Setup

## Stripe

Create live Stripe subscription prices that match the pricing page:

| Plan | Monthly price ID env | Annual price ID env | Credits granted per paid invoice |
|------|----------------------|---------------------|----------------------------------|
| Pro | `STRIPE_PRICE_PRO_MONTHLY_ID` | `STRIPE_PRICE_PRO_ANNUAL_ID` | 2,000 |
| Business | `STRIPE_PRICE_BUSINESS_MONTHLY_ID` | `STRIPE_PRICE_BUSINESS_ANNUAL_ID` | 10,000 |

Railway backend variables required before enabling billing:

```text
ENABLE_BILLING=true
FRONTEND_URL=https://www.statementwiseai.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY_ID=price_...
STRIPE_PRICE_PRO_ANNUAL_ID=price_...
STRIPE_PRICE_BUSINESS_MONTHLY_ID=price_...
STRIPE_PRICE_BUSINESS_ANNUAL_ID=price_...
```

Stripe webhook endpoint:

```text
https://statementwise-production.up.railway.app/v1/billing/stripe/webhook
```

Subscribe the endpoint to:

```text
checkout.session.completed
invoice.paid
customer.subscription.deleted
```

Keep `ENABLE_BILLING=false` until the webhook has been created, the live price IDs are set, and a real checkout test has confirmed credits are granted from `invoice.paid`.

## Google Ads

Vercel frontend variables:

```text
VITE_ENABLE_GOOGLE_ADS=true
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL=...
VITE_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL=...
VITE_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL=...
```

Google Ads only loads after the visitor accepts Marketing cookies. The app tracks:

| Conversion | Trigger |
|------------|---------|
| Signup | Successful account registration |
| Begin checkout | Stripe checkout session starts |
| Purchase | Return to `/dashboard?checkout=success` |

After adding Vercel env vars, redeploy the frontend and verify conversion diagnostics in Google Ads.
