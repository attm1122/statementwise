"""
Conversion router: upload, status, results, export.
"""

import io
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from core.config import get_settings
from core.database import get_db
from core.auth import get_current_user
from models.conversion import Conversion, ConversionStatus
from models.transaction import Transaction
from services.conversion import ConversionService, ConversionError
from services.export import ExportService
from services.storage import StorageService

settings = get_settings()
router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    conversion_id: str
    status: str
    filename: str
    page_count: int
    estimated_credits: float


class ConversionStatusResponse(BaseModel):
    """Pydantic v2 protects the 'model_' namespace, so we use 'llm_model' as the field name
    and alias it to 'model_used' in API responses for backward compatibility."""
    model_config = ConfigDict(protected_namespaces=())

    id: str
    status: str
    filename: str
    page_count: Optional[int]
    credits_consumed: float
    model_used: Optional[str]
    error_message: Optional[str]
    created_at: str
    started_at: Optional[str]
    completed_at: Optional[str]


class ExportRequest(BaseModel):
    format: str = Field(..., pattern="^(csv|xlsx|json|qbo|ofx|mt940|camt053)$")


# ── Routes ───────────────────────────────────────────────────────

@router.post("/upload", response_model=dict, status_code=status.HTTP_202_ACCEPTED)
async def upload_statement(
    file: UploadFile = File(...),
    portal_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a bank statement PDF for processing."""
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are accepted",
        )

    # Read file content
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file",
        )

    # Validate file size
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
        )

    # Process conversion
    service = ConversionService(db)
    
    try:
        conversion = await service.process_conversion(
            user_id=current_user["user_id"],
            file_content=content,
            filename=file.filename or "statement.pdf",
            portal_id=portal_id,
        )
    except ConversionError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message,
        )

    return {
        "success": True,
        "data": {
            "conversion_id": str(conversion.id),
            "status": conversion.status,
            "filename": conversion.filename,
            "page_count": conversion.page_count,
            "credits_consumed": float(conversion.credits_consumed),
            "created_at": conversion.created_at.isoformat(),
        },
    }


@router.get("/status/{conversion_id}", response_model=dict)
async def get_conversion_status(
    conversion_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the status of a conversion job."""
    result = await db.execute(
        select(Conversion).where(
            Conversion.id == conversion_id,
            Conversion.user_id == current_user["user_id"],
        )
    )
    conversion = result.scalar_one_or_none()

    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")

    return {
        "success": True,
        "data": {
            "id": str(conversion.id),
            "status": conversion.status,
            "filename": conversion.filename,
            "page_count": conversion.page_count,
            "credits_consumed": float(conversion.credits_consumed),
            "model_used": conversion.model_used,
            "error_message": conversion.error_message,
            "error_code": conversion.error_code,
            "created_at": conversion.created_at.isoformat() if conversion.created_at else None,
            "started_at": conversion.started_at.isoformat() if conversion.started_at else None,
            "completed_at": conversion.completed_at.isoformat() if conversion.completed_at else None,
        },
    }


@router.get("/results/{conversion_id}", response_model=dict)
async def get_conversion_results(
    conversion_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full results of a completed conversion."""
    result = await db.execute(
        select(Conversion)
        .where(
            Conversion.id == conversion_id,
            Conversion.user_id == current_user["user_id"],
        )
    )
    conversion = result.scalar_one_or_none()

    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")

    if conversion.status != ConversionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Conversion is {conversion.status}, not completed",
        )

    # Load transactions
    await db.refresh(conversion, ["transactions"])

    return {
        "success": True,
        "data": conversion.to_dict(include_transactions=True),
    }


@router.get("/list", response_model=dict)
async def list_conversions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's conversions with pagination."""
    query = select(Conversion).where(
        Conversion.user_id == current_user["user_id"]
    ).order_by(desc(Conversion.created_at))

    if status:
        query = query.where(Conversion.status == status)

    # Count total
    count_result = await db.execute(
        select(Conversion).where(Conversion.user_id == current_user["user_id"])
    )
    total = len(count_result.scalars().all())

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    conversions = result.scalars().all()

    return {
        "success": True,
        "data": [c.to_dict() for c in conversions],
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }


@router.post("/export/{conversion_id}", response_model=dict)
async def export_conversion(
    conversion_id: str,
    data: ExportRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export a completed conversion to the specified format."""
    result = await db.execute(
        select(Conversion)
        .where(
            Conversion.id == conversion_id,
            Conversion.user_id == current_user["user_id"],
            Conversion.status == ConversionStatus.COMPLETED,
        )
    )
    conversion = result.scalar_one_or_none()

    if not conversion:
        raise HTTPException(
            status_code=404,
            detail="Conversion not found or not completed",
        )

    # Load transactions
    await db.refresh(conversion, ["transactions"])
    transactions = [t.to_dict() for t in conversion.transactions]

    try:
        content, content_type, filename = ExportService.generate_export(
            format=data.format,
            transactions=transactions,
            metadata=conversion.statement_metadata,
            opening_balance=conversion.opening_balance,
            closing_balance=conversion.closing_balance,
            summary=conversion.summary,
            reconciliation=conversion.reconciliation,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Store export file
    storage = StorageService()
    export_key = await storage.upload_export(
        content=content,
        conversion_id=conversion_id,
        filename=filename,
        content_type=content_type,
    )

    # Generate download URL
    download_url = await storage.get_presigned_url(
        key=export_key,
        bucket=settings.S3_BUCKET_EXPORTS,
        expiry=3600,
    )

    return {
        "success": True,
        "data": {
            "conversion_id": conversion_id,
            "format": data.format,
            "filename": filename,
            "content_type": content_type,
            "download_url": download_url,
            "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=3600)).isoformat(),
        },
    }


@router.delete("/{conversion_id}", response_model=dict)
async def delete_conversion(
    conversion_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversion and its data."""
    result = await db.execute(
        select(Conversion).where(
            Conversion.id == conversion_id,
            Conversion.user_id == current_user["user_id"],
        )
    )
    conversion = result.scalar_one_or_none()

    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")

    await db.delete(conversion)
    await db.commit()

    return {"success": True, "message": "Conversion deleted"}
