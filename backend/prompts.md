# Prompt Engineering for Bank Statement Extraction

## Overview

This document defines the optimal prompts for extracting structured financial data from bank statements using Moonshot AI's vision-capable models. All prompts are versioned and tested for accuracy.

**Current Active Version**: `v1.2.0` (moonshot-v1-32k-vision-preview)

---

## 1. System Prompt

### Identity & Role

```text
You are Statementwise-Extraction-v1.2, a specialized financial document analysis engine.
Your sole purpose is to extract structured transaction data from bank statement images with
maximum accuracy. You understand global banking formats, multi-currency transactions, and
complex financial layouts.

## Core Rules
1. Extract EVERY transaction visible in the statement - never skip rows
2. Parse all dates into ISO 8601 format (YYYY-MM-DD) regardless of original format
3. For each transaction, determine direction: debit (money out) or credit (money in)
4. Maintain running balance accuracy - verify each row's math
5. Preserve exact descriptions as shown on the statement
6. Extract reference numbers, check numbers, and transaction IDs when present
7. Identify and categorize transactions where possible
8. Flag any ambiguous data with confidence scores below 1.0

## Strict Output Requirements
- Return ONLY valid JSON - no markdown, no explanations, no code fences
- All monetary amounts must be JSON numbers (not strings)
- Dates must be ISO 8601 format
- Use null for missing fields (never empty strings for unknown values)
- Include reconciliation verification in every response

## Error Handling
- If a page is completely unreadable, include a null transaction with confidence: 0
- If amounts are unclear due to image quality, estimate and flag with low confidence
- Never hallucinate transactions that aren't visible
- Never modify transaction descriptions - preserve exactly as shown
```

---

## 2. User Prompt Template

### Standard Upload

```text
Extract all transaction data from the attached bank statement image(s).

The statement may contain:
- Multiple pages (process ALL pages as a single continuous statement)
- Various date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
- Mixed transaction types (deposits, withdrawals, transfers, fees, interest)
- Running balance column
- Statement summary section

Special instructions:
- For each transaction, include the running balance shown on the statement
- If a transaction has both debit and credit columns, only fill the appropriate one
- Capture the full description text exactly as it appears
- Extract reference numbers that appear alongside transactions
- Note any fees, interest, or adjustments separately

The opening balance is {opening_balance} on {opening_date}.
The closing balance should be {closing_balance} on {closing_date}.
Verify your extraction matches these totals.
```

### With Context (if known)

```text
Extract all transaction data from the attached bank statement.

Account context:
- Bank: {bank_name}
- Account type: {account_type}
- Currency: {currency}
- Statement period: {start_date} to {end_date}

Please verify the extracted closing balance matches the statement.
```

---

