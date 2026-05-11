"""
Statementwise.ai - Core Configuration
Pydantic Settings with environment variable support
"""

import secrets
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────
    APP_NAME: str = "Statementwise API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: str = "production"  # development, staging, production

    # ── Server ─────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    REQUEST_TIMEOUT: int = 120

    # ── Security ───────────────────────────────────────────────────
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    API_KEY_PREFIX: str = "sw"
    BCRYPT_ROUNDS: int = 12
    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536

    # ── CORS ───────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://statementwise.ai"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # ── Database ───────────────────────────────────────────────────
    DATABASE_URL: PostgresDsn = "postgresql+asyncpg://postgres:postgres@localhost:5432/statementwise"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = False

    # ── Redis ──────────────────────────────────────────────────────
    REDIS_URL: RedisDsn = "redis://localhost:6379/0"
    REDIS_POOL_SIZE: int = 100

    # ── MinIO / S3 ─────────────────────────────────────────────────
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_PDFS: str = "statementwise-pdfs"
    S3_BUCKET_EXPORTS: str = "statementwise-exports"
    S3_REGION: str = "us-east-1"
    S3_USE_SSL: bool = False

    # ── Moonshot AI ────────────────────────────────────────────────
    MOONSHOT_API_KEY: str = ""
    MOONSHOT_BASE_URL: str = "https://api.moonshot.cn/v1"
    MOONSHOT_DEFAULT_MODEL: str = "moonshot-v1-32k-vision-preview"
    MOONSHOT_FALLBACK_MODELS: List[str] = [
        "moonshot-v1-8k-vision-preview",
        "moonshot-v1-128k-vision-preview",
        "kimi-k2-0711-preview",
    ]
    MOONSHOT_REQUEST_TIMEOUT: int = 120
    MOONSHOT_MAX_RETRIES: int = 3
    MOONSHOT_RETRY_DELAY: float = 2.0
    MOONSHOT_TEMPERATURE: float = 0.1
    MOONSHOT_MAX_TOKENS: int = 8192

    # ── Conversion Settings ────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 50
    MAX_PAGE_COUNT: int = 100
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024  # 50MB
    SUPPORTED_FILE_TYPES: List[str] = ["application/pdf"]
    PDF_DPI: int = 200
    CONVERSION_TIMEOUT_SECONDS: int = 300

    # ── Credits ────────────────────────────────────────────────────
    CREDITS_PER_PAGE: float = 0.5
    CREDITS_PER_CONVERSION_BASE: float = 1.0
    FREE_MONTHLY_CREDITS: float = 5.0

    # ── Rate Limiting ──────────────────────────────────────────────
    RATE_LIMIT_FREE_RPM: int = 3
    RATE_LIMIT_BASIC_RPM: int = 20
    RATE_LIMIT_PRO_RPM: int = 100
    RATE_LIMIT_ENTERPRISE_RPM: int = 1000
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ── Billing ────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRICE_BASIC_ID: Optional[str] = None
    STRIPE_PRICE_PRO_ID: Optional[str] = None
    STRIPE_PRICE_ENTERPRISE_ID: Optional[str] = None

    # ── Webhooks ───────────────────────────────────────────────────
    WEBHOOK_SECRET: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    WEBHOOK_MAX_RETRIES: int = 5
    WEBHOOK_RETRY_DELAYS: List[int] = [1, 5, 15, 60, 300]

    # ── Email ──────────────────────────────────────────────────────
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@statementwise.ai"
    SMTP_TLS: bool = True

    # ── Logging ────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json, text
    LOG_RETENTION_DAYS: int = 30

    # ── Feature Flags ──────────────────────────────────────────────
    ENABLE_REGISTRATION: bool = True
    ENABLE_OAUTH_GOOGLE: bool = False
    ENABLE_PORTALS: bool = True
    ENABLE_WEBHOOKS: bool = True
    ENABLE_BILLING: bool = True

    @property
    def is_development(self) -> bool:
        return self.ENV.lower() == "development"

    @property
    def is_production(self) -> bool:
        return self.ENV.lower() == "production"

    @property
    def async_database_url(self) -> str:
        """Return async-compatible database URL."""
        url = str(self.DATABASE_URL)
        if "postgresql+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            url = url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        return url

    @property
    def sync_database_url(self) -> str:
        """Return sync database URL for migrations."""
        url = str(self.DATABASE_URL)
        if "asyncpg" in url:
            url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
        return url


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
