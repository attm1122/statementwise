"""
Dashboard router: stats, activity, usage analytics.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_

from core.database import get_db
from core.auth import get_current_user
from models.conversion import Conversion, ConversionStatus
from models.transaction import Transaction
from models.credit import Credit

router = APIRouter()


@router.get("/stats", response_model=dict)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics for the current user."""
    user_id = current_user["user_id"]

    # Total conversions
    total_result = await db.execute(
        select(func.count(Conversion.id)).where(Conversion.user_id == user_id)
    )
    total_conversions = total_result.scalar() or 0

    # Completed conversions
    completed_result = await db.execute(
        select(func.count(Conversion.id)).where(
            Conversion.user_id == user_id,
            Conversion.status == ConversionStatus.COMPLETED,
        )
    )
    completed_conversions = completed_result.scalar() or 0

    # Failed conversions
    failed_result = await db.execute(
        select(func.count(Conversion.id)).where(
            Conversion.user_id == user_id,
            Conversion.status == ConversionStatus.FAILED,
        )
    )
    failed_conversions = failed_result.scalar() or 0

    # Total pages processed
    pages_result = await db.execute(
        select(func.coalesce(func.sum(Conversion.page_count), 0)).where(
            Conversion.user_id == user_id,
            Conversion.status == ConversionStatus.COMPLETED,
        )
    )
    total_pages = pages_result.scalar() or 0

    # Total transactions extracted
    tx_result = await db.execute(
        select(func.count(Transaction.id))
        .join(Conversion)
        .where(
            Conversion.user_id == user_id,
            Conversion.status == ConversionStatus.COMPLETED,
        )
    )
    total_transactions = tx_result.scalar() or 0

    # Credit balance
    credit_result = await db.execute(
        select(Credit).where(Credit.user_id == user_id)
    )
    credit = credit_result.scalar_one_or_none()

    # Recent activity (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_result = await db.execute(
        select(Conversion)
        .where(
            Conversion.user_id == user_id,
            Conversion.created_at >= thirty_days_ago,
        )
        .order_by(desc(Conversion.created_at))
        .limit(10)
    )
    recent_conversions = recent_result.scalars().all()

    # Monthly stats (last 6 months)
    monthly_stats = []
    for i in range(5, -1, -1):
        month_start = datetime.now(timezone.utc).replace(day=1) - timedelta(days=i * 30)
        month_end = month_start + timedelta(days=30)
        month_result = await db.execute(
            select(func.count(Conversion.id)).where(
                Conversion.user_id == user_id,
                Conversion.created_at >= month_start,
                Conversion.created_at < month_end,
                Conversion.status == ConversionStatus.COMPLETED,
            )
        )
        monthly_stats.append(
            {
                "month": month_start.strftime("%Y-%m"),
                "conversions": month_result.scalar() or 0,
            }
        )

    return {
        "success": True,
        "data": {
            "overview": {
                "total_conversions": total_conversions,
                "completed_conversions": completed_conversions,
                "failed_conversions": failed_conversions,
                "success_rate": (
                    round(completed_conversions / total_conversions * 100, 1)
                    if total_conversions > 0
                    else 0
                ),
                "total_pages_processed": total_pages,
                "total_transactions_extracted": total_transactions,
            },
            "credits": {
                "balance": float(credit.balance) if credit else 0,
                "lifetime_earned": float(credit.lifetime_earned) if credit else 0,
                "lifetime_used": float(credit.lifetime_used) if credit else 0,
            },
            "monthly_activity": monthly_stats,
            "recent_conversions": [c.to_dict() for c in recent_conversions],
        },
    }


@router.get("/activity", response_model=dict)
async def get_activity_feed(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get activity feed for the current user."""
    user_id = current_user["user_id"]
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(Conversion)
        .where(
            Conversion.user_id == user_id,
            Conversion.created_at >= since,
        )
        .order_by(desc(Conversion.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    conversions = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(func.count(Conversion.id)).where(
            Conversion.user_id == user_id,
            Conversion.created_at >= since,
        )
    )
    total = count_result.scalar() or 0

    return {
        "success": True,
        "data": [c.to_dict() for c in conversions],
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
        },
    }


@router.get("/usage", response_model=dict)
async def get_usage_breakdown(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed usage breakdown."""
    user_id = current_user["user_id"]
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # By status
    status_result = await db.execute(
        select(Conversion.status, func.count(Conversion.id))
        .where(
            Conversion.user_id == user_id,
            Conversion.created_at >= since,
        )
        .group_by(Conversion.status)
    )
    by_status = {status: count for status, count in status_result.fetchall()}

    # By model
    model_result = await db.execute(
        select(Conversion.model_used, func.count(Conversion.id))
        .where(
            Conversion.user_id == user_id,
            Conversion.created_at >= since,
            Conversion.model_used.isnot(None),
        )
        .group_by(Conversion.model_used)
    )
    by_model = {model or "unknown": count for model, count in model_result.fetchall()}

    # Credits consumed
    credits_result = await db.execute(
        select(func.coalesce(func.sum(Conversion.credits_consumed), 0)).where(
            Conversion.user_id == user_id,
            Conversion.created_at >= since,
        )
    )
    total_credits = float(credits_result.scalar() or 0)

    # Daily breakdown
    daily = []
    for i in range(days - 1, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        day_result = await db.execute(
            select(func.count(Conversion.id)).where(
                Conversion.user_id == user_id,
                Conversion.created_at >= day_start,
                Conversion.created_at < day_end,
            )
        )
        daily.append(
            {
                "date": day_start.strftime("%Y-%m-%d"),
                "conversions": day_result.scalar() or 0,
            }
        )

    return {
        "success": True,
        "data": {
            "period_days": days,
            "by_status": by_status,
            "by_model": by_model,
            "total_credits_consumed": total_credits,
            "daily_breakdown": daily,
        },
    }
