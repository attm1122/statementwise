"""
Bank statement conversion pipeline.
Handles PDF upload, text/image extraction, LLM processing, and validation.
"""

import hashlib
import io
import logging
import os
import tempfile
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

import pdfplumber
import redis.asyncio as redis
from pdf2image import convert_from_path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.config import get_settings
from models.conversion import Conversion, ConversionStatus
from models.transaction import Transaction
from models.credit import Credit, CreditTransactionType
from services.moonshot import MoonshotClient, ExtractionResult
from services.storage import StorageService

settings = get_settings()
logger = logging.getLogger(__name__)


class ConversionError(Exception):
    """Custom exception for conversion pipeline errors."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ConversionService:
    """Service for handling bank statement conversions."""

    def __init__(
        self,
        db: AsyncSession,
        moonshot: MoonshotClient = None,
        storage: StorageService = None,
        redis_client: redis.Redis = None,
    ):
        self.db = db
        self.moonshot = moonshot or MoonshotClient()
        self.storage = storage or StorageService()
        self.redis = redis_client

    def _calculate_credits(self, page_count: int) -> Decimal:
        """Calculate credits required for a conversion."""
        return Decimal(settings.CREDITS_PER_CONVERSION_BASE) + (
            Decimal(page_count) * Decimal(str(settings.CREDITS_PER_PAGE))
        )

    async def _check_and_deduct_credits(
        self, user_id: str, page_count: int, conversion_id: str
    ) -> Decimal:
        """Check user has enough credits and deduct them."""
        required = self._calculate_credits(page_count)

        # Get user credit record
        result = await self.db.execute(
            select(Credit).where(Credit.user_id == user_id).with_for_update()
        )
        credit = result.scalar_one_or_none()

        if not credit or Decimal(credit.balance) < required:
            raise ConversionError(
                code="INSUFFICIENT_CREDITS",
                message=f"Need {float(required)} credits, have {float(credit.balance) if credit else 0}",
                status_code=402,
            )

        # Deduct credits
        credit.balance = Decimal(credit.balance) - required
        credit.lifetime_used = Decimal(credit.lifetime_used) + required

        # Record transaction
        credit_tx = CreditTransaction(
            user_id=user_id,
            conversion_id=conversion_id,
            type=CreditTransactionType.USAGE,
            amount=-required,
            description=f"PDF conversion: {page_count} pages",
        )
        self.db.add(credit_tx)

        return required

    async def validate_pdf(self, file_content: bytes, filename: str) -> dict:
        """
        Validate uploaded PDF file.

        Returns:
            Dict with page_count, file_size, is_scanned, checksum

        Raises:
            ConversionError: If validation fails
        """
        file_size = len(file_content)

        # Size check
        if file_size > settings.MAX_FILE_SIZE_BYTES:
            raise ConversionError(
                code="FILE_TOO_LARGE",
                message=f"File size {file_size / 1024 / 1024:.1f}MB exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
                status_code=413,
            )

        # Calculate checksum for duplicate detection
        checksum = hashlib.sha256(file_content).hexdigest()

        # Check for duplicate in cache
        if self.redis:
            existing = await self.redis.get(f"pdf_hash:{checksum}")
            if existing:
                raise ConversionError(
                    code="DUPLICATE_FILE",
                    message="This file has already been processed",
                    status_code=409,
                )

        # Validate PDF and count pages
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                page_count = len(pdf.pages)

                if page_count > settings.MAX_PAGE_COUNT:
                    raise ConversionError(
                        code="TOO_MANY_PAGES",
                        message=f"PDF has {page_count} pages, max is {settings.MAX_PAGE_COUNT}",
                        status_code=413,
                    )

                if page_count == 0:
                    raise ConversionError(
                        code="EMPTY_PDF",
                        message="PDF has no pages",
                        status_code=400,
                    )

                # Check if scanned (no extractable text)
                is_scanned = True
                for page in pdf.pages[:3]:  # Check first 3 pages
                    text = page.extract_text()
                    if text and len(text.strip()) > 50:
                        is_scanned = False
                        break

        except ConversionError:
            raise
        except Exception as e:
            raise ConversionError(
                code="INVALID_PDF",
                message=f"Could not process PDF: {str(e)}",
                status_code=400,
            )

        return {
            "page_count": page_count,
            "file_size": file_size,
            "is_scanned": is_scanned,
            "checksum": checksum,
        }

    async def extract_text(self, file_content: bytes) -> str:
        """Extract text from a text-based PDF."""
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                pages_text = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)
                return "\n\n---PAGE BREAK---\n\n".join(pages_text)
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            return ""

    async def extract_images(
        self, file_content: bytes, dpi: int = None
    ) -> list[bytes]:
        """
        Convert PDF pages to PNG images for vision model processing.

        Returns:
            List of PNG image bytes, one per page
        """
        dpi = dpi or settings.PDF_DPI

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name

        try:
            images = convert_from_path(
                tmp_path,
                dpi=dpi,
                fmt="png",
                thread_count=4,
            )

            image_bytes_list = []
            for image in images:
                img_buffer = io.BytesIO()
                image.save(img_buffer, format="PNG", optimize=True)
                image_bytes_list.append(img_buffer.getvalue())

            return image_bytes_list
        finally:
            os.unlink(tmp_path)

    async def validate_extraction(self, result: ExtractionResult) -> dict:
        """
        Validate extraction results including balance reconciliation.

        Returns:
            Validation report with issues and confidence score
        """
        issues = []
        warnings = []

        if not result.transactions:
            issues.append("No transactions extracted")

        # Check statement metadata
        meta = result.statement_metadata
        if not meta.get("bank_name"):
            warnings.append("Bank name not identified")
        if not meta.get("account_number"):
            warnings.append("Account number not identified")

        # Validate dates
        for i, tx in enumerate(result.transactions):
            if not tx.get("date"):
                issues.append(f"Transaction {i + 1}: Missing date")

        # Balance reconciliation
        opening = result.opening_balance.get("amount", 0)
        closing = result.closing_balance.get("amount", 0)
        total_credits = sum(
            t.get("credit", 0) or 0 for t in result.transactions
        )
        total_debits = sum(
            t.get("debit", 0) or 0 for t in result.transactions
        )
        calculated_closing = opening + total_credits - total_debits

        variance = abs(calculated_closing - closing)
        tolerance = max(0.01, abs(closing) * 0.001)  # 0.1% or $0.01

        reconciliation = {
            "opening_balance": opening,
            "total_credits": round(total_credits, 2),
            "total_debits": round(total_debits, 2),
            "calculated_closing": round(calculated_closing, 2),
            "statement_closing": closing,
            "variance": round(variance, 2),
            "matches": variance <= tolerance,
            "tolerance": tolerance,
        }

        if not reconciliation["matches"]:
            warnings.append(
                f"Balance mismatch: calculated ${calculated_closing:.2f} "
                f"vs statement ${closing:.2f} (variance: ${variance:.2f})"
            )

        # Overall confidence
        avg_tx_confidence = result.confidence_score
        validation_score = 1.0
        validation_score -= len(issues) * 0.2
        validation_score -= len(warnings) * 0.05
        validation_score = max(0.0, min(1.0, validation_score))

        overall_confidence = avg_tx_confidence * validation_score

        return {
            "issues": issues,
            "warnings": warnings,
            "reconciliation": reconciliation,
            "transaction_count": len(result.transactions),
            "validation_score": round(validation_score, 2),
            "overall_confidence": round(overall_confidence, 2),
            "is_valid": len(issues) == 0 and overall_confidence >= 0.5,
        }

    async def process_conversion(
        self,
        user_id: str,
        file_content: bytes,
        filename: str,
        portal_id: str = None,
    ) -> Conversion:
        """
        Main conversion pipeline: validate, extract, process, store.

        Returns:
            Conversion model instance with results
        """
        # Step 1: Validate PDF
        validation = await self.validate_pdf(file_content, filename)
        page_count = validation["page_count"]
        is_scanned = validation["is_scanned"]
        checksum = validation["checksum"]

        # Step 2: Create conversion record
        conversion = Conversion(
            user_id=user_id,
            portal_id=portal_id,
            filename=filename,
            original_file_key=checksum,  # Will be updated after S3 upload
            file_size_bytes=validation["file_size"],
            page_count=page_count,
            status=ConversionStatus.PROCESSING,
        )
        self.db.add(conversion)
        await self.db.flush()

        try:
            # Step 3: Check and deduct credits
            credits_used = await self._check_and_deduct_credits(
                user_id, page_count, conversion.id
            )
            conversion.credits_consumed = credits_used

            # Step 4: Upload to S3
            file_key = await self.storage.upload_pdf(
                file_content, str(conversion.id), filename
            )
            conversion.original_file_key = file_key

            # Step 5: Extract data
            conversion.status = ConversionStatus.EXTRACTING
            await self.db.flush()

            if is_scanned:
                # Convert to images and use vision model
                images = await self.extract_images(file_content)
                extraction = await self.moonshot.extract_from_images(images)
            else:
                # Extract text and use text model
                text = await self.extract_text(file_content)
                extraction = await self.moonshot.extract_from_text(text)

            # Step 6: Validate results
            conversion.status = ConversionStatus.VALIDATING
            await self.db.flush()

            validation_report = await self.validate_extraction(extraction)

            if not extraction.success:
                conversion.status = ConversionStatus.FAILED
                conversion.error_message = extraction.error_message
                conversion.error_code = "EXTRACTION_FAILED"
                # Refund credits
                await self._refund_credits(user_id, credits_used, str(conversion.id))
                await self.db.commit()
                return conversion

            # Step 7: Store results
            conversion.status = ConversionStatus.COMPLETED
            conversion.model_used = extraction.model_used
            conversion.statement_metadata = extraction.statement_metadata
            conversion.opening_balance = extraction.opening_balance
            conversion.closing_balance = extraction.closing_balance
            conversion.summary = extraction.summary
            conversion.reconciliation = {
                **extraction.reconciliation,
                "validation_report": validation_report,
            }
            conversion.completed_at = datetime.now(timezone.utc)

            # Step 8: Store transactions
            for tx_data in extraction.transactions:
                transaction = Transaction(
                    conversion_id=conversion.id,
                    transaction_date=tx_data.get("date"),
                    description=tx_data.get("description", ""),
                    reference=tx_data.get("reference"),
                    category=tx_data.get("category"),
                    debit=Decimal(str(tx_data["debit"])) if tx_data.get("debit") else None,
                    credit=Decimal(str(tx_data["credit"])) if tx_data.get("credit") else None,
                    amount=Decimal(str(tx_data.get("amount", 0))),
                    currency=tx_data.get("currency", "USD"),
                    running_balance=Decimal(str(tx_data["balance"])) if tx_data.get("balance") else None,
                    confidence_score=Decimal(str(tx_data.get("confidence_score", 0.9))),
                    raw_text=tx_data.get("raw_text"),
                )
                self.db.add(transaction)

            # Cache the hash
            if self.redis:
                await self.redis.setex(
                    f"pdf_hash:{checksum}",
                    86400,  # 24 hours
                    str(conversion.id),
                )

            await self.db.commit()
            return conversion

        except ConversionError:
            await self.db.rollback()
            raise
        except Exception as e:
            logger.exception("Conversion processing failed")
            conversion.status = ConversionStatus.FAILED
            conversion.error_message = str(e)
            conversion.error_code = "PROCESSING_ERROR"
            await self.db.commit()
            raise ConversionError(
                code="PROCESSING_ERROR",
                message=f"Unexpected error: {str(e)}",
                status_code=500,
            )

    async def _refund_credits(self, user_id: str, amount: Decimal, conversion_id: str):
        """Refund credits for a failed conversion."""
        result = await self.db.execute(
            select(Credit).where(Credit.user_id == user_id)
        )
        credit = result.scalar_one_or_none()
        if credit:
            credit.balance = Decimal(credit.balance) + amount

        credit_tx = CreditTransaction(
            user_id=user_id,
            conversion_id=conversion_id,
            type=CreditTransactionType.REFUND,
            amount=amount,
            description="Refund for failed conversion",
        )
        self.db.add(credit_tx)
        await self.db.commit()
