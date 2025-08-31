# CampoCode Forge Backend

A FastAPI-based backend for the CampoCode Forge learning platform.

## Features

- **User Management**: Registration, login, and user profiles
- **Course Management**: Create, read, update, and delete courses
- **Achievement System**: Track user achievements and progress
- **JWT Authentication**: Secure API endpoints with token-based authentication
- **SQLAlchemy ORM**: Database management with SQLite (default) or PostgreSQL
- **CORS Support**: Configured for React frontend integration

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create a .env file (optional):**
   ```bash
   # Copy the example and modify as needed
   cp .env.example .env
   ```

### Running the Application

1. **Start the development server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API:**
   - API Base URL: `http://localhost:8000`
   - Interactive API Documentation: `http://localhost:8000/docs`
   - Alternative API Documentation: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/me` - Get current user info

### Users
- `GET /api/v1/users/` - Get all users
- `GET /api/v1/users/{user_id}` - Get user by ID

### Courses
- `POST /api/v1/courses/` - Create a new course
- `GET /api/v1/courses/` - Get all courses
- `GET /api/v1/courses/{course_id}` - Get course by ID
- `PUT /api/v1/courses/{course_id}` - Update course
- `DELETE /api/v1/courses/{course_id}` - Delete course

### Achievements
- `POST /api/v1/achievements/` - Create a new achievement
- `GET /api/v1/achievements/` - Get all achievements
- `GET /api/v1/achievements/{achievement_id}` - Get achievement by ID

## Database

The application uses SQLite by default. The database file will be created automatically when you first run the application.

To use PostgreSQL instead:

1. Update the `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost/campocode_forge
   ```

2. Install PostgreSQL dependencies:
   ```bash
   pip install psycopg2-binary
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL=sqlite:///./campocode_forge.db

# JWT Settings
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration settings
├── database.py          # Database connection and session
├── auth.py              # Authentication utilities
├── models.py            # SQLAlchemy models
├── requirements.txt     # Python dependencies
├── routers/             # API route modules
│   ├── __init__.py
│   ├── users.py         # User-related endpoints
│   ├── courses.py       # Course-related endpoints
│   └── achievements.py  # Achievement-related endpoints
└── README.md           # This file
```

### Adding New Endpoints

1. Create a new router file in the `routers/` directory
2. Define your endpoints using FastAPI decorators
3. Import and include the router in `main.py`

### Testing

Run tests using pytest:
```bash
pytest
```

## Deployment

For production deployment:

1. Set appropriate environment variables
2. Use a production ASGI server like Gunicorn with Uvicorn workers
3. Configure a reverse proxy (nginx, Apache)
4. Use a production database (PostgreSQL recommended)
5. Set up proper SSL/TLS certificates

Example production command:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `main.py` or kill the process using the port
2. **Database errors**: Ensure the database file is writable or check PostgreSQL connection
3. **Import errors**: Make sure you're in the correct directory and virtual environment is activated

### Getting Help

- Check the FastAPI documentation: https://fastapi.tiangolo.com/
- Review the interactive API docs at `http://localhost:8000/docs`
- Check the application logs for error messages
