"""
Learning router for CampoCode Forge Backend

Handles course enrollment, lesson progress, and learning analytics.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import json

from database import get_db
from models import (
    User, Course, Lesson, Exercise, Enrollment, LessonProgress, 
    ExerciseAttempt, CourseCategory, CourseLevel
)
from auth import get_current_user
from security import InputValidator

router = APIRouter(prefix="/learning", tags=["learning"])
security = HTTPBearer()

# Pydantic models
class CourseEnrollmentRequest(BaseModel):
    course_id: int
    payment_method: str = "mpesa"

class LessonProgressUpdate(BaseModel):
    progress_percentage: float
    time_spent_seconds: int
    notes: Optional[str] = None

class ExerciseSubmission(BaseModel):
    code: str
    language: str = "python"

class LearningStats(BaseModel):
    total_courses_enrolled: int
    total_lessons_completed: int
    total_exercises_completed: int
    total_points_earned: int
    current_streak: int
    average_progress: float

@router.post("/enroll/{course_id}")
async def enroll_in_course(
    course_id: int,
    enrollment_request: CourseEnrollmentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Enroll user in a course."""
    # Get current user
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create enrollment
    enrollment = Enrollment(
        user_id=user.id,
        course_id=course_id,
        payment_amount=course.price,
        payment_status="pending"
    )
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    
    return {
        "message": "Enrollment created successfully",
        "enrollment_id": enrollment.id,
        "course_title": course.title,
        "amount": course.price,
        "currency": "KSH"
    }

