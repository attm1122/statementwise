"""
Portal router: CRUD operations for client portals.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from core.database import get_db
from core.auth import get_current_user
from models.portal import Portal, PortalStatus
from services.portal import PortalService

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────

class CreatePortalRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    branding_color: Optional[str] = Field("#2563EB", pattern="^#[0-9A-Fa-f]{6}$")
    custom_domain: Optional[str] = Field(None, max_length=255)


class UpdatePortalRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    branding_color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    custom_domain: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|archived|suspended)$")


class AddMemberRequest(BaseModel):
    user_id: str
    role: str = Field("viewer", pattern="^(admin|accountant|viewer)$")


class UpdateMemberRequest(BaseModel):
    role: str = Field(..., pattern="^(admin|accountant|viewer)$")


# ── Routes ───────────────────────────────────────────────────────

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_portal(
    data: CreatePortalRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new client portal."""
    service = PortalService(db)
    portal = await service.create_portal(
        owner_id=current_user["user_id"],
        name=data.name,
        description=data.description,
        branding_color=data.branding_color,
        custom_domain=data.custom_domain,
    )
    return {
        "success": True,
        "data": portal.to_dict(include_members=True),
    }


@router.get("/", response_model=dict)
async def list_portals(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all portals the user has access to."""
    service = PortalService(db)
    portals = await service.list_user_portals(current_user["user_id"])
    return {
        "success": True,
        "data": [p.to_dict() for p in portals],
    }


@router.get("/{portal_id}", response_model=dict)
async def get_portal(
    portal_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get portal details."""
    service = PortalService(db)
    
    if not await service.can_access_portal(portal_id, current_user["user_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    portal = await service.get_portal(portal_id)
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    return {
        "success": True,
        "data": portal.to_dict(include_members=True),
    }


@router.patch("/{portal_id}", response_model=dict)
async def update_portal(
    portal_id: str,
    data: UpdatePortalRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update portal settings."""
    service = PortalService(db)

    if not await service.can_manage_portal(portal_id, current_user["user_id"]):
        raise HTTPException(status_code=403, detail="Admin access required")

    portal = await service.update_portal(
        portal_id=portal_id,
        name=data.name,
        description=data.description,
        branding_color=data.branding_color,
        custom_domain=data.custom_domain,
        status=data.status,
    )
    return {"success": True, "data": portal.to_dict(include_members=True)}


@router.delete("/{portal_id}", response_model=dict)
async def delete_portal(
    portal_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete (archive) a portal."""
    service = PortalService(db)

    portal = await service.get_portal(portal_id)
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    if str(portal.owner_id) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    await service.delete_portal(portal_id)
    return {"success": True, "message": "Portal archived"}


# ── Members ──────────────────────────────────────────────────────

@router.post("/{portal_id}/members", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_member(
    portal_id: str,
    data: AddMemberRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a member to a portal."""
    service = PortalService(db)

    if not await service.can_manage_portal(portal_id, current_user["user_id"]):
        raise HTTPException(status_code=403, detail="Admin access required")

    member = await service.add_member(
        portal_id=portal_id,
        user_id=data.user_id,
        role=data.role,
        invited_by=current_user["user_id"],
    )
    return {"success": True, "data": member.to_dict()}


@router.delete("/{portal_id}/members/{user_id}", response_model=dict)
async def remove_member(
    portal_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a member from a portal."""
    service = PortalService(db)

    if not await service.can_manage_portal(portal_id, current_user["user_id"]):
        raise HTTPException(status_code=403, detail="Admin access required")

    success = await service.remove_member(portal_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")

    return {"success": True, "message": "Member removed"}


@router.patch("/{portal_id}/members/{user_id}", response_model=dict)
async def update_member_role(
    portal_id: str,
    user_id: str,
    data: UpdateMemberRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a member's role."""
    service = PortalService(db)

    if not await service.can_manage_portal(portal_id, current_user["user_id"]):
        raise HTTPException(status_code=403, detail="Admin access required")

    member = await service.update_member_role(portal_id, user_id, data.role)
    return {"success": True, "data": member.to_dict()}
