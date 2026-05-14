"""Billing router: credits, subscriptions, invoices."""

import asyncio
from datetime import datetime, timezone, timedelta
from decimal import Decimal

import stripe
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from core.config import get_settings
from core.database import get_db
from core.auth import get_current_user
from models.credit import Credit, CreditTransaction, CreditTransactionType
from models.user import User

settings = get_settings()
router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────

class PurchaseCreditsRequest(BaseModel):
    amount: int = Field(..., ge=10, le=10000)
    payment_method: str = "stripe"


class CheckoutSessionRequest(BaseModel):
    plan_id: str = Field(..., pattern="^(pro|business)$")
    billing_interval: str = Field(default="monthly", pattern="^(monthly|annual)$")


class CreditPackage(BaseModel):
    id: str
    name: str
    credits: float
    price_usd: float
    savings_percent: int = 0


# ── Credit Packages ──────────────────────────────────────────────

CREDIT_PACKAGES = [
    CreditPackage(id="starter", name="Starter", credits=50, price_usd=9.99),
    CreditPackage(id="pro", name="Professional", credits=200, price_usd=29.99, savings_percent=25),
    CreditPackage(id="business", name="Business", credits=500, price_usd=59.99, savings_percent=40),
    CreditPackage(id="enterprise", name="Enterprise", credits=2000, price_usd=199.99, savings_percent=50),
]

PLAN_QUOTAS = {
    "pro": 2000,
    "business": 10000,
}

PLAN_NAMES = {
    "pro": "Pro",
    "business": "Business",
}


def _billing_enabled() -> bool:
    return bool(settings.ENABLE_BILLING and settings.STRIPE_SECRET_KEY)


def _get_price_id(plan_id: str, billing_interval: str) -> str | None:
    if plan_id == "pro":
        if billing_interval == "annual":
            return settings.STRIPE_PRICE_PRO_ANNUAL_ID
        return settings.STRIPE_PRICE_PRO_MONTHLY_ID or settings.STRIPE_PRICE_PRO_ID

    if plan_id == "business":
        if billing_interval == "annual":
            return settings.STRIPE_PRICE_BUSINESS_ANNUAL_ID
        return settings.STRIPE_PRICE_BUSINESS_MONTHLY_ID or settings.STRIPE_PRICE_ENTERPRISE_ID

    return None


async def _credit_for_plan(
    db: AsyncSession,
    user_id: str,
    plan_id: str,
    amount: Decimal,
    event_key: str,
    description: str,
    metadata: dict,
) -> None:
    existing_result = await db.execute(
        select(CreditTransaction).where(CreditTransaction.stripe_payment_id == event_key)
    )
    if existing_result.scalar_one_or_none():
        return

    result = await db.execute(select(Credit).where(Credit.user_id == user_id))
    credit = result.scalar_one_or_none()
    if not credit:
        credit = Credit(user_id=user_id, balance=Decimal("0"), lifetime_earned=Decimal("0"))
        db.add(credit)

    credit.balance = Decimal(credit.balance or 0) + amount
    credit.lifetime_earned = Decimal(credit.lifetime_earned or 0) + amount
    credit.subscription_plan = plan_id
    credit.monthly_quota = PLAN_QUOTAS.get(plan_id)
    credit.resets_at = datetime.now(timezone.utc) + timedelta(days=30)

    db.add(
        CreditTransaction(
            user_id=user_id,
            type=CreditTransactionType.PURCHASE.value,
            amount=amount,
            description=description,
            stripe_payment_id=event_key,
            extra_metadata=metadata,
        )
    )


async def _set_plan(db: AsyncSession, user_id: str, plan_id: str | None) -> None:
    result = await db.execute(select(Credit).where(Credit.user_id == user_id))
    credit = result.scalar_one_or_none()
    if not credit:
        credit = Credit(user_id=user_id, balance=Decimal("0"), lifetime_earned=Decimal("0"))
        db.add(credit)

    credit.subscription_plan = plan_id
    credit.monthly_quota = PLAN_QUOTAS.get(plan_id) if plan_id else None


async def _subscription_metadata(subscription_id: str | None) -> dict:
    if not subscription_id:
        return {}

    def retrieve_subscription():
        return stripe.Subscription.retrieve(subscription_id)

    subscription = await asyncio.to_thread(retrieve_subscription)
    return dict(getattr(subscription, "metadata", {}) or {})


# ── Routes ───────────────────────────────────────────────────────

@router.get("/credits", response_model=dict)
async def get_credits(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's credit balance."""
    result = await db.execute(
        select(Credit).where(Credit.user_id == current_user["user_id"])
    )
    credit = result.scalar_one_or_none()

    if not credit:
        # Create credit record if missing
        credit = Credit(
            user_id=current_user["user_id"],
            balance=settings.FREE_MONTHLY_CREDITS,
            lifetime_earned=settings.FREE_MONTHLY_CREDITS,
        )
        db.add(credit)
        await db.commit()

    # Get recent transactions
    tx_result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user["user_id"])
        .order_by(desc(CreditTransaction.created_at))
        .limit(20)
    )
    transactions = tx_result.scalars().all()

    return {
        "success": True,
        "data": {
            "balance": float(credit.balance),
            "lifetime_earned": float(credit.lifetime_earned),
            "lifetime_used": float(credit.lifetime_used),
            "subscription_plan": credit.subscription_plan,
            "monthly_quota": credit.monthly_quota,
            "recent_transactions": [tx.to_dict() for tx in transactions],
        },
    }


