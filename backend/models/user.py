"""User model with roles and authentication."""

from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel


class UserRole(str, PyEnum):
    USER = "user"
    ADMIN = "admin"
    ACCOUNTANT = "accountant"
    VIEWER = "viewer"


class UserStatus(str, PyEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class User(BaseModel):
    """User account model."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default=UserRole.USER.value, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=UserStatus.ACTIVE.value, index=True
    )
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    locale: Mapped[str] = mapped_column(String(10), default="en")
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    conversions: Mapped[list["Conversion"]] = relationship(
        "Conversion", back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )
    credit: Mapped["Credit"] = relationship(
        "Credit", back_populates="user", lazy="selectin", uselist=False
    )
    api_keys: Mapped[list["APIKey"]] = relationship(
        "APIKey", back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )
    portals_owned: Mapped[list["Portal"]] = relationship(
        "Portal", back_populates="owner", lazy="selectin", cascade="all, delete-orphan"
    )
    portal_memberships: Mapped[list["PortalMember"]] = relationship(
        "PortalMember", back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )

    def is_active_user(self) -> bool:
        return self.status == UserStatus.ACTIVE.value

    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "company_name": self.company_name,
            "role": self.role,
            "status": self.status,
            "email_verified": self.email_verified,
            "avatar_url": self.avatar_url,
            "timezone": self.timezone,
            "locale": self.locale,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
