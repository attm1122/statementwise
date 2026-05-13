"""
Webhooks router: configure and deliver webhooks.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from core.config import get_settings
from core.database import get_db
from core.auth import get_current_user

settings = get_settings()
router = APIRouter()


# ── In-memory store (replace with DB table in production) ────────

class WebhookStore:
    """In-memory webhook storage. Replace with database table."""

    def __init__(self):
        self._webhooks = {}
        self._deliveries = {}

    def create(self, user_id: str, url: str, events: list, secret: str, active: bool = True):
        webhook_id = str(uuid.uuid4())
        webhook = {
            "id": webhook_id,
            "user_id": user_id,
            "url": url,
            "events": events,
            "secret": secret,
            "is_active": active,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        self._webhooks[webhook_id] = webhook
        return webhook

    def get(self, webhook_id: str, user_id: str = None):
        webhook = self._webhooks.get(webhook_id)
        if webhook and (user_id is None or webhook["user_id"] == user_id):
            return webhook
        return None

    def list(self, user_id: str):
        return [w for w in self._webhooks.values() if w["user_id"] == user_id]

    def update(self, webhook_id: str, user_id: str, **kwargs):
        webhook = self.get(webhook_id, user_id)
        if not webhook:
            return None
        for key, value in kwargs.items():
            if value is not None and key in webhook:
                webhook[key] = value
        webhook["updated_at"] = datetime.now(timezone.utc).isoformat()
        return webhook

    def delete(self, webhook_id: str, user_id: str):
        webhook = self.get(webhook_id, user_id)
        if webhook:
            del self._webhooks[webhook_id]
            return True
        return False


_webhook_store = WebhookStore()


# ── Schemas ──────────────────────────────────────────────────────

SUPPORTED_EVENTS = [
    "conversion.completed",
    "conversion.failed",
    "conversion.started",
    "export.completed",
    "credits.low",
    "credits.purchased",
]


class CreateWebhookRequest(BaseModel):
    url: str = Field(..., max_length=500)
    events: list[str] = Field(..., min_length=1)
    secret: Optional[str] = Field(None, max_length=255)
    is_active: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://your-app.com/webhooks/statementwise",
                "events": ["conversion.completed", "conversion.failed"],
                "secret": "whsec_your_webhook_secret",
                "is_active": True,
            }
        }


class UpdateWebhookRequest(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    events: Optional[list[str]] = None
    secret: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


# ── Routes ───────────────────────────────────────────────────────

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    data: CreateWebhookRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new webhook endpoint."""
    # Validate events
    invalid_events = [e for e in data.events if e not in SUPPORTED_EVENTS]
    if invalid_events:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid events: {invalid_events}. Supported: {SUPPORTED_EVENTS}",
        )

    secret = data.secret or hashlib.sha256(
        f"{current_user['user_id']}{datetime.now(timezone.utc).isoformat()}".encode()
    ).hexdigest()

    webhook = _webhook_store.create(
        user_id=current_user["user_id"],
        url=data.url,
        events=data.events,
        secret=secret,
        active=data.is_active,
    )

    return {
        "success": True,
        "data": {
            "id": webhook["id"],
            "url": webhook["url"],
            "events": webhook["events"],
            "is_active": webhook["is_active"],
            "secret": secret,  # Only shown once
            "created_at": webhook["created_at"],
        },
    }


@router.get("/", response_model=dict)
async def list_webhooks(
    current_user: dict = Depends(get_current_user),
):
    """List all webhooks for the current user."""
    webhooks = _webhook_store.list(current_user["user_id"])
    return {
        "success": True,
        "data": [
            {
                "id": w["id"],
                "url": w["url"],
                "events": w["events"],
                "is_active": w["is_active"],
                "created_at": w["created_at"],
                "updated_at": w["updated_at"],
            }
            for w in webhooks
        ],
    }


@router.get("/{webhook_id}", response_model=dict)
async def get_webhook(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get webhook details."""
    webhook = _webhook_store.get(webhook_id, current_user["user_id"])
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return {
        "success": True,
        "data": {
            "id": webhook["id"],
            "url": webhook["url"],
            "events": webhook["events"],
            "is_active": webhook["is_active"],
            "created_at": webhook["created_at"],
            "updated_at": webhook["updated_at"],
        },
    }


@router.patch("/{webhook_id}", response_model=dict)
async def update_webhook(
    webhook_id: str,
    data: UpdateWebhookRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a webhook."""
    if data.events:
        invalid_events = [e for e in data.events if e not in SUPPORTED_EVENTS]
        if invalid_events:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid events: {invalid_events}",
            )

    webhook = _webhook_store.update(
        webhook_id,
        current_user["user_id"],
        url=data.url,
        events=data.events,
        secret=data.secret,
        is_active=data.is_active,
    )
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return {"success": True, "data": webhook}


@router.delete("/{webhook_id}", response_model=dict)
async def delete_webhook(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a webhook."""
    success = _webhook_store.delete(webhook_id, current_user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return {"success": True, "message": "Webhook deleted"}


@router.post("/{webhook_id}/test", response_model=dict)
async def test_webhook(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Send a test event to the webhook."""
    webhook = _webhook_store.get(webhook_id, current_user["user_id"])
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    import httpx

    payload = {
        "event": "webhook.test",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "message": "This is a test event from Statementwise",
            "webhook_id": webhook_id,
        },
    }

    signature = hmac.new(
        webhook["secret"].encode(),
        json.dumps(payload).encode(),
        hashlib.sha256,
    ).hexdigest()

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                webhook["url"],
                json=payload,
                headers={
                    "X-Statementwise-Signature": f"sha256={signature}",
                    "X-Statementwise-Event": "webhook.test",
                    "Content-Type": "application/json",
                    "User-Agent": "Statementwise-Webhook/1.0",
                },
            )
            return {
                "success": True,
                "data": {
                    "status_code": response.status_code,
                    "response_body": response.text[:500],
                    "delivery_time_ms": response.elapsed.total_seconds() * 1000,
                },
            }
    except Exception as e:
        return {
            "success": False,
            "error": {
                "code": "DELIVERY_FAILED",
                "message": str(e),
            },
        }


# ── Webhook Event Delivery ───────────────────────────────────────

async def deliver_webhook_event(
    user_id: str,
    event: str,
    data: dict,
):
    """Deliver a webhook event to all registered endpoints."""
    webhooks = _webhook_store.list(user_id)

    for webhook in webhooks:
        if not webhook["is_active"] or event not in webhook["events"]:
            continue

        payload = {
            "event": event,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        signature = hmac.new(
            webhook["secret"].encode(),
            json.dumps(payload, default=str).encode(),
            hashlib.sha256,
        ).hexdigest()

        import httpx

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                await client.post(
                    webhook["url"],
                    json=payload,
                    headers={
                        "X-Statementwise-Signature": f"sha256={signature}",
                        "X-Statementwise-Event": event,
                        "Content-Type": "application/json",
                        "User-Agent": "Statementwise-Webhook/1.0",
                    },
                )
        except Exception:
            # Log delivery failure, retry with Celery
            pass
