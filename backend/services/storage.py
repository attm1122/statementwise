"""
File storage service using MinIO/S3-compatible API.
Handles PDF uploads and export file storage.
"""

import io
import logging
from datetime import timedelta
from typing import Optional

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class StorageService:
    """Service for storing and retrieving files from S3/MinIO."""

    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version="s3v4"),
        )
        self.pdf_bucket = settings.S3_BUCKET_PDFS
        self.export_bucket = settings.S3_BUCKET_EXPORTS

    async def upload_pdf(self, content: bytes, conversion_id: str, filename: str) -> str:
        """Upload a PDF file to S3. Returns the S3 key."""
        key = f"conversions/{conversion_id}/{filename}"
        try:
            self.s3.put_object(
                Bucket=self.pdf_bucket,
                Key=key,
                Body=content,
                ContentType="application/pdf",
                Metadata={
                    "conversion-id": conversion_id,
                    "original-filename": filename,
                },
            )
            return key
        except ClientError as e:
            logger.error(f"Failed to upload PDF: {e}")
            raise

    async def get_presigned_url(
        self,
        key: str,
        bucket: str = None,
        expiry: int = 3600,
    ) -> str:
        """Generate a presigned URL for temporary access."""
        bucket = bucket or self.pdf_bucket
        try:
            url = self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expiry,
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            raise

    async def upload_export(
        self,
        content: bytes,
        conversion_id: str,
        filename: str,
        content_type: str,
    ) -> str:
        """Upload an export file to S3. Returns the S3 key."""
        key = f"exports/{conversion_id}/{filename}"
        try:
            self.s3.put_object(
                Bucket=self.export_bucket,
                Key=key,
                Body=content,
                ContentType=content_type,
            )
            return key
        except ClientError as e:
            logger.error(f"Failed to upload export: {e}")
            raise

    async def delete_file(self, key: str, bucket: str = None):
        """Delete a file from S3."""
        bucket = bucket or self.pdf_bucket
        try:
            self.s3.delete_object(Bucket=bucket, Key=key)
        except ClientError as e:
            logger.error(f"Failed to delete file: {e}")
