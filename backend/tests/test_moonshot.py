"""
Unit and integration tests for Moonshot API integration.
"""

import json
import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

from services.moonshot import MoonshotClient, ExtractionResult


class TestExtractionResult:
    """Test ExtractionResult dataclass."""

    def test_default_result(self):
        """Test default extraction result."""
        result = ExtractionResult(success=True)
        
        assert result.success is True
        assert result.transactions == []
        assert result.tokens_input == 0
        assert result.tokens_output == 0
        assert result.cost_usd == 0.0

    def test_result_with_transactions(self):
        """Test extraction result with transactions."""
        result = ExtractionResult(
            success=True,
            transactions=[{"date": "2024-01-01", "amount": 100.00}],
            tokens_input=1000,
            tokens_output=500,
            cost_usd=0.015,
        )
        
        assert len(result.transactions) == 1
        assert result.tokens_input == 1000
        assert result.cost_usd == 0.015


class TestMoonshotClient:
    """Test Moonshot client functionality."""

    def test_model_selection_small(self):
        """Test model selection for small documents."""
        client = MoonshotClient()
        
        assert client._select_model(1) == "moonshot-v1-8k-vision-preview"
        assert client._select_model(2) == "moonshot-v1-8k-vision-preview"

    def test_model_selection_medium(self):
        """Test model selection for medium documents."""
        client = MoonshotClient()
        
        assert client._select_model(3) == "moonshot-v1-32k-vision-preview"
        assert client._select_model(10) == "moonshot-v1-32k-vision-preview"
        assert client._select_model(15) == "moonshot-v1-32k-vision-preview"

    def test_model_selection_large(self):
        """Test model selection for large documents."""
        client = MoonshotClient()
        
        assert client._select_model(16) == "moonshot-v1-128k-vision-preview"
        assert client._select_model(50) == "moonshot-v1-128k-vision-preview"

    def test_cost_calculation_8k(self):
        """Test cost calculation for 8k model."""
        client = MoonshotClient()
        
        cost = client._calculate_cost(
            "moonshot-v1-8k-vision-preview",
            input_tokens=5000,
            output_tokens=1000,
        )
        
        # (5000/1M * $0.20) + (1000/1M * $2.00) = $0.001 + $0.002 = $0.003
        assert cost == pytest.approx(0.003, abs=0.001)

    def test_cost_calculation_32k(self):
        """Test cost calculation for 32k model."""
        client = MoonshotClient()
        
        cost = client._calculate_cost(
            "moonshot-v1-32k-vision-preview",
            input_tokens=10000,
            output_tokens=2000,
        )
        
        # (10000/1M * $1.00) + (2000/1M * $3.00) = $0.01 + $0.006 = $0.016
        assert cost == pytest.approx(0.016, abs=0.001)

    def test_encode_image(self):
        """Test image encoding to base64."""
        client = MoonshotClient()
        
        image_data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
        encoded = client._encode_image(image_data)
        
        assert isinstance(encoded, str)
        # Base64 of PNG data should start with iVBORw0KGgo
        assert len(encoded) > 0

    @pytest.mark.asyncio
    async def test_extract_from_images_success(self, mock_moonshot_response, monkeypatch):
        """Test successful image extraction."""
        client = MoonshotClient()
        
        # Mock the API call
        async def mock_call_api(model, messages, **kwargs):
            return {
                "content": json.dumps(mock_moonshot_response),
                "model": "moonshot-v1-32k-vision-preview",
                "tokens_input": 10000,
                "tokens_output": 2000,
            }
        
        monkeypatch.setattr(client, "_call_api", mock_call_api)
        
        # Create fake image bytes
        fake_images = [b"\x89PNG\r\n\x1a\n" * 100 for _ in range(3)]
        
        result = await client.extract_from_images(fake_images)
        
        assert result.success is True
        assert len(result.transactions) == 2
        assert result.model_used == "moonshot-v1-32k-vision-preview"
        assert result.tokens_input == 10000
        assert result.cost_usd > 0
        assert result.confidence_score > 0

    @pytest.mark.asyncio
    async def test_extract_from_images_invalid_json(self, monkeypatch):
        """Test handling of invalid JSON response."""
        client = MoonshotClient()
        
        async def mock_call_api(model, messages, **kwargs):
            return {
                "content": "not valid json",
                "model": "moonshot-v1-32k-vision-preview",
                "tokens_input": 5000,
                "tokens_output": 1000,
            }
        
        monkeypatch.setattr(client, "_call_api", mock_call_api)
        
        fake_images = [b"\x89PNG" * 50]
        result = await client.extract_from_images(fake_images)
        
        assert result.success is False
        assert "JSON" in result.error_message or "parse" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_extract_from_images_api_failure(self, monkeypatch):
        """Test handling of API failure."""
        client = MoonshotClient()
        
        async def mock_call_api(model, messages, **kwargs):
            raise Exception("API Error: Rate limit exceeded")
        
        monkeypatch.setattr(client, "_call_api", mock_call_api)
        
        fake_images = [b"\x89PNG" * 50]
        result = await client.extract_from_images(fake_images)
        
        assert result.success is False
        assert "All models failed" in result.error_message

    @pytest.mark.asyncio
    async def test_extract_from_text_success(self, mock_moonshot_response, monkeypatch):
        """Test successful text extraction."""
        client = MoonshotClient()
        
        async def mock_call_api(model, messages, **kwargs):
            return {
                "content": json.dumps(mock_moonshot_response),
                "model": "kimi-k2-0711-preview",
                "tokens_input": 8000,
                "tokens_output": 1500,
            }
        
        monkeypatch.setattr(client, "_call_api", mock_call_api)
        
        result = await client.extract_from_text("Sample bank statement text content")
        
        assert result.success is True
        assert len(result.transactions) == 2
        assert result.model_used == "kimi-k2-0711-preview"
        assert result.tokens_input == 8000

    def test_default_system_prompt(self):
        """Test system prompt contains required elements."""
        client = MoonshotClient()
        prompt = client._get_default_system_prompt()
        
        assert "bank statement" in prompt.lower()
        assert "JSON" in prompt
        assert "transaction" in prompt.lower()
        assert "debit" in prompt.lower() or "credit" in prompt.lower()
        assert "reconciliation" in prompt.lower()
        assert "amount" in prompt.lower()

    def test_default_user_prompt(self):
        """Test user prompt template."""
        client = MoonshotClient()
        prompt = client._get_default_user_prompt()
        
        assert "extract" in prompt.lower()
        assert "transaction" in prompt.lower()
