"""
Unit tests for export service.
"""

import json
import csv
import io
import pytest
from decimal import Decimal

from services.export import ExportService


@pytest.fixture
def sample_transactions():
    """Sample transactions for export tests."""
    return [
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
        {
            "date": "2024-01-25",
            "description": "GROCERY STORE PURCHASE",
            "reference": "POS-556677",
            "category": "Purchase",
            "debit": 156.43,
            "credit": None,
            "amount": 156.43,
            "currency": "USD",
            "balance": 6367.44,
            "confidence_score": 0.95,
        },
    ]


@pytest.fixture
def sample_metadata():
    """Sample statement metadata."""
    return {
        "bank_name": "Chase Bank",
        "account_holder": "JOHN DOE",
        "account_number": "****4567",
        "account_type": "Checking",
        "statement_period": {"start_date": "2024-01-01", "end_date": "2024-01-31"},
        "statement_date": "2024-02-01",
        "currency": "USD",
    }


class TestCSVExport:
    """Test CSV export functionality."""

    def test_csv_export_basic(self, sample_transactions):
        """Test basic CSV export."""
        content = ExportService.generate_csv(sample_transactions)
        
        assert isinstance(content, bytes)
        
        # Parse CSV
        csv_content = content.decode("utf-8")
        reader = csv.reader(io.StringIO(csv_content))
        rows = list(reader)
        
        # Check header
        assert "Date" in rows[0]
        assert "Description" in rows[0]
        assert "Debit" in rows[0]
        assert "Credit" in rows[0]
        
        # Check data rows (skip header)
        data_rows = [r for r in rows if r and r[0] and r[0] != "Date" and not r[0].startswith("Statementwise")]
        assert len(data_rows) >= 3

    def test_csv_export_with_metadata(self, sample_transactions, sample_metadata):
        """Test CSV export with metadata."""
        content = ExportService.generate_csv(
            sample_transactions, sample_metadata, include_headers=True
        )
        
        csv_content = content.decode("utf-8")
        assert "Chase Bank" in csv_content
        assert "****4567" in csv_content


class TestJSONExport:
    """Test JSON export functionality."""

    def test_json_export(self, sample_transactions, sample_metadata):
        """Test JSON export."""
        content = ExportService.generate_json(
            transactions=sample_transactions,
            metadata=sample_metadata,
            opening_balance={"amount": 4523.87, "date": "2024-01-01"},
            closing_balance={"amount": 6367.44, "date": "2024-01-31"},
            summary={"total_credits": 3850.00, "total_debits": 2006.43, "transaction_count": 3},
        )
        
        assert isinstance(content, bytes)
        
        data = json.loads(content.decode("utf-8"))
        
        assert "export_metadata" in data
        assert "transactions" in data
        assert len(data["transactions"]) == 3
        assert data["statement_metadata"]["bank_name"] == "Chase Bank"
        assert "opening_balance" in data
        assert "closing_balance" in data
        assert "summary" in data
        assert "reconciliation" in data


class TestQBOExport:
    """Test QBO/OFX export functionality."""

    def test_qbo_export(self, sample_transactions, sample_metadata):
        """Test QBO export format."""
        content = ExportService.generate_qbo(
            sample_transactions, sample_metadata,
            opening_balance={"amount": 4523.87, "date": "2024-01-01"},
            closing_balance={"amount": 6367.44, "date": "2024-01-31"},
        )
        
        assert isinstance(content, bytes)
        
        qbo_content = content.decode("utf-8")
        
        # Check OFX structure
        assert "OFXHEADER" in qbo_content or "<OFX>" in qbo_content
        assert "STMTTRN" in qbo_content
        assert "Chase Bank" in qbo_content or "****4567" in qbo_content

    def test_ofx_export(self, sample_transactions, sample_metadata):
        """Test OFX export."""
        content = ExportService.generate_ofx(
            sample_transactions, sample_metadata,
            opening_balance={"amount": 4523.87, "date": "2024-01-01"},
            closing_balance={"amount": 6367.44, "date": "2024-01-31"},
        )
        
        assert isinstance(content, bytes)
        
        ofx_content = content.decode("utf-8")
        assert "<OFX>" in ofx_content


class TestMT940Export:
    """Test MT940 export functionality."""

    def test_mt940_export(self, sample_transactions, sample_metadata):
        """Test MT940 export format."""
        content = ExportService.generate_mt940(
            sample_transactions, sample_metadata,
            opening_balance={"amount": 4523.87, "date": "2024-01-01"},
            closing_balance={"amount": 6367.44, "date": "2024-01-31"},
        )
        
        assert isinstance(content, bytes)
        
        mt940_content = content.decode("utf-8")
        
        # Check MT940 structure
        assert ":20:" in mt940_content
        assert ":25:" in mt940_content
        assert ":60F:" in mt940_content  # Opening balance
        assert ":61:" in mt940_content   # Transaction
        assert ":62F:" in mt940_content  # Closing balance


class TestCAMT053Export:
    """Test CAMT.053 export functionality."""

    def test_camt053_export(self, sample_transactions, sample_metadata):
        """Test CAMT.053 export format."""
        content = ExportService.generate_camt053(
            sample_transactions, sample_metadata,
            opening_balance={"amount": 4523.87, "date": "2024-01-01"},
            closing_balance={"amount": 6367.44, "date": "2024-01-31"},
        )
        
        assert isinstance(content, bytes)
        
        camt_content = content.decode("utf-8")
        
        # Check XML structure
        assert "<?xml" in camt_content
        assert "BkToCstmrStmt" in camt_content
        assert "Ntry" in camt_content  # Entry (transaction)


class TestGeneralExport:
    """Test general export dispatcher."""

    def test_supported_formats(self):
        """Test that all formats are registered."""
        formats = ExportService.SUPPORTED_FORMATS
        
        assert "csv" in formats
        assert "xlsx" in formats
        assert "json" in formats
        assert "qbo" in formats
        assert "ofx" in formats
        assert "mt940" in formats
        assert "camt053" in formats

    def test_invalid_format(self, sample_transactions):
        """Test that invalid format raises error."""
        with pytest.raises(ValueError):
            ExportService.generate_export("invalid_format", sample_transactions)

    def test_csv_via_dispatcher(self, sample_transactions):
        """Test CSV export via dispatcher."""
        content, content_type, filename = ExportService.generate_export(
            "csv", sample_transactions
        )
        
        assert isinstance(content, bytes)
        assert content_type == "text/csv"
        assert filename.endswith(".csv")

    def test_json_via_dispatcher(self, sample_transactions, sample_metadata):
        """Test JSON export via dispatcher."""
        content, content_type, filename = ExportService.generate_export(
            "json", sample_transactions, metadata=sample_metadata
        )
        
        assert isinstance(content, bytes)
        assert content_type == "application/json"
        assert filename.endswith(".json")
