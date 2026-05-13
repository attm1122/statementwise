"""API key model for programmatic access."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel


class APIKey(BaseModel):
    """API key for programmatic access to the API."""

    __tablename__ = "api_keys"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    key_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    permissions: Mapped[list] = mapped_column(JSON, nullable=False, default=["read", "write"])
    rate_limit_rpm: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="api_keys", lazy="selectin")

    def to_dict(self, include_key: bool = False) -> dict:
        data = {
            "id": str(self.id),
            "name": self.name,
            "key_prefix": self.key_prefix,
            "permissions": self.permissions,
            "rate_limit_rpm": self.rate_limit_rpm,
            "last_used_at": self.last_used_at.isoformat() if self.last_used_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_key:
            data["key"] = f"{self.key_prefix}..."
        return data
