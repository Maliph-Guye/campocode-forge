from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Achievement, UserAchievement, User
from auth import get_current_user

router = APIRouter(prefix="/achievements", tags=["achievements"])
security = HTTPBearer()

# Pydantic models
class AchievementBase(BaseModel):
    name: str
    description: str
    points: int
    icon: str | None = None

class AchievementCreate(AchievementBase):
    pass

class AchievementResponse(AchievementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=AchievementResponse)
def create_achievement(
    achievement: AchievementCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new achievement."""
    db_achievement = Achievement(
        name=achievement.name,
        description=achievement.description,
        points=achievement.points,
        icon=achievement.icon
    )
    
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    
    return db_achievement

@router.get("/", response_model=List[AchievementResponse])
def get_achievements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all achievements."""
    achievements = db.query(Achievement).offset(skip).limit(limit).all()
    return achievements

@router.get("/{achievement_id}", response_model=AchievementResponse)
def get_achievement(achievement_id: int, db: Session = Depends(get_db)):
    """Get achievement by ID."""
    achievement = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    return achievement
