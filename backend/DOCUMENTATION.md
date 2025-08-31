# CampoCode Forge Backend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Documentation](#api-documentation)
4. [Security Features](#security-features)
5. [Performance Monitoring](#performance-monitoring)
6. [Database Schema](#database-schema)
7. [Development Guidelines](#development-guidelines)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

## Overview

CampoCode Forge Backend is a high-performance, secure API built with FastAPI and Python. It provides comprehensive functionality for a learning platform including user management, course management, and achievement tracking.

### Key Features

- **FastAPI Framework**: Modern, fast web framework with automatic API documentation
- **SQLAlchemy ORM**: Robust database abstraction and management
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive Security**: Input validation, rate limiting, and security headers
- **Performance Monitoring**: Real-time metrics and performance tracking
- **Comprehensive Testing**: Unit, integration, and security tests
- **RESTful API Design**: Clean, consistent API endpoints

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   API Gateway   │
│   (React)       │◄──►│   (Optional)    │◄──►│   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │◄──►│   FastAPI       │◄──►│   Cache Layer   │
│   (SQLite/PG)   │    │   Backend       │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
backend/
├── main.py                 # Application entry point
├── config.py              # Configuration management
├── database.py            # Database connection and session
├── auth.py                # Authentication utilities
├── security.py            # Security features and validation
├── performance.py         # Performance monitoring
├── models.py              # SQLAlchemy models
├── routers/               # API route modules
│   ├── users.py          # User management endpoints
│   ├── courses.py        # Course management endpoints
│   └── achievements.py   # Achievement endpoints
├── tests/                 # Test suite
│   ├── test_security.py  # Security tests
│   ├── test_api.py       # API tests
│   └── test_performance.py # Performance tests
└── docs/                  # Documentation
```

## API Documentation

### Authentication Endpoints

#### POST /api/v1/users/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/v1/users/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

#### GET /api/v1/users/me
Get current user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Course Endpoints

#### GET /api/v1/courses/
Get all courses with pagination.

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Python Programming",
    "description": "Learn Python programming",
    "difficulty": "beginner",
    "instructor_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/v1/courses/
Create a new course (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Advanced Python",
  "description": "Advanced Python programming concepts",
  "difficulty": "advanced"
}
```

#### PUT /api/v1/courses/{course_id}
Update a course (instructor only).

#### DELETE /api/v1/courses/{course_id}
Delete a course (instructor only).

### Achievement Endpoints

#### GET /api/v1/achievements/
Get all achievements.

#### POST /api/v1/achievements/
Create a new achievement.

**Request Body:**
```json
{
  "name": "First Course Completed",
  "description": "Complete your first course",
  "points": 100,
  "icon": "🎓"
}
```

## Security Features

### Input Validation

The backend implements comprehensive input validation:

- **Email Validation**: RFC-compliant email format validation
- **Username Validation**: 3-30 characters, alphanumeric and underscore only
- **Password Strength**: Minimum 8 characters with complexity requirements
- **Input Sanitization**: XSS and injection attack prevention

### Rate Limiting

- **Requests per Hour**: 100 requests per IP address
- **Configurable Limits**: Adjustable via configuration
- **IP-based Tracking**: Separate limits per client IP

### Security Headers

The application automatically adds security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`

### JWT Authentication

- **Algorithm**: HS256
- **Token Expiry**: 30 minutes (configurable)
- **Secure Storage**: Tokens stored securely in client
- **Token Refresh**: Automatic token refresh mechanism

## Performance Monitoring

### Metrics Collected

- **Request Timing**: Response time for each endpoint
- **System Metrics**: CPU, memory, and disk usage
- **Error Rates**: Error tracking and alerting
- **Database Performance**: Query timing and optimization

### Performance Dashboard

Access performance metrics at `/api/v1/performance`:

```json
{
  "summary": {
    "total_requests": 1000,
    "avg_response_time": 0.15,
    "error_rate": 0.02,
    "endpoint_count": 15
  },
  "endpoints": {
    "GET /api/v1/courses": {
      "count": 500,
      "avg_response_time": 0.12,
      "error_rate": 0.01
    }
  },
  "system": {
    "cpu_avg": 25.5,
    "memory_avg": 45.2,
    "disk_avg": 30.1
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    difficulty VARCHAR CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    instructor_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    icon VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development Guidelines

### Code Style

- **PEP 8**: Follow Python PEP 8 style guidelines
- **Type Hints**: Use type hints for all function parameters and return values
- **Docstrings**: Comprehensive docstrings for all functions and classes
- **Error Handling**: Proper exception handling with meaningful error messages

### Security Best Practices

1. **Input Validation**: Always validate and sanitize user input
2. **Authentication**: Use JWT tokens for authentication
3. **Authorization**: Implement proper role-based access control
4. **Rate Limiting**: Protect against abuse with rate limiting
5. **Logging**: Log security events and errors
6. **HTTPS**: Always use HTTPS in production

### Performance Best Practices

1. **Database Optimization**: Use indexes and optimize queries
2. **Caching**: Implement caching for frequently accessed data
3. **Async Operations**: Use async/await for I/O operations
4. **Connection Pooling**: Use database connection pooling
5. **Monitoring**: Monitor performance metrics continuously

## Testing Strategy

### Test Types

1. **Unit Tests**: Test individual functions and classes
2. **Integration Tests**: Test API endpoints and database operations
3. **Security Tests**: Test authentication, authorization, and input validation
4. **Performance Tests**: Test response times and system performance

### Running Tests

```bash
# Run all tests
pytest

# Run specific test categories
pytest -m security
pytest -m performance
pytest -m integration

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_security.py
```

### Test Coverage

- **Target Coverage**: 80% minimum
- **Critical Paths**: 100% coverage for security and authentication
- **API Endpoints**: 100% coverage for all public endpoints

## Deployment Guide

### Production Requirements

- **Python**: 3.8 or higher
- **Database**: PostgreSQL (recommended) or SQLite
- **Web Server**: Gunicorn with Uvicorn workers
- **Reverse Proxy**: Nginx or Apache
- **SSL Certificate**: Valid SSL certificate for HTTPS

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/campocode_forge

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["https://yourdomain.com"]

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### Deployment Steps

1. **Prepare Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Database Setup**
   ```bash
   alembic upgrade head
   ```

3. **Start Application**
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database URL and credentials
   - Ensure database server is running
   - Verify network connectivity

2. **Authentication Issues**
   - Check JWT secret key configuration
   - Verify token expiration settings
   - Check CORS configuration

3. **Performance Issues**
   - Monitor database query performance
   - Check system resource usage
   - Review application logs

4. **Security Issues**
   - Verify input validation is working
   - Check rate limiting configuration
   - Review security headers

### Logging

The application uses structured logging with different levels:

- **DEBUG**: Detailed debugging information
- **INFO**: General information about application flow
- **WARNING**: Warning messages for potential issues
- **ERROR**: Error messages for failed operations
- **CRITICAL**: Critical errors that may cause application failure

### Monitoring

- **Health Check**: `/health` endpoint for monitoring
- **Performance Metrics**: `/api/v1/performance` for detailed metrics
- **Application Logs**: Check log files for errors and warnings
- **System Metrics**: Monitor CPU, memory, and disk usage

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Run the test suite**
6. **Submit a pull request**

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations are addressed
- [ ] Performance impact is considered

### Release Process

1. **Version bump** in `main.py`
2. **Update changelog**
3. **Create release tag**
4. **Deploy to staging**
5. **Run integration tests**
6. **Deploy to production**

---

For more information, contact the development team or refer to the inline code documentation.
