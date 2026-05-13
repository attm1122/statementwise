"""
Database configuration and session management.
Async SQLAlchemy with PostgreSQL.
"""

import os
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

from core.config import get_settings

settings = get_settings()

# Create async engine. Development can bootstrap with SQLite, but production
# must use an explicit DATABASE_URL validated by Settings.
database_url = settings.async_database_url
if settings.is_development and os.environ.get("DATABASE_URL") is None:
    # No DATABASE_URL set in development — use SQLite for bootstrapping.
    database_url = "sqlite+aiosqlite:///./statementwise.db"

try:
    engine = create_async_engine(
        database_url,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DATABASE_ECHO,
        future=True,
    )
except Exception:
    # Final fallback — SQLite in-memory (app starts, features degraded)
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        future=True,
    )

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db():
    """Get a database session - use as FastAPI dependency."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context():
    """Context manager for database sessions."""
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def init_db():
    """Initialize database tables."""
    from models.base import Base
    from models.user import User
    from models.conversion import Conversion
    from models.transaction import Transaction
    from models.portal import Portal, PortalMember
    from models.credit import Credit, CreditTransaction
    from models.api_key import APIKey

    async with engine.begin() as conn:
        # In production, use Alembic migrations instead
        if settings.is_development:
            await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    await engine.dispose()