## 3. JSON Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BankStatementExtraction",
  "type": "object",
  "required": ["statement_metadata", "opening_balance", "closing_balance", "transactions", "summary", "reconciliation"],
  "properties": {
    "statement_metadata": {
      "type": "object",
      "required": ["bank_name", "currency"],
      "properties": {
        "bank_name": { "type": "string", "description": "Name of the bank/financial institution" },
        "account_holder": { "type": ["string", "null"], "description": "Name of account holder" },
        "account_number": { "type": ["string", "null"], "description": "Masked account number, e.g., ****1234" },
        "account_type": { "type": ["string", "null"], "enum": ["Checking", "Savings", "Credit Card", "Money Market", "CD", "Investment", "Loan", "Other"] },
        "statement_period": {
          "type": "object",
          "properties": {
            "start_date": { "type": "string", "format": "date" },
            "end_date": { "type": "string", "format": "date" }
          }
        },
        "statement_date": { "type": ["string", "null"], "format": "date", "description": "Date the statement was generated" },
        "currency": { "type": "string", "default": "USD", "description": "ISO 4217 currency code" }
      }
    },
    "opening_balance": {
      "type": "object",
      "required": ["amount", "date"],
      "properties": {
        "amount": { "type": "number", "description": "Opening balance amount" },
        "date": { "type": "string", "format": "date", "description": "Date of opening balance" },
        "currency": { "type": "string", "default": "USD" }
      }
    },
    "closing_balance": {
      "type": "object",
      "required": ["amount", "date"],
      "properties": {
        "amount": { "type": "number", "description": "Closing balance amount" },
        "date": { "type": "string", "format": "date", "description": "Date of closing balance" },
        "currency": { "type": "string", "default": "USD" }
      }
    },
    "transactions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["date", "description", "amount", "currency"],
        "properties": {
          "date": { "type": "string", "format": "date", "description": "Transaction date (YYYY-MM-DD)" },
          "description": { "type": "string", "description": "Full transaction description as shown" },
          "reference": { "type": ["string", "null"], "description": "Reference number, check number, or transaction ID" },
          "category": { "type": ["string", "null"], "enum": [null, "Income", "Transfer", "Payment", "Purchase", "Fee", "Interest", "Refund", "Withdrawal", "Deposit", "Other"] },
          "debit": { "type": ["number", "null"], "description": "Amount if money went out (positive number)" },
          "credit": { "type": ["number", "null"], "description": "Amount if money came in (positive number)" },
          "amount": { "type": "number", "description": "Absolute amount of transaction" },
          "currency": { "type": "string", "default": "USD" },
          "balance": { "type": ["number", "null"], "description": "Running balance after this transaction" },
          "confidence_score": { "type": "number", "minimum": 0, "maximum": 1, "default": 1.0 }
        }
      }
    },
    "summary": {
      "type": "object",
      "properties": {
        "total_credits": { "type": "number" },
        "total_debits": { "type": "number" },
        "total_fees": { "type": "number" },
        "total_interest": { "type": "number" },
        "transaction_count": { "type": "integer" }
      }
    },
    "reconciliation": {
      "type": "object",
      "required": ["calculated_closing", "matches_statement", "variance"],
      "properties": {
        "calculated_closing": { "type": "number", "description": "Opening + credits - debits" },
        "matches_statement": { "type": "boolean" },
        "variance": { "type": "number", "description": "Difference between calculated and stated closing" }
      }
    }
  }
}
```

---

## 4. Few-Shot Examples

### Example 1: Chase Bank (US Checking)

**Input**: Standard 3-page Chase checking statement

**Output**:
```json
{
  "statement_metadata": {
    "bank_name": "JPMorgan Chase Bank",
    "account_holder": "JOHN DOE",
    "account_number": "****4567",
    "account_type": "Checking",
    "statement_period": { "start_date": "2024-01-01", "end_date": "2024-01-31" },
    "statement_date": "2024-02-01",
    "currency": "USD"
  },
  "opening_balance": { "amount": 4523.87, "date": "2024-01-01", "currency": "USD" },
  "closing_balance": { "amount": 3876.42, "date": "2024-01-31", "currency": "USD" },
  "transactions": [
    {
      "date": "2024-01-03", "description": "PAYROLL DEPOSIT - ACME CORP",
      "reference": "ACH-123456", "category": "Income",
      "debit": null, "credit": 3850.00, "amount": 3850.00,
      "currency": "USD", "balance": 8373.87, "confidence_score": 1.0
    },
    {
      "date": "2024-01-05", "description": "RENT PAYMENT - ABC APARTMENTS",
      "reference": "ACH-OUT-789", "category": "Payment",
      "debit": 1850.00, "credit": null, "amount": 1850.00,
      "currency": "USD", "balance": 6523.87, "confidence_score": 1.0
    },
    {
      "date": "2024-01-10", "description": "WHOLEFDS MKT #10234",
      "reference": "POS-556677", "category": "Purchase",
      "debit": 156.43, "credit": null, "amount": 156.43,
      "currency": "USD", "balance": 6367.44, "confidence_score": 0.95
    }
  ],
  "summary": {
    "total_credits": 3920.00,
    "total_debits": 4567.45,
    "total_fees": 0.00,
    "total_interest": 70.00,
    "transaction_count": 12
  },
  "reconciliation": {
    "calculated_closing": 3876.42,
    "matches_statement": true,
    "variance": 0.00
  }
}
```

### Example 2: HSBC (UK Multi-Currency)

**Input**: 2-page HSBC Premier statement with GBP transactions

**Output**:
```json
{
  "statement_metadata": {
    "bank_name": "HSBC UK",
    "account_holder": "JANE SMITH",
    "account_number": "****8765",
    "account_type": "Savings",
    "statement_period": { "start_date": "2024-03-01", "end_date": "2024-03-31" },
    "statement_date": "2024-04-01",
    "currency": "GBP"
  },
  "opening_balance": { "amount": 12500.00, "date": "2024-03-01", "currency": "GBP" },
  "closing_balance": { "amount": 11342.50, "date": "2024-03-31", "currency": "GBP" },
  "transactions": [
    {
      "date": "2024-03-05", "description": "TRANSFER FROM SAVINGS A/C ****1234",
      "reference": "FT24065123", "category": "Transfer",
      "debit": null, "credit": 2500.00, "amount": 2500.00,
      "currency": "GBP", "balance": 15000.00, "confidence_score": 1.0
    },
    {
      "date": "2024-03-15", "description": "SHELL PETROL STATION LONDON",
      "reference": "CARD-987654", "category": "Purchase",
      "debit": 68.50, "credit": null, "amount": 68.50,
      "currency": "GBP", "balance": 11342.50, "confidence_score": 0.95
    }
  ],
  "summary": {
    "total_credits": 2520.00,
    "total_debits": 3677.50,
    "total_fees": 0.00,
    "total_interest": 20.00,
    "transaction_count": 8
  },
  "reconciliation": {
    "calculated_closing": 11342.50,
    "matches_statement": true,
    "variance": 0.00
  }
}
```

### Example 3: Deutsche Bank (EU - IBAN Format)

**Input**: German bank statement with IBAN/BIC, SEPA transactions

**Output**:
```json
{
  "statement_metadata": {
    "bank_name": "Deutsche Bank AG",
    "account_holder": "HANS MUELLER",
    "account_number": "DE89 3704 0044 0532 0130 00",
    "account_type": "Girokonto",
    "statement_period": { "start_date": "2024-06-01", "end_date": "2024-06-30" },
    "statement_date": "2024-07-01",
    "currency": "EUR"
  },
  "opening_balance": { "amount": 3450.80, "date": "2024-06-01", "currency": "EUR" },
  "closing_balance": { "amount": 2890.35, "date": "2024-06-30", "currency": "EUR" },
  "transactions": [
    {
      "date": "2024-06-03", "description": "SEPA-UEBERWEISUNG LIDL SAGT DANKE",
      "reference": "SVWZ+Bestellung 12345", "category": "Purchase",
      "debit": 45.67, "credit": null, "amount": 45.67,
      "currency": "EUR", "balance": 3405.13, "confidence_score": 0.92
    },
    {
      "date": "2024-06-15", "description": "SEPA-LOHN/GEHALT MUSTER GMBH",
      "reference": "EREF+GEHALT-062024", "category": "Income",
      "debit": null, "credit": 2800.00, "amount": 2800.00,
      "currency": "EUR", "balance": 3900.13, "confidence_score": 1.0
    }
  ],
  "summary": {
    "total_credits": 2850.00,
    "total_debits": 3410.45,
    "total_fees": 0.00,
    "total_interest": 0.00,
    "transaction_count": 15
  },
  "reconciliation": {
    "calculated_closing": 2890.35,
    "matches_statement": true,
    "variance": 0.00
  }
}
```

### Example 4: Scanned/Low Quality Statement

**Input**: Poor quality scanned Wells Fargo statement

**Output**:
```json
{
  "statement_metadata": {
    "bank_name": "Wells Fargo",
    "account_holder": null,
    "account_number": "****8901",
    "account_type": "Checking",
    "statement_period": { "start_date": "2024-02-01", "end_date": "2024-02-29" },
    "statement_date": "2024-03-01",
    "currency": "USD"
  },
  "opening_balance": { "amount": 1200.00, "date": "2024-02-01", "currency": "USD" },
  "closing_balance": { "amount": 876.50, "date": "2024-02-29", "currency": "USD" },
  "transactions": [
    {
      "date": "2024-02-05", "description": "DIRECT DEPOSIT (partially unreadable)",
      "reference": null, "category": "Income",
      "debit": null, "credit": 1200.00, "amount": 1200.00,
      "currency": "USD", "balance": 2400.00, "confidence_score": 0.75
    },
    {
      "date": "2024-02-10", "description": "CHECK # (unclear)",
      "reference": "CHK-????", "category": null,
      "debit": 523.50, "credit": null, "amount": 523.50,
      "currency": "USD", "balance": 1876.50, "confidence_score": 0.60
    }
  ],
  "summary": {
    "total_credits": 1200.00,
    "total_debits": 1523.50,
    "total_fees": 0.00,
    "total_interest": 0.00,
    "transaction_count": 2
  },
  "reconciliation": {
    "calculated_closing": 876.50,
    "matches_statement": true,
    "variance": 0.00
  }
}
```

### Example 5: Credit Card Statement (Chase Sapphire)

**Input**: Chase credit card statement with rewards and categories

**Output**:
```json
{
  "statement_metadata": {
    "bank_name": "Chase Bank",
    "account_holder": "JOHN DOE",
    "account_number": "****8765",
    "account_type": "Credit Card",
    "statement_period": { "start_date": "2024-04-01", "end_date": "2024-04-30" },
    "statement_date": "2024-05-01",
    "currency": "USD"
  },
  "opening_balance": { "amount": -2345.60, "date": "2024-04-01", "currency": "USD" },
  "closing_balance": { "amount": -3456.78, "date": "2024-04-30", "currency": "USD" },
  "transactions": [
    {
      "date": "2024-04-05", "description": "AMAZON.COM*Z23K9M2A3",
      "reference": "248912345678", "category": "Shopping",
      "debit": 89.99, "credit": null, "amount": 89.99,
      "currency": "USD", "balance": -2435.59, "confidence_score": 1.0
    },
    {
      "date": "2024-04-10", "description": "SHELL OIL 57442123456",
      "reference": "248987654321", "category": "Gas",
      "debit": 45.00, "credit": null, "amount": 45.00,
      "currency": "USD", "balance": -2480.59, "confidence_score": 1.0
    },
    {
      "date": "2024-04-15", "description": "PAYMENT - THANK YOU",
      "reference": "WEB-12345678", "category": "Payment",
      "debit": null, "credit": 500.00, "amount": 500.00,
      "currency": "USD", "balance": -1980.59, "confidence_score": 1.0
    }
  ],
  "summary": {
    "total_credits": 500.00,
    "total_debits": 2611.18,
    "total_fees": 0.00,
    "total_interest": 0.00,
    "transaction_count": 8
  },
  "reconciliation": {
    "calculated_closing": -3456.78,
    "matches_statement": true,
    "variance": 0.00
  }
}
```

---

## 5. Prompt Versioning Strategy

### Version Control

```
prompts/
├── v1.0.0/           # Initial version (2024-01)
│   ├── system.txt
│   ├── user.txt
│   └── schema.json
├── v1.1.0/           # Added credit card support (2024-03)
│   ├── system.txt
│   ├── user.txt
│   └── schema.json
├── v1.2.0/           # Current - Added confidence scoring (2024-06)
│   ├── system.txt
│   ├── user.txt
│   └── schema.json
└── staging/          # Next version being tested
    ├── system.txt
    ├── user.txt
    └── schema.json
```

### Deployment Process

1. **Draft**: Create new version in `staging/`
2. **Test**: Run on 100 sample statements from test set
3. **Compare**: Benchmark against current version (target: >95% accuracy)
4. **A/B**: Deploy to 10% of traffic for 24 hours
5. **Monitor**: Track extraction accuracy and error rates
6. **Promote**: Move to production if metrics improve
7. **Archive**: Keep old versions for rollback

### Database Schema for Prompt Versions

```sql
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    json_schema JSONB NOT NULL,
    few_shot_examples JSONB,
    temperature DECIMAL(3,2) DEFAULT 0.1,
    model VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    accuracy_score DECIMAL(5,2),
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(version)
);
```

### Performance Tracking

| Metric | Target | Alert Threshold |
|---|---|---|
| Transaction extraction accuracy | >95% | <90% |
| Balance reconciliation rate | >99% | <95% |
| Date parsing accuracy | >98% | <95% |
| Confidence score average | >0.90 | <0.80 |
| JSON parse success rate | >99% | <95% |
| Average latency (3 pages) | <5s | >10s |
