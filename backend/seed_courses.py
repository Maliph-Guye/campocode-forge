"""
Course seeding script for CampoCode Forge Backend
"""

import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Base, User, Course, CourseCategory, CourseLevel
from auth import get_password_hash

def create_instructor():
    """Create a default instructor user."""
    db = SessionLocal()
    
    instructor = db.query(User).filter(User.email == "instructor@campocodeforge.com").first()
    
    if not instructor:
        instructor = User(
            email="instructor@campocodeforge.com",
            username="campocode_instructor",
            hashed_password=get_password_hash("InstructorPass123!"),
            is_active=True
        )
        db.add(instructor)
        db.commit()
        db.refresh(instructor)
        print(f"Created instructor: {instructor.username}")
    else:
        print(f"Instructor already exists: {instructor.username}")
    
    db.close()
    return instructor

def create_courses(instructor_id: int):
    """Create the three main courses."""
    db = SessionLocal()
    
    courses_data = [
        {
            "title": "Frontend Development Fundamentals",
            "description": "Master HTML, CSS, JavaScript, and modern frameworks to create beautiful, responsive websites.",
            "category": CourseCategory.FRONTEND,
            "difficulty": CourseLevel.BEGINNER,
            "price": 5000.0,
            "duration_hours": 40,
            "total_lessons": 20,
            "total_exercises": 15,
            "skills_covered": ["HTML5", "CSS3", "JavaScript", "React", "Responsive Design"]
        },
        {
            "title": "Backend Development with Python",
            "description": "Master backend development with Python, FastAPI, and modern web technologies.",
            "category": CourseCategory.BACKEND,
            "difficulty": CourseLevel.BEGINNER,
            "price": 5000.0,
            "duration_hours": 50,
            "total_lessons": 25,
            "total_exercises": 20,
            "skills_covered": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "JWT Authentication"]
        },
        {
            "title": "Data Analytics with Python",
            "description": "Master data analytics with Python, pandas, and visualization tools.",
            "category": CourseCategory.DATA_ANALYTICS,
            "difficulty": CourseLevel.BEGINNER,
            "price": 5000.0,
            "duration_hours": 45,
            "total_lessons": 22,
            "total_exercises": 18,
            "skills_covered": ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Statistics"]
        }
    ]
    
    created_courses = []
    
    for course_data in courses_data:
        existing_course = db.query(Course).filter(Course.title == course_data["title"]).first()
        
        if not existing_course:
            course = Course(
                instructor_id=instructor_id,
                **course_data
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            created_courses.append(course)
            print(f"Created course: {course.title} - KSH {course.price}")
        else:
            print(f"Course already exists: {course_data['title']}")
            created_courses.append(existing_course)
    
    db.close()
    return created_courses

def main():
    """Main function to seed courses."""
    print("Starting course seeding...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Create instructor
    instructor = create_instructor()
    
    # Create courses
    courses = create_courses(instructor.id)
    
    print(f"\nCourse seeding completed! Created {len(courses)} courses.")
    print("All courses are priced at KSH 5000 each.")

if __name__ == "__main__":
    main()
