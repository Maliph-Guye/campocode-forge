#!/usr/bin/env python3
"""
Startup script for CampoCode Forge Backend
"""

import uvicorn
import os
import sys
from pathlib import Path

def main():
    """Start the FastAPI application"""
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    # Change to the backend directory
    os.chdir(script_dir)
    
    # Check if main.py exists
    if not Path("main.py").exists():
        print("Error: main.py not found in the backend directory")
        sys.exit(1)
    
    print("Starting CampoCode Forge Backend...")
    print("API will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
