"""
Authentication router: register, login, profile, token refresh.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.config import get_settings
from core.database import get_db
from core.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from models.user import User, UserRole, UserStatus

settings = get_settings()
security = HTTPBearer()
router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: Optional[str]
    role: str
    email_verified: bool
    avatar_url: Optional[str]
    timezone: str
    locale: str
    created_at: str
    last_login_at: Optional[str]


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    timezone: Optional[str] = None
    locale: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=12, max_length=128)


# ── Routes ───────────────────────────────────────────────────────

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        company_name=data.company_name,
        role=UserRole.USER,
        status=UserStatus.ACTIVE,
        email_verified=False,
    )
    db.add(user)
    await db.flush()

    # Create credit record with free credits
    from models.credit import Credit
    credit = Credit(
        user_id=user.id,
        balance=settings.FREE_MONTHLY_CREDITS,
        lifetime_earned=settings.FREE_MONTHLY_CREDITS,
    )
    db.add(credit)
    await db.commit()

    # Generate tokens
    access_token = create_access_token(str(user.id), user.email, user.role)
    refresh_token = create_refresh_token(str(user.id))

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user.to_dict(),
        },
    }


@router.post("/login", response_model=dict)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deleted",
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    # Generate tokens
    access_token = create_access_token(str(user.id), user.email, user.role)
    refresh_token = create_refresh_token(str(user.id))

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user.to_dict(),
        },
    }


@router.post("/refresh", response_model=dict)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    # Get refresh token from cookie or body
    refresh_token = request.cookies.get("refresh_token") or request.headers.get("X-Refresh-Token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Generate new access token
    access_token = create_access_token(str(user.id), user.email, user.role)

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        },
    }


@router.get("/profile", response_model=dict)
async def get_profile(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get current user profile."""
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "success": True,
        "data": user.to_dict(),
    }


@router.patch("/profile", response_model=dict)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile."""
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.company_name is not None:
        user.company_name = data.company_name
    if data.timezone is not None:
        user.timezone = data.timezone
    if data.locale is not None:
        user.locale = data.locale

    await db.commit()
    return {"success": True, "data": user.to_dict()}


@router.post("/change-password", response_model=dict)
async def change_password(
    data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user password."""
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    user.hashed_password = hash_password(data.new_password)
    await db.commit()

    return {"success": True, "message": "Password changed successfully"}


@router.post("/logout", response_model=dict)
async def logout(response: Response):
    """Logout - clear cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"success": True, "message": "Logged out successfully"}