@router.get("/my-courses")
async def get_my_courses(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all courses enrolled by the current user."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    
    courses_data = []
    for enrollment in enrollments:
        course = enrollment.course
        courses_data.append({
            "enrollment_id": enrollment.id,
            "course_id": course.id,
            "title": course.title,
            "description": course.description,
            "category": course.category.value,
            "difficulty": course.difficulty.value,
            "progress": enrollment.progress,
            "lessons_completed": enrollment.lessons_completed,
            "exercises_completed": enrollment.exercises_completed,
            "total_points_earned": enrollment.total_points_earned,
            "enrolled_at": enrollment.enrolled_at,
            "last_accessed": enrollment.last_accessed,
            "payment_status": enrollment.payment_status
        })
    
    return courses_data

@router.get("/courses/{course_id}/lessons")
async def get_course_lessons(
    course_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all lessons for a specific course."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get lessons with progress
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
    
    lessons_data = []
    for lesson in lessons:
        # Get user's progress for this lesson
        progress = db.query(LessonProgress).filter(
            LessonProgress.user_id == user.id,
            LessonProgress.lesson_id == lesson.id
        ).first()
        
        lessons_data.append({
            "id": lesson.id,
            "title": lesson.title,
            "order": lesson.order,
            "duration_minutes": lesson.duration_minutes,
            "lesson_type": lesson.lesson_type,
            "video_url": lesson.video_url,
            "resources": lesson.resources,
            "progress_percentage": progress.progress_percentage if progress else 0.0,
            "completed": progress.completed_at is not None if progress else False,
            "time_spent_seconds": progress.time_spent_seconds if progress else 0
        })
    
    return lessons_data

@router.get("/lessons/{lesson_id}")
async def get_lesson_details(
    lesson_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get detailed lesson information."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user is enrolled in the course
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == lesson.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get user's progress
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    # Create progress record if it doesn't exist
    if not progress:
        progress = LessonProgress(
            user_id=user.id,
            lesson_id=lesson_id,
            enrollment_id=enrollment.id
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return {
        "id": lesson.id,
        "title": lesson.title,
        "content": lesson.content,
        "order": lesson.order,
        "duration_minutes": lesson.duration_minutes,
        "lesson_type": lesson.lesson_type,
        "video_url": lesson.video_url,
        "resources": lesson.resources,
        "quiz_questions": lesson.quiz_questions,
        "progress_percentage": progress.progress_percentage,
        "time_spent_seconds": progress.time_spent_seconds,
        "notes": progress.notes,
        "started_at": progress.started_at,
        "completed_at": progress.completed_at
    }

@router.put("/lessons/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: int,
    progress_update: LessonProgressUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update lesson progress."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get lesson progress
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    if not progress:
        raise HTTPException(status_code=404, detail="Lesson progress not found")
    
    # Update progress
    progress.progress_percentage = progress_update.progress_percentage
    progress.time_spent_seconds += progress_update.time_spent_seconds
    
    if progress_update.notes:
        progress.notes = progress_update.notes
    
    # Mark as completed if progress is 100%
    if progress_update.progress_percentage >= 100.0 and not progress.completed_at:
        progress.completed_at = datetime.utcnow()
        
        # Update enrollment progress
        enrollment = progress.enrollment
        total_lessons = db.query(Lesson).filter(Lesson.course_id == enrollment.course_id).count()
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.completed_at.isnot(None)
        ).count()
        
        enrollment.lessons_completed = completed_lessons
        enrollment.progress = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        enrollment.last_accessed = datetime.utcnow()
        
        # Update user's total points
        user.total_points += 10  # Points for completing a lesson
        user.last_activity = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    
    return {
        "message": "Progress updated successfully",
        "progress_percentage": progress.progress_percentage,
        "time_spent_seconds": progress.time_spent_seconds,
        "completed": progress.completed_at is not None
    }

@router.get("/courses/{course_id}/exercises")
async def get_course_exercises(
    course_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all exercises for a specific course."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    exercises = db.query(Exercise).filter(Exercise.course_id == course_id).order_by(Exercise.order).all()
    
    exercises_data = []
    for exercise in exercises:
        # Get user's best attempt
        best_attempt = db.query(ExerciseAttempt).filter(
            ExerciseAttempt.user_id == user.id,
            ExerciseAttempt.exercise_id == exercise.id
        ).order_by(ExerciseAttempt.score.desc()).first()
        
        exercises_data.append({
            "id": exercise.id,
            "title": exercise.title,
            "description": exercise.description,
            "order": exercise.order,
            "points": exercise.points,
            "exercise_type": exercise.exercise_type,
            "difficulty": exercise.difficulty.value,
            "estimated_time": exercise.estimated_time,
            "starter_code": exercise.starter_code,
            "best_score": best_attempt.score if best_attempt else 0.0,
            "attempts_count": best_attempt.attempts_count if best_attempt else 0,
            "completed": best_attempt.completed_at is not None if best_attempt else False
        })
    
    return exercises_data

@router.post("/exercises/{exercise_id}/submit")
async def submit_exercise(
    exercise_id: int,
    submission: ExerciseSubmission,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Submit exercise solution."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Check if user is enrolled in the course
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == exercise.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Create exercise attempt
    attempt = ExerciseAttempt(
        user_id=user.id,
        exercise_id=exercise_id,
        code_submitted=submission.code
    )
    
    # Simple code validation (in a real app, you'd run the code)
    # For now, we'll simulate a basic check
    test_results = []
    score = 0.0
    
    # Basic validation checks
    if submission.code and len(submission.code.strip()) > 0:
        score = 80.0  # Base score for submitting code
        test_results.append({"test": "Code submitted", "passed": True})
        
        # Check for basic syntax (very simplified)
        if "def " in submission.code or "function " in submission.code:
            score += 10
            test_results.append({"test": "Function definition found", "passed": True})
        
        if "return " in submission.code:
            score += 10
            test_results.append({"test": "Return statement found", "passed": True})
    
    attempt.score = score
    attempt.test_results = test_results
    attempt.points_earned = int(score / 10)  # Convert score to points
    attempt.completed_at = datetime.utcnow()
    
    db.add(attempt)
    
    # Update user points
    user.total_points += attempt.points_earned
    user.last_activity = datetime.utcnow()
    
    # Update enrollment
    enrollment.exercises_completed += 1
    enrollment.total_points_earned += attempt.points_earned
    enrollment.last_accessed = datetime.utcnow()
    
    db.commit()
    db.refresh(attempt)
    
    return {
        "message": "Exercise submitted successfully",
        "score": score,
        "points_earned": attempt.points_earned,
        "test_results": test_results,
        "attempt_id": attempt.id
    }

@router.get("/stats")
async def get_learning_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get user's learning statistics."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get enrollment stats
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    total_courses_enrolled = len(enrollments)
    
    # Get completed lessons
    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.completed_at.isnot(None)
    ).count()
    
    # Get completed exercises
    completed_exercises = db.query(ExerciseAttempt).filter(
        ExerciseAttempt.user_id == user.id,
        ExerciseAttempt.completed_at.isnot(None)
    ).count()
    
    # Calculate average progress
    total_progress = sum(enrollment.progress for enrollment in enrollments)
    average_progress = total_progress / total_courses_enrolled if total_courses_enrolled > 0 else 0
    
    # Calculate streak (simplified - check last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_activity = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.last_activity >= seven_days_ago
    ).count()
    
    current_streak = min(recent_activity, 7)  # Simplified streak calculation
    
    return {
        "total_courses_enrolled": total_courses_enrolled,
        "total_lessons_completed": completed_lessons,
        "total_exercises_completed": completed_exercises,
        "total_points_earned": user.total_points,
        "current_streak": current_streak,
        "average_progress": round(average_progress, 2),
        "level": user.level,
        "last_activity": user.last_activity
    }

@router.get("/courses/{course_id}/progress")
async def get_course_progress(
    course_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get detailed progress for a specific course."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")
    
    course = enrollment.course
    
    # Get lesson progress
    lesson_progress = db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment.id
    ).all()
    
    # Get exercise progress
    exercise_attempts = db.query(ExerciseAttempt).join(Exercise).filter(
        Exercise.course_id == course_id,
        ExerciseAttempt.user_id == user.id
    ).all()
    
    return {
        "course_id": course.id,
        "course_title": course.title,
        "overall_progress": enrollment.progress,
        "lessons_completed": enrollment.lessons_completed,
        "exercises_completed": enrollment.exercises_completed,
        "total_points_earned": enrollment.total_points_earned,
        "enrolled_at": enrollment.enrolled_at,
        "last_accessed": enrollment.last_accessed,
        "lesson_progress": [
            {
                "lesson_id": lp.lesson_id,
                "progress_percentage": lp.progress_percentage,
                "completed": lp.completed_at is not None,
                "time_spent_seconds": lp.time_spent_seconds
            }
            for lp in lesson_progress
        ],
        "exercise_progress": [
            {
                "exercise_id": ea.exercise_id,
                "best_score": ea.score,
                "attempts_count": ea.attempts_count,
                "completed": ea.completed_at is not None
            }
            for ea in exercise_attempts
        ]
    }
