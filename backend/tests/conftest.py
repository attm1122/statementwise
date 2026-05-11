"""
Pytest fixtures and configuration.
"""

import asyncio
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

# Use SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def engine():
    """Create a test database engine."""
    from models.base import Base
    
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=NullPool,
        echo=False,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def db_session(engine):
    """Create a test database session."""
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
def mock_user_data():
    """Sample user data for tests."""
    return {
        "email": "test@example.com",
        "password": "SecurePassword123!",
        "full_name": "Test User",
        "company_name": "Test Corp",
    }


@pytest.fixture
def mock_moonshot_response():
    """Mock successful Moonshot API response."""
    return {
        "success": True,
        "transactions": [
            {
                "date": "2024-01-15",
                "description": "PAYROLL DEPOSIT - ACME CORP",
                "reference": "ACH-123456",
                "category": "Income",
                "debit": None,
                "credit": 3850.00,
                "amount": 3850.00,
                "currency": "USD",
                "balance": 8373.87,
                "confidence_score": 1.0,
            },
            {
                "date": "2024-01-20",
                "description": "RENT PAYMENT - ABC APARTMENTS",
                "reference": "ACH-OUT-789",
                "category": "Payment",
                "debit": 1850.00,
                "credit": None,
                "amount": 1850.00,
                "currency": "USD",
                "balance": 6523.87,
                "confidence_score": 1.0,
            },
        ],
        "statement_metadata": {
            "bank_name": "Chase Bank",
            "account_holder": "JOHN DOE",
            "account_number": "****4567",
            "account_type": "Checking",
            "statement_period": {"start_date": "2024-01-01", "end_date": "2024-01-31"},
            "statement_date": "2024-02-01",
            "currency": "USD",
        },
        "opening_balance": {"amount": 4523.87, "date": "2024-01-01", "currency": "USD"},
        "closing_balance": {"amount": 2673.87, "date": "2024-01-31", "currency": "USD"},
        "summary": {
            "total_credits": 3850.00,
            "total_debits": 5700.00,
            "total_fees": 0.00,
            "total_interest": 0.00,
            "transaction_count": 2,
        },
        "reconciliation": {
            "calculated_closing": 2673.87,
            "matches_statement": True,
            "variance": 0.00,
        },
    }


@pytest.fixture
def mock_moonshot_api_error():
    """Mock Moonshot API error response."""
    return {
        "error": {
            "code": "rate_limit_exceeded",
            "message": "Rate limit exceeded. Please try again later.",
        }
    }
