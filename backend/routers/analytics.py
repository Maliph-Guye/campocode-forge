"""
Analytics router for CampoCode Forge Backend

Handles learning analytics and progress tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import (
    User, Course, Lesson, Exercise, Enrollment, LessonProgress, 
    ExerciseAttempt, CourseCategory, CourseLevel
)
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])
security = HTTPBearer()

@router.get("/dashboard")
async def get_analytics_dashboard(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics dashboard for the user."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get basic stats
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    total_courses = len(enrollments)
    
    # Calculate completion stats
    completed_courses = len([e for e in enrollments if e.progress >= 100])
    average_progress = sum(e.progress for e in enrollments) / total_courses if total_courses > 0 else 0
    
    # Get learning activity
    total_lessons_completed = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.completed_at.isnot(None)
    ).count()
    
    total_exercises_completed = db.query(ExerciseAttempt).filter(
        ExerciseAttempt.user_id == user.id,
        ExerciseAttempt.completed_at.isnot(None)
    ).count()
    
    # Calculate study time
    total_study_time = db.query(func.sum(LessonProgress.time_spent_seconds)).filter(
        LessonProgress.user_id == user.id
    ).scalar() or 0
    
    total_study_time_minutes = total_study_time // 60
    
    # Get course performance
    course_performance = []
    for enrollment in enrollments:
        course = enrollment.course
        course_performance.append({
            "course_id": course.id,
            "title": course.title,
            "category": course.category.value,
            "progress": enrollment.progress,
            "lessons_completed": enrollment.lessons_completed,
            "exercises_completed": enrollment.exercises_completed,
            "points_earned": enrollment.total_points_earned,
            "enrolled_at": enrollment.enrolled_at,
            "last_accessed": enrollment.last_accessed
        })
    
    return {
        "user_info": {
            "username": user.username,
            "level": user.level,
            "total_points": user.total_points,
            "streak_days": user.streak_days,
            "last_activity": user.last_activity
        },
        "overview": {
            "total_courses_enrolled": total_courses,
            "completed_courses": completed_courses,
            "average_progress": round(average_progress, 2),
            "total_lessons_completed": total_lessons_completed,
            "total_exercises_completed": total_exercises_completed,
            "total_study_time_minutes": total_study_time_minutes,
            "completion_rate": (completed_courses / total_courses * 100) if total_courses > 0 else 0
        },
        "course_performance": course_performance
    }

@router.get("/progress-trend")
async def get_progress_trend(
    days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get progress trend over time."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily progress data
    daily_progress = []
    current_date = start_date
    
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        
        # Lessons completed on this date
        lessons_completed = db.query(LessonProgress).filter(
            LessonProgress.user_id == user.id,
            LessonProgress.completed_at >= current_date,
            LessonProgress.completed_at < next_date
        ).count()
        
        # Exercises completed on this date
        exercises_completed = db.query(ExerciseAttempt).filter(
            ExerciseAttempt.user_id == user.id,
            ExerciseAttempt.completed_at >= current_date,
            ExerciseAttempt.completed_at < next_date
        ).count()
        
        # Points earned on this date
        points_earned = db.query(func.sum(ExerciseAttempt.points_earned)).filter(
            ExerciseAttempt.user_id == user.id,
            ExerciseAttempt.completed_at >= current_date,
            ExerciseAttempt.completed_at < next_date
        ).scalar() or 0
        
        daily_progress.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "lessons_completed": lessons_completed,
            "exercises_completed": exercises_completed,
            "points_earned": points_earned
        })
        
        current_date = next_date
    
    return daily_progress

@router.get("/course-analytics/{course_id}")
async def get_course_analytics(
    course_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get detailed analytics for a specific course."""
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
    
    course = enrollment.course
    
    # Get lesson progress
    lesson_progress = db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment.id
    ).all()
    
    # Get exercise attempts
    exercise_attempts = db.query(ExerciseAttempt).join(Exercise).filter(
        Exercise.course_id == course_id,
        ExerciseAttempt.user_id == user.id
    ).all()
    
    # Calculate time spent
    total_time_spent = sum(lp.time_spent_seconds for lp in lesson_progress)
    
    # Calculate average scores
    completed_exercises = [ea for ea in exercise_attempts if ea.completed_at]
    average_score = sum(ea.score for ea in completed_exercises) / len(completed_exercises) if completed_exercises else 0
    
    return {
        "course_info": {
            "id": course.id,
            "title": course.title,
            "category": course.category.value,
            "difficulty": course.difficulty.value,
            "enrolled_at": enrollment.enrolled_at,
            "last_accessed": enrollment.last_accessed
        },
        "progress_summary": {
            "overall_progress": enrollment.progress,
            "lessons_completed": enrollment.lessons_completed,
            "total_lessons": len(lesson_progress),
            "exercises_completed": enrollment.exercises_completed,
            "total_points_earned": enrollment.total_points_earned,
            "total_time_spent_minutes": total_time_spent // 60,
            "average_score": round(average_score, 2)
        },
        "lesson_progress": [
            {
                "lesson_id": lp.lesson_id,
                "progress_percentage": lp.progress_percentage,
                "time_spent_seconds": lp.time_spent_seconds,
                "completed": lp.completed_at is not None,
                "started_at": lp.started_at,
                "completed_at": lp.completed_at
            }
            for lp in lesson_progress
        ],
        "exercise_performance": [
            {
                "exercise_id": ea.exercise_id,
                "score": ea.score,
                "points_earned": ea.points_earned,
                "time_spent_seconds": ea.time_spent_seconds,
                "attempts_count": ea.attempts_count,
                "completed_at": ea.completed_at
            }
            for ea in exercise_attempts
        ]
    }

@router.get("/leaderboard")
async def get_leaderboard(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get learning leaderboard."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get top users by points
    top_users = db.query(User).order_by(User.total_points.desc()).limit(10).all()
    
    leaderboard = []
    for i, user in enumerate(top_users, 1):
        leaderboard.append({
            "rank": i,
            "user_id": user.id,
            "username": user.username,
            "total_points": user.total_points,
            "level": user.level,
            "streak_days": user.streak_days
        })
    
    return leaderboard