@router.get("/packages", response_model=dict)
async def get_credit_packages(
    current_user: dict = Depends(get_current_user),
):
    """Get available credit packages."""
    return {
        "success": True,
        "data": [pkg.model_dump() for pkg in CREDIT_PACKAGES],
    }


@router.post("/purchase", response_model=dict)
async def purchase_credits(
    data: PurchaseCreditsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Purchase credits (Stripe integration)."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=501, detail="Billing not configured")

    # Do not credit accounts from this request alone. Production billing must
    # create a Stripe Checkout session and grant credits only from a verified
    # Stripe webhook after payment succeeds.
    raise HTTPException(
        status_code=501,
        detail="Credit checkout is not enabled. Configure verified Stripe Checkout and webhooks before accepting payments.",
    )


@router.post("/checkout-session", response_model=dict)
async def create_checkout_session(
    data: CheckoutSessionRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a verified Stripe Checkout subscription session."""
    if not _billing_enabled():
        raise HTTPException(status_code=501, detail="Billing is not enabled")

    price_id = _get_price_id(data.plan_id, data.billing_interval)
    if not price_id:
        raise HTTPException(
            status_code=501,
            detail=f"Stripe price is not configured for {data.plan_id} {data.billing_interval}",
        )

    stripe.api_key = settings.STRIPE_SECRET_KEY
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    metadata = {
        "user_id": str(current_user["user_id"]),
        "plan_id": data.plan_id,
        "billing_interval": data.billing_interval,
    }

    def create_session():
        return stripe.checkout.Session.create(
            mode="subscription",
            customer_email=current_user.get("email"),
            client_reference_id=str(current_user["user_id"]),
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{frontend_url}/dashboard?checkout=success",
            cancel_url=f"{frontend_url}/pricing?checkout=cancelled",
            metadata=metadata,
            subscription_data={"metadata": metadata},
            allow_promotion_codes=True,
        )

    session = await asyncio.to_thread(create_session)
    return {"success": True, "data": {"checkout_url": session.url, "session_id": session.id}}


@router.post("/stripe/webhook", response_model=dict)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Stripe webhooks and grant credits only after verified Stripe events."""
    if not _billing_enabled() or not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=501, detail="Stripe webhooks are not configured")

    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Stripe signature")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe payload")
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe signature")

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        metadata = dict(obj.get("metadata") or {})
        user_id = metadata.get("user_id")
        plan_id = metadata.get("plan_id")
        if user_id and plan_id in PLAN_QUOTAS:
            await _set_plan(db, user_id, plan_id)

    elif event_type == "invoice.paid":
        subscription_id = obj.get("subscription")
        metadata = await _subscription_metadata(subscription_id)
        user_id = metadata.get("user_id")
        plan_id = metadata.get("plan_id")
        if user_id and plan_id in PLAN_QUOTAS:
            amount = Decimal(str(PLAN_QUOTAS[plan_id]))
            await _credit_for_plan(
                db=db,
                user_id=user_id,
                plan_id=plan_id,
                amount=amount,
                event_key=f"stripe_invoice:{obj['id']}",
                description=f"{PLAN_NAMES[plan_id]} monthly credit grant",
                metadata={
                    "stripe_event_id": event["id"],
                    "stripe_invoice_id": obj["id"],
                    "stripe_subscription_id": subscription_id,
                    "plan_id": plan_id,
                },
            )

    elif event_type == "customer.subscription.deleted":
        metadata = dict(obj.get("metadata") or {})
        user_id = metadata.get("user_id")
        if user_id:
            await _set_plan(db, user_id, None)

    return {"received": True}


@router.get("/transactions", response_model=dict)
async def get_credit_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get credit transaction history."""
    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user["user_id"])
        .order_by(desc(CreditTransaction.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    transactions = result.scalars().all()

    count_result = await db.execute(
        select(func.count(CreditTransaction.id)).where(
            CreditTransaction.user_id == current_user["user_id"]
        )
    )
    total = count_result.scalar() or 0

    return {
        "success": True,
        "data": [tx.to_dict() for tx in transactions],
        "meta": {"page": page, "per_page": per_page, "total": total},
    }


@router.get("/subscription", response_model=dict)
async def get_subscription(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current subscription details."""
    result = await db.execute(
        select(Credit).where(Credit.user_id == current_user["user_id"])
    )
    credit = result.scalar_one_or_none()

    # Subscription plans
    plans = [
        {
            "id": "free",
            "name": "Free",
            "price_monthly": 0,
            "credits_monthly": settings.FREE_MONTHLY_CREDITS,
            "features": ["5 conversions/month", "CSV export", "Email support"],
            "current": credit.subscription_plan is None if credit else True,
        },
        {
            "id": "basic",
            "name": "Basic",
            "price_monthly": 9.99,
            "credits_monthly": 50,
            "features": [
                "50 conversions/month",
                "All export formats",
                "Priority processing",
                "API access",
            ],
            "current": credit.subscription_plan == "basic" if credit else False,
        },
        {
            "id": "pro",
            "name": "Professional",
            "price_monthly": 29.99,
            "credits_monthly": 200,
            "features": [
                "200 conversions/month",
                "All export formats",
                "Priority processing",
                "API access",
                "Team collaboration",
                "Custom branding",
            ],
            "current": credit.subscription_plan == "pro" if credit else False,
        },
    ]

    return {
        "success": True,
        "data": {
            "current_plan": credit.subscription_plan if credit else "free",
            "monthly_quota": credit.monthly_quota if credit else settings.FREE_MONTHLY_CREDITS,
            "credits_used_this_month": float(credit.lifetime_used) if credit else 0,
            "plans": plans,
        },
    }
