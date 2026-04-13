from sqlalchemy import Column, Integer, String, Boolean, Float, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Marketplace/Expert fields
    is_expert = Column(Boolean(), default=False)
    profession = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    profile_completed = Column(Boolean(), default=False)

    # Verification fields
    is_verified = Column(Boolean(), default=False)
    verification_status = Column(String, default="unverified") # unverified, pending, verified, rejected
    verification_data = Column(JSON, nullable=True) # stores document URLs, timestamps

    # Monetization fields (Freemium Subscription)
    subscription_tier = Column(String, default="free") # free, pro
    subscription_expires_at = Column(DateTime, nullable=True)

    projects = relationship("Project", back_populates="owner")
