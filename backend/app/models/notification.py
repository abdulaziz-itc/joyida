from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    ntype = Column(String, default="info") # info, booking, chat, safety
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True) # stores link to booking/room id
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to User can be added to User model later if needed
