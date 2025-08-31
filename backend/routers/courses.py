from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Course, User
from auth import get_current_user

router = APIRouter(prefix="/courses", tags=["courses"])
security = HTTPBearer()

# Pydantic models
class CourseBase(BaseModel):
    title: str
    description: str
    difficulty: str

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    difficulty: str | None = None

class CourseResponse(CourseBase):
    id: int
    instructor_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new course."""
    # Get current user
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create course
    db_course = Course(
        title=course.title,
        description=course.description,
        difficulty=course.difficulty,
        instructor_id=user.id
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.get("/", response_model=List[CourseResponse])
def get_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all courses."""
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get course by ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_update: CourseUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update a course (instructor only)."""
    # Get current user
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user is the instructor
    if course.instructor_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )
    
    # Update course
    update_data = course_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(course)
    
    return course

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete a course (instructor only)."""
    # Get current user
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user is the instructor
    if course.instructor_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this course"
        )
    
    db.delete(course)
    db.commit()
    
    return {"message": "Course deleted successfully"}
