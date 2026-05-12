"""
Celery task definitions for Statementwise.ai
Handles async processing: conversions, exports, webhooks
"""

import os
from celery import Celery
from celery.signals import task_failure, task_success

# ── Configuration ──────────────────────────────────────────────────

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

app = Celery("statementwise")
app.conf.update(
    broker_url=redis_url,
    result_backend=redis_url,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per task
    task_soft_time_limit=240,  # 4 minutes soft limit
    worker_prefetch_multiplier=1,  # One task at a time per worker
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
    broker_connection_retry_on_startup=True,
    # Result expiry
    result_expires=3600,  # 1 hour
    # Task routing
    task_routes={
        "tasks.process_conversion": {"queue": "conversion"},
        "tasks.process_llm_extraction": {"queue": "llm"},
        "tasks.process_export": {"queue": "export"},
        "tasks.send_webhook": {"queue": "webhooks"},
        "tasks.send_notification": {"queue": "notifications"},
        "tasks.cleanup_old_data": {"queue": "maintenance"},
    },
    # Beat schedule (periodic tasks)
    beat_schedule={
        "cleanup-old-conversions": {
            "task": "tasks.cleanup_old_data",
            "schedule": 86400,  # Daily
        },
        "process-stale-conversions": {
            "task": "tasks.process_stale_conversions",
            "schedule": 300,  # Every 5 minutes
        },
    },
)


# ── Tasks ──────────────────────────────────────────────────────────

@app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_conversion(self, conversion_id: str, file_path: str):
    """Process a bank statement conversion end-to-end."""
    try:
        # TODO: Implement actual conversion pipeline
        # 1. Extract text/images from PDF
        # 2. Send to Moonshot API
        # 3. Validate and store results
        # 4. Update conversion status
        pass
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2, default_retry_delay=30)
def process_llm_extraction(self, conversion_id: str, image_paths: list):
    """Send bank statement images to Moonshot API for extraction."""
    try:
        # TODO: Call MoonshotClient.extract_from_images()
        pass
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=2, default_retry_delay=30)
def process_export(self, conversion_id: str, format: str, user_id: str):
    """Generate export file in requested format."""
    try:
        # TODO: Call ExportService
        pass
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=5, default_retry_delay=10)
def send_webhook(self, webhook_url: str, payload: dict, signature: str):
    """Send webhook to external URL with retry."""
    import httpx
    try:
        response = httpx.post(
            webhook_url,
            json=payload,
            headers={
                "X-Statementwise-Signature": signature,
                "Content-Type": "application/json",
                "User-Agent": "Statementwise-Webhook/1.0",
            },
            timeout=30,
        )
        response.raise_for_status()
        return {"status": "delivered", "http_status": response.status_code}
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=3, default_retry_delay=30)
def send_notification(self, user_id: str, notification_type: str, data: dict):
    """Send email notification to user."""
    try:
        # TODO: Implement email sending via SMTP
        pass
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task
def cleanup_old_data():
    """Clean up old conversion files and expired data."""
    # TODO: Implement cleanup logic
    pass


@app.task
def process_stale_conversions():
    """Find and restart conversions stuck in processing state."""
    # TODO: Implement stale conversion detection
    pass


# ── Event Handlers ─────────────────────────────────────────────────

@task_success.connect
def handle_task_success(sender=None, result=None, **kwargs):
    """Log successful task completion."""
    pass


@task_failure.connect
def handle_task_failure(sender=None, task_id=None, exception=None, **kwargs):
    """Log task failures for monitoring."""
    pass
