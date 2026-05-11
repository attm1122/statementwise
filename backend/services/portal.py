"""
Portal service for managing client portals, members, and access control.
"""

import secrets
import re
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from models.portal import Portal, PortalMember, PortalStatus, PortalMemberRole
from models.user import User


class PortalService:
    """Service for managing client portals."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _generate_slug(name: str) -> str:
        """Generate a URL-safe slug from a portal name."""
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        return slug[:100]

    async def create_portal(
        self,
        owner_id: str,
        name: str,
        description: str = None,
        branding_color: str = "#2563EB",
        custom_domain: str = None,
    ) -> Portal:
        """Create a new client portal."""
        slug = self._generate_slug(name)
        
        # Check slug uniqueness
        existing = await self.db.execute(
            select(Portal).where(Portal.slug == slug)
        )
        if existing.scalar_one_or_none():
            slug = f"{slug}-{secrets.token_urlsafe(4).lower()[:6]}"

        portal = Portal(
            name=name,
            slug=slug,
            description=description,
            owner_id=owner_id,
            branding_color=branding_color,
            custom_domain=custom_domain,
            status=PortalStatus.ACTIVE,
        )
        self.db.add(portal)
        await self.db.flush()
        return portal

    async def get_portal(self, portal_id: str) -> Optional[Portal]:
        """Get a portal by ID."""
        result = await self.db.execute(
            select(Portal)
            .options(selectinload(Portal.members).selectinload(PortalMember.user))
            .where(Portal.id == portal_id)
        )
        return result.scalar_one_or_none()

    async def get_portal_by_slug(self, slug: str) -> Optional[Portal]:
        """Get a portal by its slug."""
        result = await self.db.execute(
            select(Portal)
            .options(selectinload(Portal.members).selectinload(PortalMember.user))
            .where(Portal.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_user_portals(self, user_id: str, include_owned: bool = True, include_member: bool = True):
        """List all portals a user has access to."""
        conditions = []
        
        if include_owned:
            conditions.append(Portal.owner_id == user_id)
        
        if include_member:
            # Get portals where user is a member
            member_portals = await self.db.execute(
                select(PortalMember.portal_id).where(PortalMember.user_id == user_id)
            )
            member_ids = [r[0] for r in member_portals.fetchall()]
            if member_ids:
                conditions.append(Portal.id.in_(member_ids))

        if not conditions:
            return []

        result = await self.db.execute(
            select(Portal)
            .where(or_(*conditions))
            .where(Portal.status == PortalStatus.ACTIVE)
            .order_by(Portal.created_at.desc())
        )
        return result.scalars().all()

    async def update_portal(
        self,
        portal_id: str,
        name: str = None,
        description: str = None,
        branding_color: str = None,
        custom_domain: str = None,
        status: str = None,
    ) -> Portal:
        """Update a portal's settings."""
        portal = await self.get_portal(portal_id)
        if not portal:
            raise ValueError("Portal not found")

        if name is not None:
            portal.name = name
        if description is not None:
            portal.description = description
        if branding_color is not None:
            portal.branding_color = branding_color
        if custom_domain is not None:
            portal.custom_domain = custom_domain
        if status is not None:
            portal.status = status

        portal.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return portal

    async def delete_portal(self, portal_id: str) -> bool:
        """Soft-delete a portal by setting status to archived."""
        portal = await self.get_portal(portal_id)
        if not portal:
            return False
        portal.status = PortalStatus.ARCHIVED
        portal.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return True

    # ── Member Management ─────────────────────────────────────────

    async def add_member(
        self,
        portal_id: str,
        user_id: str,
        role: str = PortalMemberRole.VIEWER,
        invited_by: str = None,
    ) -> PortalMember:
        """Add a member to a portal."""
        # Check if already a member
        existing = await self.db.execute(
            select(PortalMember).where(
                and_(PortalMember.portal_id == portal_id, PortalMember.user_id == user_id)
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("User is already a member of this portal")

        member = PortalMember(
            portal_id=portal_id,
            user_id=user_id,
            role=role,
            invited_by=invited_by,
        )
        self.db.add(member)
        await self.db.flush()
        
        # Load relationships for response
        await self.db.refresh(member, ['user', 'portal'])
        return member

    async def remove_member(self, portal_id: str, user_id: str) -> bool:
        """Remove a member from a portal."""
        result = await self.db.execute(
            select(PortalMember).where(
                and_(PortalMember.portal_id == portal_id, PortalMember.user_id == user_id)
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            return False
        await self.db.delete(member)
        await self.db.flush()
        return True

    async def update_member_role(
        self, portal_id: str, user_id: str, new_role: str
    ) -> PortalMember:
        """Update a member's role in a portal."""
        result = await self.db.execute(
            select(PortalMember).where(
                and_(PortalMember.portal_id == portal_id, PortalMember.user_id == user_id)
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            raise ValueError("Member not found")
        member.role = new_role
        await self.db.flush()
        return member

    async def get_member_role(self, portal_id: str, user_id: str) -> Optional[str]:
        """Get a user's role in a portal."""
        # Check if owner
        portal = await self.get_portal(portal_id)
        if portal and str(portal.owner_id) == user_id:
            return "owner"
        
        # Check membership
        result = await self.db.execute(
            select(PortalMember.role).where(
                and_(PortalMember.portal_id == portal_id, PortalMember.user_id == user_id)
            )
        )
        role = result.scalar_one_or_none()
        return role

    async def can_access_portal(self, portal_id: str, user_id: str) -> bool:
        """Check if a user can access a portal."""
        portal = await self.get_portal(portal_id)
        if not portal:
            return False
        if str(portal.owner_id) == user_id:
            return True
        if portal.status != PortalStatus.ACTIVE:
            return False
        
        role = await self.get_member_role(portal_id, user_id)
        return role is not None

    async def can_manage_portal(self, portal_id: str, user_id: str) -> bool:
        """Check if a user can manage a portal (owner or admin)."""
        portal = await self.get_portal(portal_id)
        if not portal:
            return False
        if str(portal.owner_id) == user_id:
            return True
        
        role = await self.get_member_role(portal_id, user_id)
        return role in (PortalMemberRole.ADMIN, "owner")
