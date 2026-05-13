"""
Moonshot AI API integration for bank statement extraction.
Handles PDF processing, vision model calls, and structured extraction.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import io
import json
import time
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Optional

import aiohttp
from openai import AsyncOpenAI
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from core.config import get_settings

settings = get_settings()


@dataclass
class ExtractionResult:
    """Result from Moonshot extraction."""

    success: bool
    transactions: list[dict] = field(default_factory=list)
    statement_metadata: dict = field(default_factory=dict)
    opening_balance: dict = field(default_factory=dict)
    closing_balance: dict = field(default_factory=dict)
    summary: dict = field(default_factory=dict)
    reconciliation: dict = field(default_factory=dict)
    model_used: str = ""
    tokens_input: int = 0
    tokens_output: int = 0
    cost_usd: float = 0.0
    processing_time_ms: float = 0.0
    error_message: str = ""
    confidence_score: float = 0.0


class MoonshotClient:
    """Client for Moonshot AI API with bank statement extraction capabilities."""

    # Model pricing per 1M tokens (input/output)
    MODEL_PRICING = {
        "moonshot-v1-8k-vision-preview": (0.20, 2.00),
        "moonshot-v1-32k-vision-preview": (1.00, 3.00),
        "moonshot-v1-128k-vision-preview": (2.00, 5.00),
        "kimi-k2-0711-preview": (0.60, 3.00),
    }

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.MOONSHOT_API_KEY,
            base_url=settings.MOONSHOT_BASE_URL,
        )
        self.default_model = settings.MOONSHOT_DEFAULT_MODEL
        self.fallback_models = settings.MOONSHOT_FALLBACK_MODELS

    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate API cost in USD."""
        input_price, output_price = self.MODEL_PRICING.get(model, (1.00, 3.00))
        input_cost = (input_tokens / 1_000_000) * input_price
        output_cost = (output_tokens / 1_000_000) * output_price
        return round(input_cost + output_cost, 6)

    def _select_model(self, page_count: int) -> str:
        """Select the optimal model based on page count."""
        if page_count <= 2:
            return "moonshot-v1-8k-vision-preview"
        elif page_count <= 15:
            return "moonshot-v1-32k-vision-preview"
        else:
            return "moonshot-v1-128k-vision-preview"

    def _encode_image(self, image_data: bytes) -> str:
        """Encode image bytes to base64 for API."""
        return base64.b64encode(image_data).decode("utf-8")

    @retry(
        retry=retry_if_exception_type((aiohttp.ClientError, asyncio.TimeoutError, Exception)),
        stop=stop_after_attempt(settings.MOONSHOT_MAX_RETRIES),
        wait=wait_exponential(
            multiplier=settings.MOONSHOT_RETRY_DELAY,
            min=2,
            max=30,
        ),
        reraise=True,
    )
    async def _call_api(
        self,
        model: str,
        messages: list[dict],
        temperature: float = None,
        max_tokens: int = None,
    ) -> dict:
        """Make an API call to Moonshot with retry logic."""
        temp = temperature if temperature is not None else settings.MOONSHOT_TEMPERATURE
        max_tok = max_tokens if max_tokens is not None else settings.MOONSHOT_MAX_TOKENS

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temp,
            max_tokens=max_tok,
            response_format={"type": "json_object"},
        )

        return {
            "content": response.choices[0].message.content,
            "model": response.model,
            "tokens_input": response.usage.prompt_tokens if response.usage else 0,
            "tokens_output": response.usage.completion_tokens if response.usage else 0,
        }

    async def extract_from_images(
        self,
        image_pages: list[bytes],
        model: str = None,
        system_prompt: str = None,
        user_prompt_template: str = None,
    ) -> ExtractionResult:
        """
        Extract structured transaction data from bank statement page images.

        Args:
            image_pages: List of PNG/JPEG image bytes for each page
            model: Model to use (auto-selected if None)
            system_prompt: Custom system prompt
            user_prompt_template: Custom user prompt template

        Returns:
            ExtractionResult with transactions and metadata
        """
        start_time = time.time()
        page_count = len(image_pages)

        # Select model
        selected_model = model or self._select_model(page_count)

        # Use default prompts if not provided
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        if user_prompt_template is None:
            user_prompt_template = self._get_default_user_prompt()

        # Build messages with images
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt_template},
                    *[
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{self._encode_image(img)}",
                                "detail": "high",
                            },
                        }
                        for img in image_pages
                    ],
                ],
            },
        ]

        # Try primary model, fall back on failure
        last_error = None
        models_to_try = [selected_model] + [
            m for m in self.fallback_models if m != selected_model
        ]

        for attempt_model in models_to_try:
            try:
                result = await self._call_api(attempt_model, messages)
                break
            except Exception as e:
                last_error = e
                continue
        else:
            return ExtractionResult(
                success=False,
                error_message=f"All models failed. Last error: {str(last_error)}",
            )

        # Parse JSON response
        try:
            parsed = json.loads(result["content"])
        except json.JSONDecodeError as e:
            return ExtractionResult(
                success=False,
                tokens_input=result.get("tokens_input", 0),
                tokens_output=result.get("tokens_output", 0),
                error_message=f"Failed to parse JSON response: {str(e)}",
            )

        processing_time = (time.time() - start_time) * 1000
        cost = self._calculate_cost(
            result.get("model", attempt_model),
            result.get("tokens_input", 0),
            result.get("tokens_output", 0),
        )

        # Calculate average confidence
        transactions = parsed.get("transactions", [])
        avg_confidence = 0.0
        if transactions:
            scores = [
                t.get("confidence_score", t.get("confidence", 0.9))
                for t in transactions
            ]
            avg_confidence = sum(scores) / len(scores)

        return ExtractionResult(
            success=True,
            transactions=transactions,
            statement_metadata=parsed.get("statement_metadata", {}),
            opening_balance=parsed.get("opening_balance", {}),
            closing_balance=parsed.get("closing_balance", {}),
            summary=parsed.get("summary", {}),
            reconciliation=parsed.get("reconciliation", {}),
            model_used=result.get("model", attempt_model),
            tokens_input=result.get("tokens_input", 0),
            tokens_output=result.get("tokens_output", 0),
            cost_usd=cost,
            processing_time_ms=round(processing_time, 2),
            confidence_score=round(avg_confidence, 2),
        )

    async def extract_from_text(
        self,
        text_content: str,
        model: str = "kimi-k2-0711-preview",
        system_prompt: str = None,
    ) -> ExtractionResult:
        """
        Extract transactions from text-based PDF content.
        Used for text-based PDFs where images are not needed.
        """
        start_time = time.time()

        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Extract all transactions from this bank statement text:\n\n```\n{text_content}\n```",
            },
        ]

        try:
            result = await self._call_api(model, messages)
        except Exception as e:
            return ExtractionResult(
                success=False,
                error_message=f"Text extraction failed: {str(e)}",
            )

        try:
            parsed = json.loads(result["content"])
        except json.JSONDecodeError as e:
            return ExtractionResult(
                success=False,
                error_message=f"Failed to parse JSON: {str(e)}",
            )

        processing_time = (time.time() - start_time) * 1000
        cost = self._calculate_cost(
            result.get("model", model),
            result.get("tokens_input", 0),
            result.get("tokens_output", 0),
        )

        return ExtractionResult(
            success=True,
            transactions=parsed.get("transactions", []),
            statement_metadata=parsed.get("statement_metadata", {}),
            opening_balance=parsed.get("opening_balance", {}),
            closing_balance=parsed.get("closing_balance", {}),
            summary=parsed.get("summary", {}),
            reconciliation=parsed.get("reconciliation", {}),
            model_used=result.get("model", model),
            tokens_input=result.get("tokens_input", 0),
            tokens_output=result.get("tokens_output", 0),
            cost_usd=cost,
            processing_time_ms=round(processing_time, 2),
        )

    def _get_default_system_prompt(self) -> str:
        """Get the default system prompt for bank statement extraction."""
        return """You are a specialized bank statement extraction engine. Your task is to analyze bank statement images and extract all transactions into structured JSON format.

## Rules:
1. Extract ALL transactions visible in the statement - never skip any row
2. Parse dates in the format shown on the statement (convert to ISO 8601: YYYY-MM-DD)
3. For each transaction, determine if it is a debit (money out) or credit (money in)
4. Extract the running balance if shown
5. Calculate totals and verify they match the statement summary
6. Identify the bank name, account number, statement period, opening and closing balances
7. Assign categories to transactions when possible
8. If information is unclear, use your best judgment and flag with a lower confidence score

## Output Format (strict JSON):
{
  "statement_metadata": {
    "bank_name": "string",
    "account_holder": "string",
    "account_number": "string (masked, e.g., ****1234)",
    "account_type": "string (Checking/Savings/Credit Card/etc.)",
    "statement_period": {"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"},
    "statement_date": "YYYY-MM-DD",
    "currency": "USD"
  },
  "opening_balance": {"amount": 0.00, "date": "YYYY-MM-DD"},
  "closing_balance": {"amount": 0.00, "date": "YYYY-MM-DD"},
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "reference": "string or null",
      "category": "string or null",
      "debit": 0.00 or null,
      "credit": 0.00 or null,
      "amount": 0.00 (always positive, use debit/credit for direction),
      "currency": "USD",
      "balance": 0.00 or null,
      "confidence_score": 0.95
    }
  ],
  "summary": {
    "total_credits": 0.00,
    "total_debits": 0.00,
    "transaction_count": 0
  },
  "reconciliation": {
    "calculated_closing": 0.00,
    "matches_statement": true,
    "variance": 0.00
  }
}

## Important:
- Return ONLY valid JSON, no markdown, no explanations
- All monetary amounts should be numeric (not strings)
- Dates must be ISO 8601 format
- If a field cannot be determined, use null (not empty string)
- Ensure the reconciliation section verifies opening + credits - debits == closing
"""

    def _get_default_user_prompt(self) -> str:
        """Get the default user prompt template."""
        return "Extract all transactions from the attached bank statement image(s). Return the data in the exact JSON format specified. Process all pages as a single continuous statement."
