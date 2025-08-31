"""
Practice router for CampoCode Forge Backend

Handles coding exercises, practice sessions, and skill development.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

from database import get_db
from models import (
    User, Exercise, ExerciseAttempt, PracticeSession, CourseCategory, CourseLevel
)
from auth import get_current_user

router = APIRouter(prefix="/practice", tags=["practice"])
security = HTTPBearer()

# Pydantic models
class PracticeSessionRequest(BaseModel):
    session_type: str = "coding"  # coding, quiz, project
    difficulty_level: str = "beginner"
    category: Optional[str] = None

class PracticeExerciseSubmission(BaseModel):
    code: str
    language: str = "python"
    time_spent_seconds: int

class PracticeStats(BaseModel):
    total_sessions: int
    total_exercises_completed: int
    total_points_earned: int
    average_score: float
    preferred_language: str
    strength_areas: List[str]
    improvement_areas: List[str]

@router.post("/start-session")
async def start_practice_session(
    session_request: PracticeSessionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Start a new practice session."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create practice session
    session = PracticeSession(
        user_id=user.id,
        session_type=session_request.session_type,
        difficulty_level=CourseLevel(session_request.difficulty_level)
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "session_id": session.id,
        "session_type": session.session_type,
        "difficulty_level": session.difficulty_level.value,
        "started_at": session.started_at,
        "message": "Practice session started"
    }

@router.post("/sessions/{session_id}/end")
async def end_practice_session(
    session_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """End a practice session."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session = db.query(PracticeSession).filter(
        PracticeSession.id == session_id,
        PracticeSession.user_id == user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Practice session not found")
    
    if session.ended_at:
        raise HTTPException(status_code=400, detail="Session already ended")
    
    # Calculate session duration
    duration = datetime.utcnow() - session.started_at
    session.duration_minutes = int(duration.total_seconds() / 60)
    session.ended_at = datetime.utcnow()
    
    # Update user activity
    user.last_activity = datetime.utcnow()
    
    db.commit()
    db.refresh(session)
    
    return {
        "session_id": session.id,
        "duration_minutes": session.duration_minutes,
        "exercises_completed": session.exercises_completed,
        "points_earned": session.points_earned,
        "ended_at": session.ended_at
    }

