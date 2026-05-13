"""
Billing router: credits, subscriptions, invoices.
"""

from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
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
