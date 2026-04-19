from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Ongoing"
    progress: float = 0.0
    video_url: Optional[str] = None
    category: Optional[str] = None
    views_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    is_downloaded: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None

class Project(ProjectBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
