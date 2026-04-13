from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    media_url = Column(String, nullable=False)
    media_type = Column(String, default="image") # 'image' or 'video'
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", backref="portfolio")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    expert_id = Column(Integer, ForeignKey("users.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    expert = relationship("User", foreign_keys=[expert_id], backref="reviews_received")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviews_given")
