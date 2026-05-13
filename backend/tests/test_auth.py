"""
Unit tests for authentication module.
"""

import pytest
from datetime import timedelta

from core.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_api_key,
    verify_api_key,
)


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password(self):
        """Test password hashing produces different hashes."""
        password = "SecurePassword123!"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != password  # Hash should not equal password
        assert hash1 != hash2  # Each hash should be unique (salted)
        assert hash1.startswith("$bcrypt-sha256$")  # bcrypt-SHA256 format

    def test_verify_password_correct(self):
        """Test verifying correct password."""
        password = "SecurePassword123!"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test verifying incorrect password."""
        password = "SecurePassword123!"
        wrong_password = "WrongPassword456!"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_empty(self):
        """Test verifying empty password."""
        password = "SecurePassword123!"
        hashed = hash_password(password)
        
        assert verify_password("", hashed) is False


class TestJWTTokens:
    """Test JWT token creation and validation."""

    def test_create_access_token(self):
        """Test access token creation."""
        user_id = "test-user-123"
        email = "test@example.com"
        role = "user"
        
        token = create_access_token(user_id, email, role)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50  # JWT should be reasonably long

    def test_create_refresh_token(self):
        """Test refresh token creation."""
        user_id = "test-user-123"
        
        token = create_refresh_token(user_id)
        
        assert token is not None
        assert isinstance(token, str)

    def test_decode_valid_token(self):
        """Test decoding a valid token."""
        user_id = "test-user-123"
        email = "test@example.com"
        role = "user"
        
        token = create_access_token(user_id, email, role)
        payload = decode_token(token)
        
        assert payload["sub"] == user_id
        assert payload["email"] == email
        assert payload["role"] == role
        assert payload["type"] == "access"

    def test_decode_invalid_token(self):
        """Test decoding an invalid token."""
        with pytest.raises(Exception):
            decode_token("invalid.token.here")

    def test_token_expiry(self):
        """Test token expiry is set correctly."""
        import time
        
        user_id = "test-user-123"
        email = "test@example.com"
        role = "user"
        
        # Create token with very short expiry
        token = create_access_token(user_id, email, role, expires_delta=timedelta(seconds=-1))
        
        # Should raise exception for expired token
        with pytest.raises(Exception):
            decode_token(token)


class TestAPIKeys:
    """Test API key generation and verification."""

    def test_generate_api_key(self):
        """Test API key generation."""
        full_key, key_hash = generate_api_key()
        
        assert full_key is not None
        assert key_hash is not None
        assert isinstance(full_key, str)
        assert isinstance(key_hash, str)
        assert full_key.startswith("sw_")  # Has prefix

    def test_verify_api_key_correct(self):
        """Test verifying correct API key."""
        full_key, key_hash = generate_api_key()
        
        assert verify_api_key(full_key, key_hash) is True

    def test_verify_api_key_incorrect(self):
        """Test verifying incorrect API key."""
        _, key_hash = generate_api_key()
        
        assert verify_api_key("wrong_key", key_hash) is False

    def test_unique_api_keys(self):
        """Test that each generated key is unique."""
        keys = [generate_api_key() for _ in range(10)]
        full_keys = [k[0] for k in keys]
        
        assert len(set(full_keys)) == 10  # All unique
