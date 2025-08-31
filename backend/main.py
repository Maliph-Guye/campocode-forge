"""
CampoCode Forge Backend API

A FastAPI-based backend for the CampoCode Forge learning platform.
Provides user management, course management, and achievement tracking.

Author: CampoCode Forge Team
Version: 1.0.0
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv

# Import routers
from routers import users, courses, achievements

# Import database and models
from database import engine
from models import Base
from config import settings

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("campocode_forge.log")
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting CampoCode Forge Backend...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
    
    logger.info("CampoCode Forge Backend started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CampoCode Forge Backend...")

# Create FastAPI application
app = FastAPI(
    title="CampoCode Forge API",
    description="""
    ## CampoCode Forge Learning Platform API
    
    A comprehensive API for managing users, courses, and achievements in the CampoCode Forge learning platform.
    
    ### Features:
    - **User Management**: Registration, authentication, and profile management
    - **Course Management**: Create, update, and manage learning courses
    - **Achievement System**: Track user progress and award achievements
    - **JWT Authentication**: Secure API access with token-based authentication
    
    ### Getting Started:
    1. Register a new user at `/api/v1/users/register`
    2. Login to get an access token at `/api/v1/users/login`
    3. Use the token in the Authorization header for protected endpoints
    """,
    version="1.0.0",
    contact={
        "name": "CampoCode Forge Team",
        "email": "support@campocodeforge.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.campocodeforge.com"]
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP exception handler for better error responses."""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP error",
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.get("/", tags=["Root"])
async def root() -> Dict[str, Any]:
    """
    Root endpoint providing API information.
    
    Returns:
        Dict containing API welcome message and basic information
    """
    return {
        "message": "Welcome to CampoCode Forge API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "documentation": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for monitoring.
    
    Returns:
        Dict containing health status and system information
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/api/v1", tags=["API Info"])
async def api_info() -> Dict[str, Any]:
    """
    API information endpoint.
    
    Returns:
        Dict containing API version and available endpoints
    """
    return {
        "api_version": "v1",
        "endpoints": {
            "users": "/api/v1/users",
            "courses": "/api/v1/courses", 
            "achievements": "/api/v1/achievements"
        },
        "authentication": "JWT Bearer Token",
        "documentation": "/docs"
    }

# Include routers with proper error handling
try:
    app.include_router(users.router, prefix="/api/v1", tags=["Users"])
    app.include_router(courses.router, prefix="/api/v1", tags=["Courses"])
    app.include_router(achievements.router, prefix="/api/v1", tags=["Achievements"])
    logger.info("All routers included successfully")
except Exception as e:
    logger.error(f"Failed to include routers: {e}")
    raise

if __name__ == "__main__":
    # Development server configuration
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
