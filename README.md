# CampoCode Forge

A modern learning platform built with React frontend and Python FastAPI backend.

## Project Structure

This project consists of two main parts:
- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Python FastAPI + SQLAlchemy + JWT Authentication

## Quick Start

### Frontend (React)

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend (Python FastAPI)

```sh
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Or on macOS/Linux
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Alternative: Use the provided scripts

**Windows:**
```sh
# Double-click or run from command line
backend\start_backend.bat
```

**All platforms:**
```sh
cd backend
python start.py
```

## Technologies Used

### Frontend
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **Uvicorn** - ASGI server
- **SQLite/PostgreSQL** - Database options

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/me` - Get current user info

### Courses
- `GET /api/v1/courses/` - Get all courses
- `POST /api/v1/courses/` - Create a new course
- `GET /api/v1/courses/{id}` - Get course by ID
- `PUT /api/v1/courses/{id}` - Update course
- `DELETE /api/v1/courses/{id}` - Delete course

### Achievements
- `GET /api/v1/achievements/` - Get all achievements
- `POST /api/v1/achievements/` - Create achievement
- `GET /api/v1/achievements/{id}` - Get achievement by ID

## Development

### Frontend Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

```sh
cd backend

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
```

## Deployment

### Frontend
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2
- Docker containers

## Project Info

**Original URL**: https://lovable.dev/projects/e7fdc40b-e369-4973-ad9d-ac855fcc1102

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the ISC License.
