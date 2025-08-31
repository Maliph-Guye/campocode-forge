"""
Security module for CampoCode Forge Backend

This module provides comprehensive security features including:
- Input validation and sanitization
- Rate limiting
- Security headers
- Password strength validation
- JWT token management
- CORS configuration

Author: CampoCode Forge Team
"""

import re
import hashlib
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator, EmailStr
import logging

logger = logging.getLogger(__name__)

class SecurityConfig:
    """Security configuration constants."""
    
    # Password requirements
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]"
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = 100  # requests per window
    RATE_LIMIT_WINDOW = 3600   # seconds (1 hour)
    
    # JWT settings
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    
    # Security headers
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    }

class InputValidator:
    """Input validation and sanitization utilities."""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username format."""
        # Username: 3-30 characters, alphanumeric and underscore only
        username_pattern = r'^[a-zA-Z0-9_]{3,30}$'
        return bool(re.match(username_pattern, username))
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validate password strength and return detailed feedback."""
        errors = []
        warnings = []
        
        if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
            errors.append(f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters long")
        
        if len(password) > SecurityConfig.MAX_PASSWORD_LENGTH:
            errors.append(f"Password must be no more than {SecurityConfig.MAX_PASSWORD_LENGTH} characters long")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one digit")
        
        if not re.search(r'[@$!%*?&]', password):
            errors.append("Password must contain at least one special character (@$!%*?&)")
        
        # Additional strength checks
        if len(password) < 12:
            warnings.append("Consider using a longer password for better security")
        
        if re.search(r'(.)\1{2,}', password):
            warnings.append("Avoid repeating characters")
        
        if re.search(r'(123|abc|qwe|password|admin)', password.lower()):
            warnings.append("Avoid common patterns and words")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "score": max(0, 10 - len(errors) - len(warnings))
        }
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Sanitize user input to prevent XSS and injection attacks."""
        if not text:
            return text
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '{', '}']
        sanitized = text
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        
        # Remove script tags
        sanitized = re.sub(r'<script.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        return sanitized.strip()
    
    @staticmethod
    def validate_course_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate course creation/update data."""
        errors = []
        
        if 'title' in data:
            title = data['title']
            if not title or len(title.strip()) < 3:
                errors.append("Course title must be at least 3 characters long")
            if len(title) > 200:
                errors.append("Course title must be no more than 200 characters")
        
        if 'description' in data:
            description = data['description']
            if description and len(description) > 2000:
                errors.append("Course description must be no more than 2000 characters")
        
        if 'difficulty' in data:
            difficulty = data['difficulty']
            valid_difficulties = ['beginner', 'intermediate', 'advanced']
            if difficulty not in valid_difficulties:
                errors.append(f"Difficulty must be one of: {', '.join(valid_difficulties)}")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }

class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, client_ip: str) -> bool:
        """Check if request is allowed based on rate limiting."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=SecurityConfig.RATE_LIMIT_WINDOW)
        
        # Clean old entries
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if req_time > window_start
            ]
        
        # Check rate limit
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        if len(self.requests[client_ip]) >= SecurityConfig.RATE_LIMIT_REQUESTS:
            return False
        
        # Add current request
        self.requests[client_ip].append(now)
        return True

class SecurityMiddleware:
    """Security middleware for adding security headers."""
    
    @staticmethod
    async def add_security_headers(request: Request, call_next):
        """Add security headers to response."""
        response = await call_next(request)
        
        for header, value in SecurityConfig.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        return response

class PasswordManager:
    """Password management utilities."""
    
    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure random password."""
        if length < 8:
            length = 8
        
        # Ensure at least one of each required character type
        password = [
            secrets.choice('abcdefghijklmnopqrstuvwxyz'),  # lowercase
            secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),  # uppercase
            secrets.choice('0123456789'),                   # digit
            secrets.choice('@$!%*?&')                       # special
        ]
        
        # Fill the rest with random characters
        remaining_length = length - len(password)
        all_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&'
        password.extend(secrets.choice(all_chars) for _ in range(remaining_length))
        
        # Shuffle the password
        secrets.SystemRandom().shuffle(password)
        return ''.join(password)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using secure algorithm."""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}${hash_obj.hex()}"
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash."""
        try:
            salt, hash_hex = hashed.split('$')
            hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return hash_obj.hex() == hash_hex
        except Exception:
            return False

# Pydantic models for validation
class UserRegistrationData(BaseModel):
    """User registration data validation model."""
    
    email: EmailStr
    username: str
    password: str
    
    @validator('username')
    def validate_username(cls, v):
        if not InputValidator.validate_username(v):
            raise ValueError('Invalid username format')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        validation = InputValidator.validate_password_strength(v)
        if not validation['is_valid']:
            raise ValueError(f"Password validation failed: {'; '.join(validation['errors'])}")
        return v

class CourseData(BaseModel):
    """Course data validation model."""
    
    title: str
    description: str
    difficulty: str
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError('Title must be at least 3 characters long')
        if len(v) > 200:
            raise ValueError('Title must be no more than 200 characters')
        return InputValidator.sanitize_input(v)
    
    @validator('description')
    def validate_description(cls, v):
        if v and len(v) > 2000:
            raise ValueError('Description must be no more than 2000 characters')
        return InputValidator.sanitize_input(v) if v else v
    
    @validator('difficulty')
    def validate_difficulty(cls, v):
        valid_difficulties = ['beginner', 'intermediate', 'advanced']
        if v not in valid_difficulties:
            raise ValueError(f'Difficulty must be one of: {", ".join(valid_difficulties)}')
        return v

# Global rate limiter instance
rate_limiter = RateLimiter()

def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def check_rate_limit(request: Request) -> bool:
    """Check if request is within rate limits."""
    client_ip = get_client_ip(request)
    return rate_limiter.is_allowed(client_ip)
