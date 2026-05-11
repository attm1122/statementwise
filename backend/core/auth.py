"""
Authentication module for Statementwise API.
Handles JWT tokens, password hashing, and API key authentication.
"""

import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import get_settings

settings = get_settings()

# ── Password Hashing ─────────────────────────────────────────────

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.BCRYPT_ROUNDS,
)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Tokens ────────────────────────────────────────────────────

def create_access_token(
    user_id: str,
    email: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "type": "access",
        "jti": secrets.token_urlsafe(16),
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(
        payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(user_id: str) -> str:
    """Create a JWT refresh token."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "jti": secrets.token_urlsafe(16),
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(
        payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── API Keys ──────────────────────────────────────────────────────

def generate_api_key() -> tuple[str, str]:
    """Generate a new API key. Returns (full_key, key_hash)."""
    key_id = secrets.token_urlsafe(12)
    secret = secrets.token_urlsafe(32)
    full_key = f"{settings.API_KEY_PREFIX}_{key_id}_{secret}"
    key_hash = pwd_context.hash(full_key)
    return full_key, key_hash


def get_key_prefix(full_key: str) -> str:
    """Extract the prefix (first 8 chars) from an API key."""
    parts = full_key.split("_")
    if len(parts) >= 2:
        return f"{parts[0]}_{parts[1]}"
    return full_key[:8]


def verify_api_key(plain_key: str, key_hash: str) -> bool:
    """Verify an API key against its hash."""
    return pwd_context.verify(plain_key, key_hash)


# ── Dependencies ─────────────────────────────────────────────────

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """Dependency to get current user from JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user_id": payload["sub"],
        "email": payload.get("email"),
        "role": payload.get("role", "user"),
    }


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> Optional[dict]:
    """Optional dependency - returns user if authenticated, None otherwise."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


async def require_admin(
    current_user: dict = Security(get_current_user),
) -> dict:
    """Dependency requiring admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
