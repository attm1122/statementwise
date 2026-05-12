"""Credit balance and transaction models."""

from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Any

from sqlalchemy import String, Numeric, Integer, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel


class CreditTransactionType(str, PyEnum):
    PURCHASE = "purchase"
    USAGE = "usage"
    BONUS = "bonus"
    REFUND = "refund"
    GRANT = "grant"


class Credit(BaseModel):
    """User credit balance."""

    __tablename__ = "credits"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    balance: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    lifetime_earned: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0")
    )
    lifetime_used: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0")
    )
    subscription_plan: Mapped[str | None] = mapped_column(String(50), nullable=True)
    monthly_quota: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resets_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="credit", lazy="selectin")

    def to_dict(self) -> dict:
        return {
            "user_id": str(self.user_id),
            "balance": float(self.balance),
            "lifetime_earned": float(self.lifetime_earned),
            "lifetime_used": float(self.lifetime_used),
            "subscription_plan": self.subscription_plan,
            "monthly_quota": self.monthly_quota,
            "resets_at": self.resets_at.isoformat() if self.resets_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CreditTransaction(BaseModel):
    """Individual credit transaction (purchase, usage, bonus, refund)."""

    __tablename__ = "credit_transactions"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    conversion_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversions.id", ondelete="SET NULL"),
        nullable=True,
    )
    type: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    stripe_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    extra_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", lazy="selectin")
    conversion: Mapped["Conversion | None"] = relationship(
        "Conversion", back_populates="credit_transaction", lazy="selectin"
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "conversion_id": str(self.conversion_id) if self.conversion_id else None,
            "type": self.type,
            "amount": float(self.amount),
            "description": self.description,
            "stripe_payment_id": self.stripe_payment_id,
            "metadata": self.extra_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            }
    