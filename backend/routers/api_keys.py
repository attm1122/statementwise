"""
API Keys router: manage API keys for programmatic access.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from core.config import get_settings
from core.database import get_db
from core.auth import get_current_user, generate_api_key, verify_api_key
from models.api_key import APIKey
from models.user import User

settings = get_settings()
router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────

class CreateAPIKeyRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    permissions: list[str] = Field(default=["read", "write"])
    rate_limit_rpm: int = Field(default=60, ge=1, le=10000)
    expires_in_days: Optional[int] = Field(None, ge=1, le=365)


class UpdateAPIKeyRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None
    permissions: Optional[list[str]] = None


# ── Routes ───────────────────────────────────────────────────────

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: CreateAPIKeyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new API key."""
    # Generate key
    full_key, key_hash = generate_api_key()
    key_prefix = full_key[:8]

    # Calculate expiry
    expires_at = None
    if data.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=data.expires_in_days)

    api_key = APIKey(
        user_id=current_user["user_id"],
        name=data.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
        permissions=data.permissions,
        rate_limit_rpm=data.rate_limit_rpm,
        expires_at=expires_at,
        is_active=True,
    )
    db.add(api_key)
    await db.commit()

    # Return the full key ONLY on creation
    return {
        "success": True,
        "data": {
            "id": str(api_key.id),
            "name": api_key.name,
            "key": full_key,  # Only shown once!
            "key_prefix": key_prefix,
            "permissions": api_key.permissions,
            "rate_limit_rpm": api_key.rate_limit_rpm,
            "expires_at": api_key.expires_at.isoformat() if api_key.expires_at else None,
            "created_at": api_key.created_at.isoformat(),
        },
        "warning": "This API key will only be shown once. Please save it securely.",
    }


@router.get("/", response_model=dict)
async def list_api_keys(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List API keys for the current user (without full keys)."""
    result = await db.execute(
        select(APIKey)
        .where(APIKey.user_id == current_user["user_id"])
        .order_by(desc(APIKey.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    keys = result.scalars().all()

    count_result = await db.execute(
        select(func.count(APIKey.id)).where(
            APIKey.user_id == current_user["user_id"]
        )
    )
    total = count_result.scalar() or 0

    return {
        "success": True,
        "data": [k.to_dict() for k in keys],
        "meta": {"page": page, "per_page": per_page, "total": total},
    }


@router.get("/{key_id}", response_model=dict)
async def get_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get an API key by ID."""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == current_user["user_id"],
        )
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    return {
        "success": True,
        "data": api_key.to_dict(),
    }


@router.patch("/{key_id}", response_model=dict)
async def update_api_key(
    key_id: str,
    data: UpdateAPIKeyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an API key."""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == current_user["user_id"],
        )
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    if data.name is not None:
        api_key.name = data.name
    if data.is_active is not None:
        api_key.is_active = data.is_active
    if data.permissions is not None:
        api_key.permissions = data.permissions

    api_key.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"success": True, "data": api_key.to_dict()}


@router.delete("/{key_id}", response_model=dict)
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke (deactivate) an API key."""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == current_user["user_id"],
        )
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    api_key.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"success": True, "message": "API key revoked"}
