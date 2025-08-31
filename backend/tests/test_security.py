"""
Security tests for CampoCode Forge Backend

This module contains comprehensive tests for security features including:
- Input validation
- Password strength validation
- Rate limiting
- Authentication
- Authorization

Author: CampoCode Forge Team
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import re
from datetime import datetime, timedelta

from security import (
    InputValidator, 
    SecurityConfig, 
    RateLimiter, 
    PasswordManager,
    UserRegistrationData,
    CourseData,
    check_rate_limit,
    get_client_ip
)

class TestInputValidator:
    """Test input validation functionality."""
    
    def test_validate_email_valid(self):
        """Test valid email validation."""
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.org"
        ]
        
        for email in valid_emails:
            assert InputValidator.validate_email(email) is True
    
    def test_validate_email_invalid(self):
        """Test invalid email validation."""
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "user@",
            "user@.com",
            "user..name@example.com"
        ]
        
        for email in invalid_emails:
            assert InputValidator.validate_email(email) is False
    
    def test_validate_username_valid(self):
        """Test valid username validation."""
        valid_usernames = [
            "user123",
            "test_user",
            "User123",
            "a" * 30  # Maximum length
        ]
        
        for username in valid_usernames:
            assert InputValidator.validate_username(username) is True
    
    def test_validate_username_invalid(self):
        """Test invalid username validation."""
        invalid_usernames = [
            "ab",  # Too short
            "a" * 31,  # Too long
            "user-name",  # Invalid character
            "user.name",  # Invalid character
            "user name",  # Space not allowed
            ""  # Empty
        ]
        
        for username in invalid_usernames:
            assert InputValidator.validate_username(username) is False
    
    def test_validate_password_strength_strong(self):
        """Test strong password validation."""
        strong_password = "SecurePass123!"
        result = InputValidator.validate_password_strength(strong_password)
        
        assert result["is_valid"] is True
        assert len(result["errors"]) == 0
        assert result["score"] >= 8
    
    def test_validate_password_strength_weak(self):
        """Test weak password validation."""
        weak_passwords = [
            "short",  # Too short
            "nouppercase123!",  # No uppercase
            "NOLOWERCASE123!",  # No lowercase
            "NoNumbers!",  # No numbers
            "NoSpecial123"  # No special characters
        ]
        
        for password in weak_passwords:
            result = InputValidator.validate_password_strength(password)
            assert result["is_valid"] is False
            assert len(result["errors"]) > 0
    
    def test_sanitize_input(self):
        """Test input sanitization."""
        dangerous_inputs = [
            ("<script>alert('xss')</script>", ""),
            ("Hello<script>world</script>", "Hello"),
            ("User's name", "Users name"),
            ("Test & more", "Test  more"),
            ("Normal text", "Normal text")
        ]
        
        for input_text, expected in dangerous_inputs:
            result = InputValidator.sanitize_input(input_text)
            assert result == expected
    
    def test_validate_course_data_valid(self):
        """Test valid course data validation."""
        valid_data = {
            "title": "Python Programming",
            "description": "Learn Python programming",
            "difficulty": "beginner"
        }
        
        result = InputValidator.validate_course_data(valid_data)
        assert result["is_valid"] is True
        assert len(result["errors"]) == 0
    
    def test_validate_course_data_invalid(self):
        """Test invalid course data validation."""
        invalid_data = {
            "title": "A",  # Too short
            "description": "A" * 2001,  # Too long
            "difficulty": "expert"  # Invalid difficulty
        }
        
        result = InputValidator.validate_course_data(invalid_data)
        assert result["is_valid"] is False
        assert len(result["errors"]) > 0

class TestRateLimiter:
    """Test rate limiting functionality."""
    
    def test_rate_limiter_initial_state(self):
        """Test rate limiter initial state."""
        limiter = RateLimiter()
        assert limiter.is_allowed("192.168.1.1") is True
    
    def test_rate_limiter_within_limits(self):
        """Test rate limiter within limits."""
        limiter = RateLimiter()
        client_ip = "192.168.1.1"
        
        # Make requests within limit
        for i in range(SecurityConfig.RATE_LIMIT_REQUESTS):
            assert limiter.is_allowed(client_ip) is True
    
    def test_rate_limiter_exceeds_limits(self):
        """Test rate limiter when limits are exceeded."""
        limiter = RateLimiter()
        client_ip = "192.168.1.1"
        
        # Make requests up to limit
        for i in range(SecurityConfig.RATE_LIMIT_REQUESTS):
            limiter.is_allowed(client_ip)
        
        # Next request should be blocked
        assert limiter.is_allowed(client_ip) is False
    
    def test_rate_limiter_different_clients(self):
        """Test rate limiter with different client IPs."""
        limiter = RateLimiter()
        
        # Each client should have their own limit
        for i in range(SecurityConfig.RATE_LIMIT_REQUESTS):
            assert limiter.is_allowed(f"192.168.1.{i}") is True

class TestPasswordManager:
    """Test password management functionality."""
    
    def test_generate_secure_password(self):
        """Test secure password generation."""
        password = PasswordManager.generate_secure_password(16)
        
        assert len(password) == 16
        assert re.search(r'[a-z]', password)  # Has lowercase
        assert re.search(r'[A-Z]', password)  # Has uppercase
        assert re.search(r'\d', password)     # Has digit
        assert re.search(r'[@$!%*?&]', password)  # Has special char
    
    def test_hash_and_verify_password(self):
        """Test password hashing and verification."""
        password = "TestPassword123!"
        hashed = PasswordManager.hash_password(password)
        
        # Should verify correctly
        assert PasswordManager.verify_password(password, hashed) is True
        
        # Should not verify with wrong password
        assert PasswordManager.verify_password("WrongPassword123!", hashed) is False
    
    def test_hash_password_uniqueness(self):
        """Test that password hashes are unique."""
        password = "TestPassword123!"
        hash1 = PasswordManager.hash_password(password)
        hash2 = PasswordManager.hash_password(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        
        # Both should verify correctly
        assert PasswordManager.verify_password(password, hash1) is True
        assert PasswordManager.verify_password(password, hash2) is True

class TestPydanticModels:
    """Test Pydantic validation models."""
    
    def test_user_registration_data_valid(self):
        """Test valid user registration data."""
        data = {
            "email": "test@example.com",
            "username": "testuser123",
            "password": "SecurePass123!"
        }
        
        user_data = UserRegistrationData(**data)
        assert user_data.email == "test@example.com"
        assert user_data.username == "testuser123"
        assert user_data.password == "SecurePass123!"
    
    def test_user_registration_data_invalid_email(self):
        """Test invalid email in user registration."""
        data = {
            "email": "invalid-email",
            "username": "testuser123",
            "password": "SecurePass123!"
        }
        
        with pytest.raises(ValueError):
            UserRegistrationData(**data)
    
    def test_user_registration_data_invalid_username(self):
        """Test invalid username in user registration."""
        data = {
            "email": "test@example.com",
            "username": "ab",  # Too short
            "password": "SecurePass123!"
        }
        
        with pytest.raises(ValueError):
            UserRegistrationData(**data)
    
    def test_user_registration_data_weak_password(self):
        """Test weak password in user registration."""
        data = {
            "email": "test@example.com",
            "username": "testuser123",
            "password": "weak"  # Too weak
        }
        
        with pytest.raises(ValueError):
            UserRegistrationData(**data)
    
    def test_course_data_valid(self):
        """Test valid course data."""
        data = {
            "title": "Python Programming",
            "description": "Learn Python programming",
            "difficulty": "beginner"
        }
        
        course_data = CourseData(**data)
        assert course_data.title == "Python Programming"
        assert course_data.description == "Learn Python programming"
        assert course_data.difficulty == "beginner"
    
    def test_course_data_invalid_title(self):
        """Test invalid title in course data."""
        data = {
            "title": "A",  # Too short
            "description": "Learn Python programming",
            "difficulty": "beginner"
        }
        
        with pytest.raises(ValueError):
            CourseData(**data)
    
    def test_course_data_invalid_difficulty(self):
        """Test invalid difficulty in course data."""
        data = {
            "title": "Python Programming",
            "description": "Learn Python programming",
            "difficulty": "expert"  # Invalid
        }
        
        with pytest.raises(ValueError):
            CourseData(**data)

class TestSecurityUtilities:
    """Test security utility functions."""
    
    def test_get_client_ip_direct(self):
        """Test getting client IP from direct connection."""
        request = Mock()
        request.headers = {}
        request.client.host = "192.168.1.1"
        
        ip = get_client_ip(request)
        assert ip == "192.168.1.1"
    
    def test_get_client_ip_forwarded(self):
        """Test getting client IP from forwarded header."""
        request = Mock()
        request.headers = {"X-Forwarded-For": "203.0.113.1, 192.168.1.1"}
        request.client.host = "192.168.1.1"
        
        ip = get_client_ip(request)
        assert ip == "203.0.113.1"
    
    def test_check_rate_limit(self):
        """Test rate limit checking."""
        request = Mock()
        request.headers = {}
        request.client.host = "192.168.1.1"
        
        # Should be allowed initially
        assert check_rate_limit(request) is True

if __name__ == "__main__":
    pytest.main([__file__])