@router.get("/exercises/random")
async def get_random_exercise(
    difficulty: str = Query("beginner", description="Exercise difficulty level"),
    category: Optional[str] = Query(None, description="Course category"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get a random practice exercise."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build query for exercises
    query = db.query(Exercise).filter(Exercise.difficulty == CourseLevel(difficulty))
    
    if category:
        query = query.join(Course).filter(Course.category == CourseCategory(category))
    
    # Get random exercise
    exercises = query.all()
    if not exercises:
        raise HTTPException(status_code=404, detail="No exercises found for the specified criteria")
    
    exercise = random.choice(exercises)
    
    return {
        "id": exercise.id,
        "title": exercise.title,
        "description": exercise.description,
        "difficulty": exercise.difficulty.value,
        "exercise_type": exercise.exercise_type,
        "estimated_time": exercise.estimated_time,
        "points": exercise.points,
        "starter_code": exercise.starter_code,
        "test_cases": exercise.test_cases[:2] if exercise.test_cases else []  # Show first 2 test cases
    }

@router.get("/exercises/category/{category}")
async def get_exercises_by_category(
    category: str,
    difficulty: Optional[str] = Query(None, description="Exercise difficulty level"),
    limit: int = Query(10, description="Number of exercises to return"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get exercises by category."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build query
    query = db.query(Exercise).join(Course).filter(Course.category == CourseCategory(category))
    
    if difficulty:
        query = query.filter(Exercise.difficulty == CourseLevel(difficulty))
    
    exercises = query.limit(limit).all()
    
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
            "difficulty": exercise.difficulty.value,
            "exercise_type": exercise.exercise_type,
            "estimated_time": exercise.estimated_time,
            "points": exercise.points,
            "best_score": best_attempt.score if best_attempt else 0.0,
            "attempts_count": best_attempt.attempts_count if best_attempt else 0,
            "completed": best_attempt.completed_at is not None if best_attempt else False
        })
    
    return exercises_data

@router.post("/exercises/{exercise_id}/submit")
async def submit_practice_exercise(
    exercise_id: int,
    submission: PracticeExerciseSubmission,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Submit a practice exercise solution."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Create exercise attempt
    attempt = ExerciseAttempt(
        user_id=user.id,
        exercise_id=exercise_id,
        code_submitted=submission.code,
        time_spent_seconds=submission.time_spent_seconds
    )
    
    # Enhanced code validation and scoring
    test_results = []
    score = 0.0
    
    # Basic validation
    if submission.code and len(submission.code.strip()) > 0:
        score = 60.0  # Base score
        test_results.append({"test": "Code submitted", "passed": True, "points": 10})
        
        # Language-specific checks
        if submission.language.lower() == "python":
            if "def " in submission.code:
                score += 15
                test_results.append({"test": "Function definition found", "passed": True, "points": 15})
            
            if "return " in submission.code:
                score += 10
                test_results.append({"test": "Return statement found", "passed": True, "points": 10})
            
            if "import " in submission.code:
                score += 5
                test_results.append({"test": "Import statement found", "passed": True, "points": 5})
        
        elif submission.language.lower() == "javascript":
            if "function " in submission.code or "=>" in submission.code:
                score += 15
                test_results.append({"test": "Function definition found", "passed": True, "points": 15})
            
            if "return " in submission.code:
                score += 10
                test_results.append({"test": "Return statement found", "passed": True, "points": 10})
        
        # Code quality checks
        if len(submission.code.split('\n')) > 3:
            score += 5
            test_results.append({"test": "Multiple lines of code", "passed": True, "points": 5})
        
        if "print(" in submission.code or "console.log(" in submission.code:
            score += 5
            test_results.append({"test": "Output statement found", "passed": True, "points": 5})
    
    # Cap score at 100
    score = min(score, 100.0)
    
    attempt.score = score
    attempt.test_results = test_results
    attempt.points_earned = int(score / 10)
    attempt.completed_at = datetime.utcnow()
    
    db.add(attempt)
    
    # Update user points and activity
    user.total_points += attempt.points_earned
    user.last_activity = datetime.utcnow()
    
    db.commit()
    db.refresh(attempt)
    
    return {
        "message": "Practice exercise submitted successfully",
        "score": score,
        "points_earned": attempt.points_earned,
        "test_results": test_results,
        "attempt_id": attempt.id,
        "feedback": generate_feedback(score, test_results)
    }

@router.get("/stats")
async def get_practice_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get user's practice statistics."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get practice sessions
    sessions = db.query(PracticeSession).filter(PracticeSession.user_id == user.id).all()
    total_sessions = len(sessions)
    
    # Get exercise attempts
    attempts = db.query(ExerciseAttempt).filter(ExerciseAttempt.user_id == user.id).all()
    total_exercises_completed = len([a for a in attempts if a.completed_at])
    total_points_earned = sum(a.points_earned for a in attempts)
    
    # Calculate average score
    completed_attempts = [a for a in attempts if a.completed_at]
    average_score = sum(a.score for a in completed_attempts) / len(completed_attempts) if completed_attempts else 0
    
    # Analyze strength and improvement areas
    strength_areas = analyze_strength_areas(attempts, db)
    improvement_areas = analyze_improvement_areas(attempts, db)
    
    # Determine preferred language
    language_attempts = {}
    for attempt in attempts:
        # This would need to be enhanced based on actual language tracking
        language_attempts["python"] = language_attempts.get("python", 0) + 1
    
    preferred_language = max(language_attempts.items(), key=lambda x: x[1])[0] if language_attempts else "python"
    
    return {
        "total_sessions": total_sessions,
        "total_exercises_completed": total_exercises_completed,
        "total_points_earned": total_points_earned,
        "average_score": round(average_score, 2),
        "preferred_language": preferred_language,
        "strength_areas": strength_areas,
        "improvement_areas": improvement_areas,
        "recent_sessions": [
            {
                "session_id": session.id,
                "session_type": session.session_type,
                "duration_minutes": session.duration_minutes,
                "exercises_completed": session.exercises_completed,
                "points_earned": session.points_earned,
                "started_at": session.started_at
            }
            for session in sessions[-5:]  # Last 5 sessions
        ]
    }

@router.get("/leaderboard")
async def get_practice_leaderboard(
    category: Optional[str] = Query(None, description="Course category"),
    limit: int = Query(10, description="Number of users to return"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get practice leaderboard."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get users with highest points
    query = db.query(User).order_by(User.total_points.desc())
    
    if category:
        # Filter by users who have completed exercises in the specified category
        query = query.join(ExerciseAttempt).join(Exercise).join(Course).filter(
            Course.category == CourseCategory(category)
        )
    
    top_users = query.limit(limit).all()
    
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

@router.get("/challenges/daily")
async def get_daily_challenge(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get today's daily coding challenge."""
    payload = get_current_user(credentials.credentials)
    user = db.query(User).filter(User.email == payload.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get today's date
    today = datetime.utcnow().date()
    
    # For now, return a random exercise as daily challenge
    # In a real implementation, you'd have a separate daily challenges table
    exercises = db.query(Exercise).filter(Exercise.difficulty == CourseLevel.INTERMEDIATE).all()
    
    if not exercises:
        raise HTTPException(status_code=404, detail="No daily challenge available")
    
    challenge = random.choice(exercises)
    
    return {
        "challenge_id": challenge.id,
        "title": f"Daily Challenge: {challenge.title}",
        "description": challenge.description,
        "difficulty": challenge.difficulty.value,
        "points": challenge.points * 2,  # Double points for daily challenge
        "estimated_time": challenge.estimated_time,
        "starter_code": challenge.starter_code,
        "date": today.isoformat(),
        "completed": False  # You'd check if user already completed today's challenge
    }

def generate_feedback(score: float, test_results: List[dict]) -> str:
    """Generate feedback based on score and test results."""
    if score >= 90:
        return "Excellent work! Your code demonstrates strong understanding of the concepts."
    elif score >= 80:
        return "Great job! Your solution is well-structured and functional."
    elif score >= 70:
        return "Good effort! Your code works but could be improved with better structure."
    elif score >= 60:
        return "Not bad! You have the basic idea but need to refine your implementation."
    else:
        return "Keep practicing! Review the concepts and try again."

def analyze_strength_areas(attempts: List[ExerciseAttempt], db: Session) -> List[str]:
    """Analyze user's strength areas based on exercise attempts."""
    strengths = []
    
    # Analyze by difficulty
    high_score_attempts = [a for a in attempts if a.score >= 80]
    if len(high_score_attempts) > len(attempts) * 0.6:
        strengths.append("High accuracy in problem solving")
    
    # Analyze by exercise type
    coding_attempts = [a for a in attempts if a.exercise and a.exercise.exercise_type == "coding"]
    if coding_attempts and sum(a.score for a in coding_attempts) / len(coding_attempts) >= 75:
        strengths.append("Strong coding skills")
    
    return strengths

def analyze_improvement_areas(attempts: List[ExerciseAttempt], db: Session) -> List[str]:
    """Analyze areas where user needs improvement."""
    improvements = []
    
    # Analyze low scores
    low_score_attempts = [a for a in attempts if a.score < 60]
    if low_score_attempts:
        improvements.append("Focus on code quality and structure")
    
    # Analyze by difficulty
    advanced_attempts = [a for a in attempts if a.exercise and a.exercise.difficulty == CourseLevel.ADVANCED]
    if advanced_attempts and sum(a.score for a in advanced_attempts) / len(advanced_attempts) < 70:
        improvements.append("Practice more advanced concepts")
    
    return improvements
