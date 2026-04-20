from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="Ongoing") # Ongoing, Completed, Overdue
    video_url = Column(String, nullable=True)
    category = Column(String, nullable=True, index=True)
    progress = Column(Float, default=0.0)
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    is_downloaded = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    thumbnail_url = Column(String, nullable=True)
    original_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects")
    likes = relationship("ProjectLike", back_populates="project", cascade="all, delete-orphan")

class ProjectLike(Base):
    __tablename__ = "project_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    project = relationship("Project", back_populates="likes")

# Update User model to include projects relationship
# (This would usually be in models/user.py)
