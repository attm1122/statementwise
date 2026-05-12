"""Transaction model for extracted bank statement transactions."""

from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, Numeric, String, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel


class Transaction(BaseModel):
    """Individual bank transaction extracted from a statement."""

    __tablename__ = "transactions"

    conversion_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    debit: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    credit: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    running_balance: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationships
    conversion: Mapped["Conversion"] = relationship(
        "Conversion", back_populates="transactions", lazy="selectin"
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "conversion_id": str(self.conversion_id),
            "transaction_date": self.transaction_date.isoformat(),
            "description": self.description,
            "reference": self.reference,
            "category": self.category,
            "debit": float(self.debit) if self.debit else None,
            "credit": float(self.credit) if self.credit else None,
            "amount": float(self.amount),
            "currency": self.currency,
            "running_balance": float(self.running_balance) if self.running_balance else None,
            "confidence_score": float(self.confidence_score) if self.confidence_score else None,
            "raw_text": self.raw_text,
            "metadata": self.extra_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
