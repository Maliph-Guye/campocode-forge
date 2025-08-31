from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class CourseCategory(enum.Enum):
    FRONTEND = "frontend"
    BACKEND = "backend"
    DATA_ANALYTICS = "data_analytics"

class CourseLevel(enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Learning progress
    total_points = Column(Integer, default=0)
    level = Column(String, default="Beginner")
    streak_days = Column(Integer, default=0)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    courses = relationship("Course", back_populates="instructor")
    enrollments = relationship("Enrollment", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    practice_sessions = relationship("PracticeSession", back_populates="user")
    analytics = relationship("UserAnalytics", back_populates="user")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(Enum(CourseCategory), nullable=False)
    difficulty = Column(Enum(CourseLevel), nullable=False)
    price = Column(Float, default=5000.0)  # KSH 5000
    instructor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Course metadata
    duration_hours = Column(Integer, default=40)
    total_lessons = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    prerequisites = Column(JSON, default=list)
    learning_objectives = Column(JSON, default=list)
    skills_covered = Column(JSON, default=list)
    
    # Course content
    thumbnail_url = Column(String, nullable=True)
    video_intro_url = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    
    # Relationships
    instructor = relationship("User", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")
    exercises = relationship("Exercise", back_populates="course")

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    course_id = Column(Integer, ForeignKey("courses.id"))
    order = Column(Integer)
    duration_minutes = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Lesson metadata
    lesson_type = Column(String, default="video")  # video, text, interactive
    video_url = Column(String, nullable=True)
    resources = Column(JSON, default=list)  # Additional resources
    quiz_questions = Column(JSON, default=list)
    
    # Relationships
    course = relationship("Course", back_populates="lessons")
    lesson_progress = relationship("LessonProgress", back_populates="lesson")

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    course_id = Column(Integer, ForeignKey("courses.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    order = Column(Integer)
    points = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Exercise details
    exercise_type = Column(String, default="coding")  # coding, quiz, project
    difficulty = Column(Enum(CourseLevel), default=CourseLevel.BEGINNER)
    estimated_time = Column(Integer, default=30)  # minutes
    starter_code = Column(Text, nullable=True)
    solution_code = Column(Text, nullable=True)
    test_cases = Column(JSON, default=list)
    
    # Relationships
    course = relationship("Course", back_populates="exercises")
    lesson = relationship("Lesson")
    exercise_attempts = relationship("ExerciseAttempt", back_populates="exercise")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    
    # Payment and access
    payment_status = Column(String, default="pending")  # pending, paid, refunded
    payment_amount = Column(Float, default=5000.0)
    payment_date = Column(DateTime, nullable=True)
    access_expires = Column(DateTime, nullable=True)
    
    # Progress tracking
    lessons_completed = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    total_points_earned = Column(Integer, default=0)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    lesson_progress = relationship("LessonProgress", back_populates="enrollment")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    progress_percentage = Column(Float, default=0.0)
    
    # Progress details
    time_spent_seconds = Column(Integer, default=0)
    quiz_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User")
    lesson = relationship("Lesson", back_populates="lesson_progress")
    enrollment = relationship("Enrollment", back_populates="lesson_progress")

class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Attempt details
    code_submitted = Column(Text, nullable=True)
    test_results = Column(JSON, default=list)
    score = Column(Float, default=0.0)
    points_earned = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, default=0)
    attempts_count = Column(Integer, default=1)
    
    # Relationships
    user = relationship("User")
    exercise = relationship("Exercise", back_populates="exercise_attempts")

class PracticeSession(Base):
    __tablename__ = "practice_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_type = Column(String, default="coding")  # coding, quiz, project
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    
    # Session details
    duration_minutes = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    points_earned = Column(Integer, default=0)
    difficulty_level = Column(Enum(CourseLevel), default=CourseLevel.BEGINNER)
    
    # Relationships
    user = relationship("User", back_populates="practice_sessions")

class UserAnalytics(Base):
    __tablename__ = "user_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    
    # Daily metrics
    time_spent_minutes = Column(Integer, default=0)
    lessons_completed = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    points_earned = Column(Integer, default=0)
    practice_sessions = Column(Integer, default=0)
    
    # Learning patterns
    preferred_time = Column(String, nullable=True)  # morning, afternoon, evening
    preferred_duration = Column(Integer, default=30)  # minutes
    most_active_category = Column(Enum(CourseCategory), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="analytics")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    points = Column(Integer, default=0)
    icon = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Achievement criteria
    achievement_type = Column(String, default="general")  # general, course, streak, milestone
    criteria = Column(JSON, default=dict)  # Requirements to earn
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    # Achievement context
    context_data = Column(JSON, default=dict)  # Additional data about earning
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="KSH")
    payment_method = Column(String, default="mpesa")  # mpesa, card, bank
    status = Column(String, default="pending")  # pending, completed, failed, refunded
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Payment details
    transaction_id = Column(String, nullable=True)
    payment_reference = Column(String, nullable=True)
    metadata = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User")
    course = relationship("Course")
