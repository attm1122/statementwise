"""Conversion job model for bank statement processing."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Any

from sqlalchemy import BigInteger, Integer, String, Numeric, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel


class ConversionStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    VALIDATING = "validating"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Conversion(BaseModel):
    """Bank statement conversion job."""

    __tablename__ = "conversions"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    portal_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("portals.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_file_key: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ConversionStatus.PENDING.value,
        index=True,
    )
    model_used: Mapped[str | None] = mapped_column(String(50), nullable=True)
    credits_consumed: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), nullable=False, default=Decimal("0")
    )
    statement_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    opening_balance: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    closing_balance: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    reconciliation: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversions", lazy="selectin")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="conversion",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="Transaction.transaction_date",
    )
    credit_transaction: Mapped["CreditTransaction | None"] = relationship(
        "CreditTransaction",
        back_populates="conversion",
        lazy="selectin",
    )
    portal: Mapped["Portal | None"] = relationship(
        "Portal",
        back_populates="conversions",
        lazy="selectin",
    )

    def to_dict(self, include_transactions: bool = False) -> dict:
        data = {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "portal_id": str(self.portal_id) if self.portal_id else None,
            "filename": self.filename,
            "file_size_bytes": self.file_size_bytes,
            "page_count": self.page_count,
            "status": self.status,
            "model_used": self.model_used,
            "credits_consumed": float(self.credits_consumed),
            "statement_metadata": self.statement_metadata,
            "opening_balance": self.opening_balance,
            "closing_balance": self.closing_balance,
            "summary": self.summary,
            "reconciliation": self.reconciliation,
            "error_message": self.error_message,
            "error_code": self.error_code,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_transactions and self.transactions:
            data["transactions"] = [t.to_dict() for t in self.transactions]
        return data
