"""Portal and PortalMember models for client portals."""

from enum import Enum as PyEnum

from sqlalchemy import String, Text, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel


class PortalStatus(str, PyEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"


class PortalMemberRole(str, PyEnum):
    ADMIN = "admin"
    ACCOUNTANT = "accountant"
    VIEWER = "viewer"


class Portal(BaseModel):
    """Client portal for organizing and sharing statements."""

    __tablename__ = "portals"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=PortalStatus.ACTIVE.value, index=True
    )
    branding_color: Mapped[str] = mapped_column(String(7), default="#2563EB")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    custom_domain: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)

    # Relationships
    owner: Mapped["User"] = relationship(
        "User", back_populates="portals_owned", lazy="selectin", foreign_keys="Portal.owner_id"
    )
    members: Mapped[list["PortalMember"]] = relationship(
        "PortalMember",
        back_populates="portal",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    conversions: Mapped[list["Conversion"]] = relationship(
        "Conversion", back_populates="portal", lazy="selectin"
    )

    def to_dict(self, include_members: bool = False) -> dict:
        data = {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "owner_id": str(self.owner_id),
            "status": self.status,
            "branding_color": self.branding_color,
            "logo_url": self.logo_url,
            "custom_domain": self.custom_domain,
            "settings": self.settings,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_members and self.members:
            data["members"] = [m.to_dict() for m in self.members]
        return data


class PortalMember(BaseModel):
    """Membership linking users to portals with roles."""

    __tablename__ = "portal_members"

    portal_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portals.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default=PortalMemberRole.VIEWER.value
    )
    invited_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    __table_args__ = (UniqueConstraint("portal_id", "user_id", name="uq_portal_user"),)

    # Relationships
    portal: Mapped["Portal"] = relationship("Portal", back_populates="members", lazy="selectin")
    user: Mapped["User"] = relationship(
        "User", back_populates="portal_memberships", lazy="selectin", foreign_keys="PortalMember.user_id"
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "portal_id": str(self.portal_id),
            "user_id": str(self.user_id),
            "role": self.role,
            "invited_by": str(self.invited_by) if self.invited_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": self.user.to_dict() if self.user else None,
        }
