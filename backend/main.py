"""
Statementwise.ai - FastAPI Application
Main application factory with middleware, routers, and error handling.
"""

import logging
import time
import uuid
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from core.config import get_settings
from core.database import engine, init_db, close_db, get_db
from core.auth import get_current_user
from routers import auth, convert, dashboard, portal, billing, api_keys, webhooks

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("statementwise")


# ── Request ID Middleware ────────────────────────────────────────

class RequestIDMiddleware:
    """ASGI middleware: adds unique request ID to each request."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request_id = str(uuid.uuid4())[:8]
        request = Request(scope, receive)
        request.state.request_id = request_id

        start_time = time.time()

        async def wrapped_send(message):
            if message["type"] == "http.response.start":
                duration = (time.time() - start_time) * 1000
                headers = message.get("headers", [])
                headers.append([b"x-request-id", request_id.encode()])
                headers.append([b"x-response-time", f"{duration:.0f}ms".encode()])
                message["headers"] = headers
                logger.info(
                    f"{request.method} {request.url.path} - "
                    f"{duration:.0f}ms - {request_id}"
                )
            await send(message)

        await self.app(scope, receive, wrapped_send)


# ── Rate Limit Middleware ────────────────────────────────────────

class RateLimitMiddleware:
    """ASGI middleware: rate limiting via Redis."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope, receive)
        redis_client = getattr(request.app.state, "redis", None)
        if redis_client is None or request.url.path in (
            "/health", "/docs", "/openapi.json", "/favicon.ico",
        ):
            return await self.app(scope, receive, send)

        user_id = "anonymous"
        try:
            if hasattr(request.state, "user") and request.state.user:
                user_id = request.state.user.get("user_id", "anonymous")
        except Exception:
            pass
        if user_id == "anonymous":
            user_id = request.client.host if request.client else "unknown"

        key = f"rate_limit:{user_id}:{request.url.path}"
        try:
            current = await redis_client.incr(key)
            if current == 1:
                await redis_client.expire(key, settings.RATE_LIMIT_WINDOW_SECONDS)
            limit = settings.RATE_LIMIT_FREE_RPM
            try:
                if hasattr(request.state, "user") and request.state.user:
                    role = request.state.user.get("role", "free")
                    if role == "admin":
                        limit = settings.RATE_LIMIT_ENTERPRISE_RPM
                    elif role == "pro":
                        limit = settings.RATE_LIMIT_PRO_RPM
                    elif role == "basic":
                        limit = settings.RATE_LIMIT_BASIC_RPM
            except Exception:
                pass
            if current > limit:
                body = json.dumps({"success": False, "error": {"code": "RATE_LIMIT_EXCEEDED", "message": f"Rate limit of {limit} requests per minute exceeded", "details": {"limit": limit, "window": settings.RATE_LIMIT_WINDOW_SECONDS}}}).encode()
                await send({"type": "http.response.start", "status": 429,
                    "headers": [[b"content-type", b"application/json"], [b"retry-after", str(settings.RATE_LIMIT_WINDOW_SECONDS).encode()]]})
                await send({"type": "http.response.body", "body": body})
                return
        except Exception:
            pass

        await self.app(scope, receive, send)


# ── Error Handlers ───────────────────────────────────────────────

async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(exc),
                "details": getattr(exc, "errors", []),
            },
        },
    )


async def http_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": getattr(exc, "detail", "UNKNOWN"),
                "message": str(exc.detail) if hasattr(exc, "detail") else str(exc),
            },
        },
    )


async def general_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"Unhandled exception [req_id={request_id}]: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "request_id": request_id,
            },
        },
    )


# ── Lifespan ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    # Startup
    logger.info("Starting Statementwise API...")
    
    # Initialize database (best effort - app starts even if DB is down)
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning(f"Database initialization skipped: {e}")
    
    # Connect to Redis (best effort - rate limiting disabled if Redis is down)
    try:
        app.state.redis = redis.from_url(str(settings.REDIS_URL))
        await app.state.redis.ping()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning(f"Redis not available: {e}")
        app.state.redis = None

    logger.info(f"Statementwise API v{settings.APP_VERSION} ready")
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    try:
        if app.state.redis:
            await app.state.redis.close()
    except Exception:
        pass
    try:
        await close_db()
    except Exception:
        pass


# ── App Factory ──────────────────────────────────────────────────

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Bank statement conversion API powered by Moonshot AI",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        openapi_url="/openapi.json" if settings.is_development else None,
        lifespan=lifespan,
    )

    # ── Middleware ──────────────────────────────────────────────
    
    # Trusted hosts
    if settings.is_production:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["statementwiseai.com", "*.statementwiseai.com", "api.statementwiseai.com"],
        )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
        expose_headers=["X-Request-ID", "X-Response-Time", "X-RateLimit-Remaining"],
    )

    # Gzip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Request ID + Logging
    app.add_middleware(RequestIDMiddleware)

    # Rate Limiting
    app.add_middleware(RateLimitMiddleware)

    # Error handlers
    from fastapi.exceptions import RequestValidationError, HTTPException
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

    # ── Routers ─────────────────────────────────────────────────
    
    app.include_router(auth.router, prefix="/v1/auth", tags=["Authentication"])
    app.include_router(convert.router, prefix="/v1/convert", tags=["Conversion"])
    app.include_router(dashboard.router, prefix="/v1/dashboard", tags=["Dashboard"])
    app.include_router(portal.router, prefix="/v1/portals", tags=["Portals"])
    app.include_router(billing.router, prefix="/v1/billing", tags=["Billing"])
    app.include_router(api_keys.router, prefix="/v1/api-keys", tags=["API Keys"])
    app.include_router(webhooks.router, prefix="/v1/webhooks", tags=["Webhooks"])

    # ── Health Check ────────────────────────────────────────────
    
    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint."""
        health = {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.ENV,
            "timestamp": time.time(),
        }
        
        # Check Redis
        try:
            if hasattr(app.state, "redis") and app.state.redis:
                await app.state.redis.ping()
                health["redis"] = "connected"
            else:
                health["redis"] = "not_configured"
        except Exception as e:
            health["redis"] = f"error: {str(e)}"

        return health

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/v1/docs",
            "health": "/health",
        }

    return app


# Create the application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.is_development,
        workers=1 if settings.is_development else settings.WORKERS,
    )